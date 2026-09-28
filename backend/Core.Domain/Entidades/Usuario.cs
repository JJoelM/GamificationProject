using System.Text.RegularExpressions;

namespace Core.Domain.Entidades;

public class Usuario
{
    // Chequeo simple, a propósito -- no un validador RFC 5322 completo (eso
    // es un problema famoso por ser más complicado de lo que vale la pena).
    // Solo busca descartar entradas obviamente inválidas.
    private static readonly Regex FormatoEmail = new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);

    public Guid Id { get; private set; }
    public string Email { get; private set; } = default!;
    public string NombreCompleto { get; private set; } = default!;
    public Guid RolId { get; private set; }
    public Rol Rol { get; private set; } = default!;
    public string? PasswordHash { get; private set; }
    public DateOnly? FechaNacimiento { get; private set; }
    public string? EmailTutor { get; private set; }
    public EstadoCuenta EstadoCuenta { get; private set; } = EstadoCuenta.Activa;

    private Usuario() { }

    public Usuario(string email, string nombreCompleto, Guid rolId)
        : this(Guid.NewGuid(), email, nombreCompleto, rolId) { }

    public Usuario(Guid id, string email, string nombreCompleto, Guid rolId)
    {
        if (!FormatoEmail.IsMatch(email))
            throw new ArgumentException("El email no tiene un formato válido.", nameof(email));

        if (string.IsNullOrWhiteSpace(nombreCompleto) || nombreCompleto.Length > 200)
            throw new ArgumentException("El nombre completo es inválido.", nameof(nombreCompleto));

        Id = id;
        Email = email;
        NombreCompleto = nombreCompleto;
        RolId = rolId;
    }

    public void EstablecerContrasena(string passwordHash) => PasswordHash = passwordHash;

    public void RegistrarDatosDeMenor(DateOnly fechaNacimiento, string emailTutor)
    {
        if (!FormatoEmail.IsMatch(emailTutor))
            throw new ArgumentException("El email del tutor no tiene un formato válido.", nameof(emailTutor));

        FechaNacimiento = fechaNacimiento;
        EmailTutor = emailTutor;
        EstadoCuenta = EstadoCuenta.PendienteDeAprobacion;
    }

    public void RegistrarFechaNacimiento(DateOnly fechaNacimiento) => FechaNacimiento = fechaNacimiento;

    public void Activar() => EstadoCuenta = EstadoCuenta.Activa;
    public void Suspender() => EstadoCuenta = EstadoCuenta.Suspendida;
}