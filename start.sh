#!/bin/sh
set -e

# 1. Inicia el microservicio de IA en loopback privado (127.0.0.1:8001),
#    totalmente inaccesible desde Internet.
cd /app/ai-service
python3 -m uvicorn main:app --host 127.0.0.1 --port 8001 &

# 2. Inicia la WebAPI de .NET 9 en el puerto público expuesto a Render.
cd /app/backend
exec dotnet WebApi.dll
