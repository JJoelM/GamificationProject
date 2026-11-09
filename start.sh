#!/bin/sh
set -e

# 1. Inicia y supervisa el microservicio de IA en loopback privado (127.0.0.1:8001),
#    totalmente inaccesible desde Internet. Si el proceso cae por cualquier motivo,
#    se reinicia automáticamente a los 2 segundos.
(
  cd /app/ai-service
  while true; do
    python3 -m uvicorn main:app --host 127.0.0.1 --port 8001
    echo "[ai-service] Proceso terminado inesperadamente, reiniciando en 2s..." >&2
    sleep 2
  done
) &

# 2. Inicia la WebAPI de .NET 9 como proceso principal en el puerto público expuesto a Render.
cd /app/backend
exec dotnet WebApi.dll
