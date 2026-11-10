# Etapa 1: Compilación del Backend .NET 9
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-dotnet
WORKDIR /src

COPY ["backend/Directory.Packages.props", "./"]
COPY ["backend/Core.Domain/Core.Domain.csproj", "Core.Domain/"]
COPY ["backend/Core.Application/Core.Application.csproj", "Core.Application/"]
COPY ["backend/Infrastructure/Infrastructure.csproj", "Infrastructure/"]
COPY ["backend/WebApi/WebApi.csproj", "WebApi/"]

RUN dotnet restore "WebApi/WebApi.csproj"

COPY ["backend/Core.Domain/", "Core.Domain/"]
COPY ["backend/Core.Application/", "Core.Application/"]
COPY ["backend/Infrastructure/", "Infrastructure/"]
COPY ["backend/WebApi/", "WebApi/"]

WORKDIR "/src/WebApi"
RUN dotnet publish "WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa 2: Imagen Final Unificada (.NET 9 Runtime + Python 3 para FastAPI en 127.0.0.1)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/* \
    && adduser --disabled-password --gecos "" appuser

COPY ["ai-service/requirements.txt", "/app/ai-service/requirements.txt"]
RUN pip3 install --no-cache-dir --break-system-packages -r /app/ai-service/requirements.txt

COPY ["ai-service/main.py", "ai-service/contenido.py", "ai-service/esquemas.py", "/app/ai-service/"]
COPY --from=build-dotnet /app/publish /app/backend/
COPY ["start.sh", "/app/start.sh"]

RUN sed -i 's/\r$//' /app/start.sh && chmod +x /app/start.sh && chown -R appuser:appuser /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://+:8080 \
    AiService__BaseUrl=http://127.0.0.1:8001

USER appuser
EXPOSE 8080

CMD ["/app/start.sh"]
