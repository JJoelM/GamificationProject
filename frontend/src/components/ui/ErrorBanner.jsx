import { useEffect, useRef } from 'react';
import MascotFace from './MascotFace';
import Button from './Button';
import Card from './Card';
import { scrollElementIntoView } from '../../utils/scrollHelper';

/**
 * ErrorBanner — Componente de Error Humanizado con Carita Expresiva y Auto-Scroll
 *
 * Mapea errores ProblemDetails y validaciones cliente:
 * · 400 → carita 'worried' (error en formulario o datos inválidos)
 * · 401 → carita 'confused' (no autorizado / credenciales)
 * · 403 → carita 'forbidden' (acceso no permitido a aula o zona)
 * · 404 → carita 'confused' (no encontrado)
 * · 409 → carita 'blocked' (conflicto de estado de la misión)
 * · 429 → carita 'worried' (límite de peticiones / rate limit)
 * · 500 → carita 'sad' (mensaje neutro de servidor)
 * · waking-up → carita 'worried' (servidor en reposo despertando)
 * · network → carita 'disconnected' (sin conexión con el backend)
 * · client-validation → carita 'worried' (mensaje de validación de formulario)
 *
 * Props:
 * · error       — objeto { status, title, detail, isApiError, message } o string
 * · onDismiss   — callback para cerrar
 * · onRetry     — callback para reintentar
 * · variant     — 'full' | 'card' | 'inline' (por defecto: 'card' si hay onDismiss, 'full' si no)
 * · autoScroll  — boolean (por defecto true, centra suavemente el error en la vista)
 * · className   — clases CSS adicionales
 */

const MESSAGES = {
  401: {
    title: 'Sesión no válida o expirada',
    description: 'Tus credenciales no son válidas o tu sesión ha caducado. Inicia sesión nuevamente.',
    expression: 'confused',
  },
  403: {
    title: 'Acceso no permitido (´• ω •`)ﾉ',
    description: 'No estás inscripto en esta aula o tu personaje no tiene autorización para esta zona (っ- ‸ - ς).',
    expression: 'forbidden',
  },
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
  429: {
    title: '¡Demasiadas solicitudes! (っ- ‸ - ς)',
    description: 'Has superado el límite de intentos permitidos en este momento. Espera un minuto antes de reintentar.',
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
  variant,
  autoScroll = true,
  className = '',
}) {
  const bannerRef = useRef(null);

  // Auto-scroll táctil y accesible cuando se produce o cambia el error
  useEffect(() => {
    if (error && autoScroll && bannerRef.current) {
      const cancelScroll = scrollElementIntoView(bannerRef, {
        delay: 60,
        behavior: 'smooth',
        block: 'center',
        focus: true,
      });
      return cancelScroll;
    }
  }, [error, autoScroll]);

  if (!error) return null;

  let title = 'Ha ocurrido un error inesperado';
  let description = 'Ocurrió un problema al procesar tu solicitud.';
  let detail = null;
  let expression = 'sad';

  // 1. Manejo de error si es un texto / string directo
  if (typeof error === 'string') {
    title = 'Atención (っ- ‸ - ς)';
    description = error;
    expression = 'worried';
  }
  // 2. Error de validación local del cliente (ej. { message: '...' })
  else if (error.message && !error.status && !error.isApiError && !error.detail) {
    title = error.title || 'Atención (っ- ‸ - ς)';
    description = error.message;
    expression = error.expression || 'worried';
  }
  // 3. Servidor despertando (Cold Start / 502 / 503)
  else if (error.isWakingUp || error.status === 502 || error.status === 503) {
    title = error.title || 'El Reino se está despertando...';
    description =
      error.detail ||
      'El servidor está iniciando sus servicios mágicos en la nube. Aguarda unos segundos...';
    expression = 'worried';
    detail = error.detail && error.detail !== description ? error.detail : null;
  }
  // 4. Error de red (status 0 o sin isApiError)
  else if (error.status === 0 || (!error.isApiError && !error.status)) {
    title = MESSAGES.network.title;
    description = MESSAGES.network.description;
    expression = MESSAGES.network.expression;
    detail = error.detail || error.message || null;
  }
  // 5. 409 Conflicto de estado pedagógico / dominio
  else if (error.status === 409) {
    title = error.title || 'Operación no permitida';
    description = 'Esta acción no es válida en el estado actual de la misión o aula.';
    detail = error.detail || null;
    expression = 'blocked';
  }
  // 6. Códigos HTTP estándar mapeados (400, 401, 403, 404, 429, 500)
  else if (MESSAGES[error.status]) {
    const config = MESSAGES[error.status];
    title = error.title || config.title;
    description = config.description;
    expression = config.expression;
    if (error.detail) {
      detail = error.detail;
    }
  }
  // 7. Cualquier otro código HTTP del backend
  else {
    title = error.title || `Error del servidor (${error.status || 'desconocido'})`;
    description = error.detail || 'Ocurrió un error inesperado al comunicarse con la plataforma.';
    detail = error.detail && error.detail !== description ? error.detail : null;
  }

  // Determinar variante óptima:
  // Si no se especifica, los banners interactivos (con onDismiss) usan 'card' para integrarse al formulario
  const resolvedVariant = variant || (onDismiss ? 'card' : 'full');

  // Vista completa / centrada (al menos 55% de la altura de la página)
  if (resolvedVariant === 'full') {
    return (
      <div
        ref={bannerRef}
        role="alert"
        aria-live="assertive"
        tabIndex={-1}
        className={[
          'w-full min-h-[55vh] flex flex-col items-center justify-center p-6 text-center animate-fade-up outline-none focus:outline-none',
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
              <strong className="font-sans block mb-1 font-semibold text-[var(--brand-crimson)]">
                Detalle del sistema:
              </strong>
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

  // Variante tarjeta compacta / modal / formulario
  return (
    <div
      ref={bannerRef}
      tabIndex={-1}
      className="w-full my-2 outline-none focus:outline-none"
    >
      <Card
        variant="danger"
        role="alert"
        aria-live="assertive"
        className={[
          'flex flex-col items-center text-center p-5 gap-3 border-2 border-[var(--brand-crimson)] shadow-[4px_4px_0px_var(--brand-crimson)] animate-shake',
          className,
        ].join(' ')}
      >
        <MascotFace expression={expression} compact className="py-1" />

        <div className="max-w-md flex flex-col items-center gap-1.5">
          <h4 className="font-display font-bold text-lg text-[var(--brand-crimson)]">
            {title}
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>

          {detail && (
            <p className="mt-1 text-xs text-[var(--text-primary)] bg-[var(--bg-base)] p-2.5 rounded-lg border border-[var(--border-muted)] text-left w-full break-words font-mono">
              {detail}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2">
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
    </div>
  );
}

export default ErrorBanner;
