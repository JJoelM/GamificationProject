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

  // Filtrar cabeceras eliminando hop-by-hop headers y cabeceras internas de Cloudflare
  // (crucial para evitar detección de bucle 'CDN-Loop: cloudflare' en el edge de Render)
  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey === 'host' ||
      lowerKey.startsWith('cf-') ||
      lowerKey === 'cdn-loop' ||
      lowerKey === 'x-real-client-ip' ||
      lowerKey === 'x-proxy-secret' ||
      lowerKey === 'x-forwarded-host' ||
      lowerKey === 'x-forwarded-proto'
    ) {
      continue;
    }
    headers.set(key, value);
  }

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

    // Si Render devuelve 502 o 503 (servidor en reposo o iniciando contenedor)
    if (response.status === 502 || response.status === 503) {
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
