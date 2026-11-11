/**
 * Cloudflare Pages Function — Reverse Proxy Same-Origin para /api/*
 *
 * Permite mantener las cookies de sesión JWT con `SameSite=Strict` y `HttpOnly`
 * en producción sin exponer la URL de Render al navegador ni sufrir bloqueos de
 * cookies de terceros en Safari / iOS / Brave.
 *
 * Configuración en Cloudflare Pages -> Settings -> Environment Variables:
 *   BACKEND_URL  = https://tu-servicio-backend.onrender.com
 *   PROXY_SECRET = (Opcional, mismo valor que ProxySecret en Render para blindar IP real)
 */
export async function onRequest(context) {
  const { request, env } = context;
  const backendBaseUrl = (env.BACKEND_URL || '').replace(/\/+$/, '');

  if (!backendBaseUrl) {
    return new Response(
      JSON.stringify({
        title: 'Configuración de proxy incompleta',
        detail: 'Falta definir la variable de entorno BACKEND_URL en Cloudflare Pages.',
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${incomingUrl.pathname}${incomingUrl.search}`, backendBaseUrl);

  // Copiar cabeceras eliminando hop-by-hop headers y headers de Cloudflare
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('cf-connecting-ip');
  headers.delete('cf-ipcountry');
  headers.delete('cf-ray');
  headers.delete('cf-visitor');
  headers.delete('x-real-client-ip');
  headers.delete('x-proxy-secret');
  headers.delete('x-forwarded-host'); // No enviar el host de Cloudflare para que el enrutador de Render no busque un dominio inexistente

  // Fijar el Host explícito hacia el hostname de Render
  headers.set('Host', targetUrl.host);
  headers.set('X-Forwarded-Proto', incomingUrl.protocol.replace(':', ''));

  const clientIp = request.headers.get('CF-Connecting-IP');
  if (clientIp) {
    headers.set('X-Forwarded-For', clientIp);
    headers.set('X-Real-Client-IP', clientIp);
  }

  if (env.PROXY_SECRET) {
    headers.set('X-Proxy-Secret', env.PROXY_SECRET);
  }

  const init = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
    init.duplex = 'half';
  }

  try {
    const response = await fetch(targetUrl.toString(), init);

    // Si Render devuelve 502 o 503 con su página de error o cabecera x-render-routing (servidor dormido o iniciando)
    const isRenderWakingUp = response.status === 502 || response.status === 503;
    const renderRouting = response.headers.get('x-render-routing');
    const isHtml = (response.headers.get('content-type') || '').includes('text/html');

    if (isRenderWakingUp && (renderRouting || isHtml)) {
      return new Response(
        JSON.stringify({
          title: 'Servidor despertando (っ˘ω˘ς )',
          detail: 'El servidor backend está despertando de su modo reposo. Aguardá unos segundos...',
          isWakingUp: true,
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Server-Waking-Up': 'true',
          },
        }
      );
    }

    // El runtime de Cloudflare descomprime automáticamente respuestas gzip/br;
    // eliminamos content-encoding y content-length para evitar ERR_CONTENT_DECODING_FAILED en el navegador.
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch {
    return new Response(
      JSON.stringify({
        title: 'Servidor despertando (っ˘ω˘ς )',
        detail: 'El servidor backend está iniciando o no pudo ser contactado. Aguardá unos segundos...',
        isWakingUp: true,
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Server-Waking-Up': 'true',
        },
      }
    );
  }
}
