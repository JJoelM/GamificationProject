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
  const targetUrl = `${backendBaseUrl}${incomingUrl.pathname}${incomingUrl.search}`;

  const headers = new Headers(request.headers);
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

  const response = await fetch(targetUrl, init);

  const responseHeaders = new Headers(response.headers);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
