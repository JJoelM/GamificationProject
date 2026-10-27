namespace Core.Application.Common;

public static class ValidadorPassword
{
    public const int LongitudMinima = 8;

    public static void Validar(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < LongitudMinima)
            throw new ArgumentException($"La contraseña debe tener al menos {LongitudMinima} caracteres.");

        if (!password.Any(char.IsUpper))
            throw new ArgumentException("La contraseña debe incluir al menos una letra mayúscula.");

        if (!password.Any(char.IsLower))
            throw new ArgumentException("La contraseña debe incluir al menos una letra minúscula.");

        if (!password.Any(char.IsDigit))
            throw new ArgumentException("La contraseña debe incluir al menos un número.");

        if (!password.Any(ch => !char.IsLetterOrDigit(ch)))
            throw new ArgumentException("La contraseña debe incluir al menos un carácter especial (!@#$%^&*...).");
    }
}
