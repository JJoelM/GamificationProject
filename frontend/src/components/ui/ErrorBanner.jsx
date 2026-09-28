import MascotFace from './MascotFace';
import Button from './Button';
import Card from './Card';

/**
 * ErrorBanner — Componente de Error Humanizado con Carita Expresiva
 *
 * Mapea errores ProblemDetails según la especificación:
 * · 404 → carita 'confused' (no encontrado)
 * · 409 → carita 'blocked' (muestra el detail literal pensado para el docente)
 * · 400 → carita 'worried' (error en formulario)
 * · 500 → carita 'sad' (mensaje neutro, no repite el detail genérico)
 * · network → carita 'disconnected'
 *
 * Props:
 * · error       — objeto de error { status, title, detail, isApiError }
 * · onDismiss   — callback para cerrar
 * · onRetry     — callback para reintentar
 * · variant     — 'full' (centrado ocupando 50% del espacio con carita) | 'card' (tarjeta prominente) | 'inline'
 */

const MESSAGES = {
  404: {
    title: 'No encontramos ese recurso',
    description: 'Parece que esta misión o página ya no existe o fue movida.',
    expression: 'confused',
  },
  400: {
    title: 'Datos incompletos o incorrectos',
    description: 'Revisa los campos del formulario para continuar.',
    expression: 'worried',
  },
  500: {
    title: 'Algo salió mal en el servidor',
    description: 'Nuestros magos están trabajando para resolverlo. Intenta de nuevo en unos minutos.',
    expression: 'sad',
  },
  network: {
    title: 'Sin conexión con el servidor',
    description: 'No pudimos conectar con el backend. ¿Está encendido el servicio en el puerto correspondiente?',
    expression: 'disconnected',
  },
};

function ErrorBanner({
  error,
  onDismiss,
  onRetry,
  variant = 'full',
  className = '',
}) {
  if (!error) return null;

  let title = 'Ha ocurrido un error inesperado';
  let description = 'Ocurrió un problema al procesar tu solicitud.';
  let detail = null;
  let expression = 'sad';

  if (!error.isApiError) {
    // Error de red
    title = MESSAGES.network.title;
    description = MESSAGES.network.description;
    expression = MESSAGES.network.expression;
    detail = error.detail || null;
  } else if (error.status === 409) {
    // 409 Conflicto: el backend redacta el detail para el docente
    title = error.title || 'Operación no permitida';
    description = 'Esta transición de estado no es válida en este momento.';
    detail = error.detail || null;
    expression = 'blocked';
  } else if (MESSAGES[error.status]) {
    const config = MESSAGES[error.status];
    title = config.title;
    description = config.description;
    expression = config.expression;
    if (error.status === 400 && error.detail) {
      detail = error.detail;
    }
  } else {
    title = error.title || `Error del servidor (${error.status})`;
    description = 'Ocurrió un error inesperado al comunicarse con la plataforma.';
  }

  // Vista completa / centrada (al menos 50% de la altura de la página)
  if (variant === 'full') {
    return (
      <div
        role="alert"
        className={[
          'w-full min-h-[55vh] flex flex-col items-center justify-center p-6 text-center animate-fade-up',
          className,
        ].join(' ')}
      >
        {/* Carita expresiva ocupando el espacio principal */}
        <MascotFace expression={expression} className="mb-2" />

        {/* Mensaje estructurado */}
        <div className="max-w-md flex flex-col items-center gap-2">
          <h3 className="font-display font-bold text-2xl text-[var(--text-primary)]">
            {title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>

          {detail && (
            <div className="w-full mt-2 p-3 text-xs rounded-[10px_14px_12px_12px] bg-[var(--bg-accent)] border border-[var(--border-muted)] text-[var(--text-primary)] font-mono text-left break-words">
              <strong className="font-sans block mb-1 font-semibold text-[var(--brand-crimson)]">Detalle del sistema:</strong>
              {detail}
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-3 mt-4">
            {onRetry && (
              <Button variant="primary" onClick={onRetry}>
                Reintentar
              </Button>
            )}
            {onDismiss && (
              <Button variant="ghost" onClick={onDismiss}>
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Variante tarjeta compacta / modal
  return (
    <Card
      variant="danger"
      role="alert"
      className={[
        'flex flex-col items-center text-center p-6 gap-3 animate-scale-in',
        className,
      ].join(' ')}
    >
      <MascotFace expression={expression} className="min-h-[30vh] py-2" />

      <div className="max-w-md flex flex-col items-center gap-1.5">
        <h4 className="font-display font-bold text-lg text-[var(--brand-crimson)]">
          {title}
        </h4>
        <p className="text-xs text-[var(--text-secondary)]">
          {description}
        </p>

        {detail && (
          <p className="mt-1 text-xs text-[var(--text-primary)] bg-[var(--bg-base)] p-2 rounded-lg border border-[var(--border-muted)] text-left w-full break-words">
            {detail}
          </p>
        )}
      </div>

      <div className="flex gap-2 mt-2">
        {onRetry && (
          <Button size="sm" variant="primary" onClick={onRetry}>
            Reintentar
          </Button>
        )}
        {onDismiss && (
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            Entendido
          </Button>
        )}
      </div>
    </Card>
  );
}

export default ErrorBanner;
