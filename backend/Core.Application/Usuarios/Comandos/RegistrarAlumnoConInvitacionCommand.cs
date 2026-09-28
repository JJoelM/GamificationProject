using Core.Application.Common;
using Core.Domain.Entidades;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Core.Application.Usuarios.Comandos;

public sealed record RegistrarAlumnoConInvitacionCommand(
    string CodigoInvitacion,
    string Email,
    string NombreCompleto,
    string Password,
    DateOnly FechaNacimiento,
    string? EmailTutor) : IRequest<ResultadoRegistroAlumno>;

public sealed record ResultadoRegistroAlumno(Guid AlumnoId, Guid AulaId, bool RequiereAprobacionParental);

public sealed class RegistrarAlumnoConInvitacionCommandHandler
    : IRequestHandler<RegistrarAlumnoConInvitacionCommand, ResultadoRegistroAlumno>
{
    // La Ley 25.326 no fija una edad numérica exacta para esto -- umbral
    // conservador propio, para disparar revisión humana, no una regla legal
    // confirmada. Verificar con una fuente real antes de un entorno de producción.
    private const int EdadMinimaSinAprobacionParental = 16;
    private const int LongitudMinimaPassword = 8;

    private readonly IApplicationDbContext _db;
    private readonly PasswordHasher<Usuario> _hasher = new();

    public RegistrarAlumnoConInvitacionCommandHandler(IApplicationDbContext db) => _db = db;

    public async Task<ResultadoRegistroAlumno> Handle(
        RegistrarAlumnoConInvitacionCommand request, CancellationToken cancellationToken)
    {
        if (request.Password.Length < LongitudMinimaPassword)
            throw new ArgumentException($"La contraseña debe tener al menos {LongitudMinimaPassword} caracteres.");

        var aula = await _db.Aulas.FirstOrDefaultAsync(a => a.CodigoInvitacion == request.CodigoInvitacion, cancellationToken)
            ?? throw new ArgumentException("El código de invitación no es válido.");

        if (await _db.Usuarios.AnyAsync(u => u.Email == request.Email, cancellationToken))
            throw new ArgumentException("Ya existe una cuenta registrada con ese email.");

        var rolAlumno = await _db.Roles.FirstOrDefaultAsync(r => r.Nombre == "Alumno", cancellationToken)
            ?? throw new InvalidOperationException("El rol 'Alumno' no está sembrado en la base.");

        var esMenor = CalcularEdad(request.FechaNacimiento) < EdadMinimaSinAprobacionParental;

        if (esMenor && string.IsNullOrWhiteSpace(request.EmailTutor))
            throw new ArgumentException("Los menores de edad deben registrar el email de un tutor.");

        var usuario = new Usuario(request.Email, request.NombreCompleto, rolAlumno.Id);
        usuario.EstablecerContrasena(_hasher.HashPassword(usuario, request.Password));

        if (esMenor)
            usuario.RegistrarDatosDeMenor(request.FechaNacimiento, request.EmailTutor!);
        else
            usuario.RegistrarFechaNacimiento(request.FechaNacimiento);

        _db.Add(usuario);
        _db.Add(new Inscripcion(aula.Id, usuario.Id));
        await _db.SaveChangesAsync(cancellationToken);

        return new ResultadoRegistroAlumno(usuario.Id, aula.Id, esMenor);
    }

    private static int CalcularEdad(DateOnly fechaNacimiento)
    {
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        var edad = hoy.Year - fechaNacimiento.Year;
        if (fechaNacimiento > hoy.AddYears(-edad)) edad--;
        return edad;
    }
}