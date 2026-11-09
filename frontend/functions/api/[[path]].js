/**
 * Cloudflare Pages Function — Reverse Proxy Same-Origin para /api/*
 *
 * Permite mantener las cookies de sesión JWT con `SameSite=Strict` y `HttpOnly`
 * en producción sin exponer la URL de Render al navegador ni sufrir bloqueos de
 * cookies de terceros en Safari / iOS / Brave.
 *
 * Configuración en Cloudflare Pages -> Settings -> Environment Variables:
 *   BACKEND_URL = https://tu-servicio-backend.onrender.com
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

  // Copiar cabeceras eliminando hop-by-hop headers y 'host' para evitar Error 1003 / 421 en Render
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('cf-connecting-ip');
  headers.delete('cf-ipcountry');
  headers.delete('cf-ray');
  headers.delete('cf-visitor');

  headers.set('X-Forwarded-Host', incomingUrl.host);
  headers.set('X-Forwarded-Proto', incomingUrl.protocol.replace(':', ''));

  const clientIp = request.headers.get('CF-Connecting-IP');
  if (clientIp) {
    headers.set('X-Forwarded-For', clientIp);
  }

  const init = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  try {
    const response = await fetch(targetUrl.toString(), init);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return new Response(
      JSON.stringify({
        title: 'Servidor despertando o no disponible',
        detail: 'El servidor backend está iniciando o no pudo ser contactado. Intentá nuevamente en unos segundos.',
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}
