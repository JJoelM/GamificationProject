# Armored — Plataforma de Gamificación Educativa con IA (HITL)

Sistema web integral de gamificación educativa con generación de contenido asistida por Inteligencia Artificial bajo el esquema **HITL** (*Human-in-the-Loop*): la IA propone desafíos curriculares y mecánicas de juego, mientras que el docente inspecciona, ajusta y valida antes de la publicación en el aula. Desarrollado como Proyecto Final de Carrera (Licenciatura en Sistemas de Información, FaCENA - UNNE).

[![CI Pipeline](https://github.com/JJoelM/GamificationProject/actions/workflows/ci.yml/badge.svg)](https://github.com/JJoelM/GamificationProject/actions/workflows/ci.yml)
[![Seguridad y Análisis Estático](https://github.com/JJoelM/GamificationProject/actions/workflows/security.yml/badge.svg)](https://github.com/JJoelM/GamificationProject/actions/workflows/security.yml)
[![.NET](https://img.shields.io/badge/.NET-9.0-purple.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162-teal.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue.svg)](https://www.postgresql.org/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Deployed-orange.svg)](https://pages.cloudflare.com/)
[![Render](https://img.shields.io/badge/Render-Docker_Service-46E3B7.svg)](https://render.com/)
[![Neon](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599.svg)](https://neon.tech/)

---

## 🏛️ Arquitectura del Sistema

El sistema implementa una arquitectura desacoplada basada en microservicios, **CQRS** (*Command Query Responsibility Segregation*) y **Event Sourcing híbrido** (Ledger inmutable de eventos de dominio + Proyecciones de lectura en PostgreSQL).

### Topología de Despliegue en Producción

```mermaid
flowchart LR
    subgraph CF["1. Borde: Cloudflare Pages"]
        SPA["Frontend SPA\n(React 19 + Vite 8)"]
        Proxy["Pages Function Proxy\n(/api/* -> [[path]].js)"]
        SPA -->|"Same-Origin Cookies\nHttpOnly / SameSite=Strict"| Proxy
    end

    subgraph RN["2. Cómputo: Render (Contenedor Docker Unificado)"]
        API["Backend API\n(.NET 9 WebAPI :$PORT)"]
        Supervisor["start.sh (Supervisor Loop)"]
        IA["Microservicio IA\n(Python FastAPI :8001)"]

        Supervisor --> API
        Supervisor -->|"Auto-restart loop"| IA
        Proxy -->|"HTTPS + X-Proxy-Secret\nX-Real-Client-IP"| API
        API -->|"Loopback 127.0.0.1\n+ X-Internal-Token"| IA
    end

    subgraph EXT["3. Servicios Externos"]
        DB[("Neon Serverless\nPostgreSQL 17 (SSL)")]
        Gemini["Google Gemini API\n(gemini-3.5-flash-lite)"]

        API -->|"EF Core 9 / Npgsql\n(SSL Mode=Require)"| DB
        IA -->|"google-genai SDK\n(Round-Robin Keys)"| Gemini
    end
```

### Tabla de Componentes Tecnológicos

| Capa / Servicio | Tecnologías Principales | Entorno Local | Entorno Producción |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, TanStack React Query v5, Zustand, Framer Motion, Lucide | `http://localhost:5173` | **Cloudflare Pages** (CDN global estático) |
| **Borde / Proxy** | Cloudflare Pages Function (`frontend/functions/api/[[path]].js`) | Vite Proxy interno | **Cloudflare Pages Function** (Reverse Proxy Same-Origin) |
| **Backend API** | .NET 9 Minimal APIs, EF Core 9, MediatR, Npgsql, JWT | `http://localhost:5230` | **Render.com** (Docker Runtime, puerto dinámico `$PORT`) |
| **Microservicio IA** | Python 3.12, FastAPI, Uvicorn, SDK oficial `google-genai` | `http://127.0.0.1:8001` | **Render.com** (Aislado en loopback `127.0.0.1:8001`) |
| **Persistencia** | PostgreSQL 17 (Ledger de Eventos + Proyecciones de Lectura) | Docker Compose (`:5432`) | **Neon.tech** (PostgreSQL Serverless, pooled con SSL) |
| **Modelo de IA** | `gemini-3.5-flash-lite` con rotación round-robin de API keys | Google AI Studio | Google AI Studio |

---

## 🎮 Tipos de Misiones y Mecánicas de Gamificación

1. **Opción Múltiple Interactiva**:
   * Cuestionarios temáticos generados con rigor pedagógico a partir de material de estudio.
   * Retroalimentación inmediata con explicación teórica y calibración de recompensas en XP (Experiencia) y AP (Puntos de Acción).
2. **Batalla de Jefe (Boss Fight)**:
   * Combate estructurado por fases contra la personificación de conceptos complejos (ej. *El Bug Ancestral*).
   * Barra de vida del jefe sincronizada, penalizaciones visuales dinámicas (*temblor*, *destello*, *enfriamiento*) y daño acumulativo por respuesta correcta.
3. **Línea Temporal (Secuencia de Procesos / Histórica)**:
   * Reconstrucción cronológica mediante ordenamiento interactivo de hitos o eventos desordenados.
   * Identificación del detonante o evento culpable (*root-cause analysis*) que desencadena un estado erróneo.

---

## 🛡️ Seguridad, Privacidad y Hardening Perimetral

* **Cookies Same-Origin sin Bloqueos de Terceros:**
  El proxy en Cloudflare Pages canaliza el tráfico `/api/*` hacia Render bajo el mismo dominio de origen, permitiendo cookies JWT con `SameSite=Strict`, `HttpOnly` y `Secure` sin sufrir restricciones en navegadores como Safari, iOS o Brave.
* **Anti-Spoofing en Rate Limiting (`X-Proxy-Secret`):**
  Un secreto compartido validado en tiempo constante (`CryptographicOperations.FixedTimeEquals`) garantiza que la IP real reenviada por Cloudflare (`X-Real-Client-IP`) sea auténtica, bloqueando intentos de fuerza bruta con encabezados `X-Forwarded-For` falsificados.
* **Anti-Trampas en el Payload del Alumno:**
  El módulo `SanitizadorPayloadMision` expurga las claves `respuestaCorrecta`, `explicacion`, `ordenCorrecto` y `eventoCulpableId` antes de transmitir las misiones activas al navegador del estudiante.
* **Aislamiento del Servicio de IA:**
  FastAPI escucha estrictamente en el loopback privado `127.0.0.1:8001` sin puerto público expuesto, autenticado mediante `X-Internal-Token` verificado en tiempo constante (`secrets.compare_digest`), mitigando ataques de temporización (*timing attacks*).
* **Sanitización de Errores y Mitigación de Prompt Injection:**
  Los errores internos de IA nunca se exponen al cliente (se registran en `ILogger` y devuelven respuestas genéricas). Los textos de estudio se encapsulan entre delimitadores estrictos `###` para neutralizar inyecciones de prompt.
* **CORS Blindado y Headers de Seguridad:**
  Se eliminó el reflejo dinámico de orígenes no autorizados en excepciones (CWE-942) y se inyectaron cabeceras estrictas (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `robots.txt` para rutas privadas).

---

## 🚀 Despliegue en Producción

La plataforma está configurada y optimizada para operar en la tríada **Cloudflare Pages + Render + Neon**:

```text
┌─────────────────────────┐       HTTPS       ┌─────────────────────────┐       SSL       ┌─────────────────────────┐
│     Cloudflare Pages    │ ────────────────> │        Render.com       │ ────────────> │       Neon Postgres     │
│  (Frontend React + SPA) │   Proxy /api/*    │  (Docker .NET 9 + IA)   │   Npgsql EF 9   │  (Serverless Database)  │
└─────────────────────────┘                   └─────────────────────────┘                 └─────────────────────────┘
```

### 1. Base de Datos en Neon
1. Crear el proyecto en [Neon Console](https://console.neon.tech).
2. Obtener la cadena de conexión con SSL obligatorio:
   ```text
   postgresql://<usuario>:<password>@<endpoint>.neon.tech/<basedatos>?sslmode=require
   ```
3. El backend convierte automáticamente la URI al formato Key-Value requerido por Npgsql mediante `NormalizarConnectionStringPostgres`.

### 2. Backend y Servicio de IA en Render (Docker Unificado)
El contenedor unificado (`Dockerfile` multi-stage) ejecuta .NET 9 y FastAPI conjuntamente, orquestado mediante `start.sh`:
1. Crear un Web Service en [Render](https://render.com) apuntando al repositorio (Runtime: **Docker**).
2. Definir las siguientes variables de entorno:

| Variable | Descripción | Ejemplo / Valor |
| :--- | :--- | :--- |
| `ConnectionStrings__DefaultConnection` | Conexión a Neon PostgreSQL | `postgresql://user:pass@ep-...neon.tech/neondb?sslmode=require` |
| `GEMINI_API_KEY` | Clave(s) de Gemini AI Studio | `AIzaSy...` (o múltiples separadas por coma) |
| `SeedDemoPassword` | Contraseña privada para cuentas demo | *(Clave privada elegida para producción)* |
| `ProxySecret` | Token de autenticación del proxy | *(Cadena aleatoria secreta compartida)* |
| `FrontendUrl` | Dominio público del Frontend | `https://tu-proyecto.pages.dev` |
| `ApplyMigrationsOnStartup` | Aplica migraciones EF Core en inicio | `true` |
| `SeedDemoData` | Siembra roles y datos iniciales de demo | `true` |
| `ASPNETCORE_ENVIRONMENT` | Entorno de ejecución .NET | `Production` |
| `ENVIRONMENT` | Entorno de ejecución Python | `production` |
| `AiService__TokenInterno` | Token interno de comunicación | *(Autogenerado o generado por Render)* |
| `JwtSettings__Secret` | Secreto de firma JWT (mín. 32 car.) | *(Autogenerado o generado por Render)* |

### 3. Frontend en Cloudflare Pages
1. Crear un proyecto en Cloudflare Pages vinculado al repositorio de GitHub.
2. Parámetros de compilación:
   - **Framework Preset:** `React (Vite)`
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Variables de entorno en Cloudflare Pages:
   - `BACKEND_URL`: URL pública de Render (ej. `https://tu-api.onrender.com`, sin barra final).
   - `PROXY_SECRET`: El mismo valor secreto configurado en Render (obligatorio en producción; el backend bloquea con `403` cualquier petición directa a `/api/*` sin este secreto).
   - `VITE_BACKEND_WAKEUP_URL`: URL pública de Render (`https://tu-api.onrender.com`) para enviar únicamente el ping `GET /health` de despertar cuando el servicio gratuito esté en reposo.

   > **Nota de operación y seguridad:** El bloqueo `403` protege toda la API (`/api/*`) contra acceso directo sin el proxy, mientras que `/health` permanece público por diseño y no consulta la base de datos (por lo que ni el despertar del frontend ni el *healthcheck* de Render mantienen activa la cuota de cómputo de Neon). En Render, asegúrate de configurar el *Health Check Path* en `/health` (no `/api/health`) para evitar respuestas `403` al no incluir `X-Proxy-Secret`.

---

## 💻 Puesta en Marcha en Desarrollo Local

### Requisitos Previos
* Docker Desktop (o Docker Engine con Compose)
* .NET 9 SDK
* Node.js v20+ y `npm`
* Python 3.11+
* API Key de Google Gemini

### 1. Clonar y Configurar Entornos
```bash
git clone https://github.com/JJoelM/GamificationProject.git
cd GamificationProject

# Variables locales de Docker y Base de Datos
cp .env.example .env

# Microservicio de IA
cp ai-service/.env.example ai-service/.env
# Editar ai-service/.env con tu GEMINI_API_KEY y un TOKEN_INTERNO_BACKEND

# Backend .NET
cp backend/WebApi/appsettings.Development.json.example backend/WebApi/appsettings.Development.json
```

### 2. Levantar Base de Datos y Aplicar Migraciones
```bash
# Iniciar contenedor local de PostgreSQL
docker compose up -d

# Aplicar migraciones con EF Core CLI
cd backend
dotnet ef database update --project Infrastructure --startup-project WebApi
cd ..
```

### 3. Iniciar Microservicio de IA (FastAPI)
```bash
cd ai-service
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### 4. Iniciar Backend (.NET 9 WebAPI)
```bash
cd backend/WebApi
dotnet run
```
*API disponible en `http://localhost:5230` (OpenAPI Scalar en `http://localhost:5230/scalar`).*

### 5. Iniciar Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```
*Aplicación web disponible en `http://localhost:5173`.*

---

## 🔑 Credenciales de Prueba (Seed de Desarrollo)

En entorno local (`Development`), la contraseña predeterminada de todas las cuentas sembradas es: `Cambiar123!`

| Rol | Correo Electrónico | Alcance de Permisos |
| :--- | :--- | :--- |
| **Docente** | `docente@unne.edu.ar` | Creación de aulas, generación y validación HITL de misiones, métricas formativas |
| **Alumno 1** | `joel@alumno.unne.edu.ar` | Tablero de misiones, resolución de ejercicios, progreso RPG y Bazar |
| **Alumno 2** | `lucia@alumno.unne.edu.ar` | Cuenta activa con misiones previas resueltas y cosméticos equipados para Leaderboard |
| **Directivo** | `directivo@unne.edu.ar` | Supervisión institucional, métricas globales y aprobación de cuentas |
| **Administrador** | `admin@unne.edu.ar` | Gestión de usuarios, cambio de estados de cuenta y administración de la plataforma |

> [!NOTE]
> En entorno de producción (`Production`), por políticas de seguridad, el sistema exige una contraseña privada provista mediante la variable `SeedDemoPassword` y rechaza valores por defecto.

---

## 🧪 Pruebas Automatizadas y Calidad de Código

El repositorio cuenta con una cobertura de pruebas automatizadas ejecutadas en cada pull request y push mediante GitHub Actions:

```bash
# 1. Pruebas Unitarias y de Seguridad del Backend (93 tests xUnit)
dotnet test backend/GamificacionBackend.sln --verbosity normal

# 2. Pruebas Unitarias del Microservicio de IA (16 tests unittest)
python -m unittest -v ai-service/test_contenido.py

# 3. Validación de Sintaxis del Proxy y Compilación de Frontend
node --check frontend/functions/api/[[path]].js
npm --prefix frontend run build

# 4. Construcción de Imagen Docker Unificada
docker build -t gamificacion-pfc:test .
```

*Total de pruebas automatizadas:* **109 tests aprobados** (93 en .NET + 16 en Python) con escaneo anti-filtración de secretos en el bundle JS y análisis estático continuo (CodeQL y Gitleaks).

---

## 📁 Estructura del Repositorio

```text
GamificationProject/
├── .github/
│   ├── dependabot.yml       # Actualizaciones automáticas de NuGet, npm, pip, Docker y Actions
│   └── workflows/
│       ├── ci.yml           # Pipeline de integración continua (.NET, Node, Python, Docker)
│       └── security.yml     # Escaneo de secretos (Gitleaks) y SAST (CodeQL)
├── ai-service/              # Microservicio Python FastAPI (Google Gemini HITL)
│   ├── contenido.py         # Reglas determinísticas, cálculo de daño HP y validaciones
│   ├── esquemas.py          # Modelos Pydantic de entrada y salida
│   ├── main.py              # Endpoints FastAPI y delimitación anti-inyección
│   └── test_contenido.py    # Suite de pruebas unitarias de contenido
├── backend/                 # Solución .NET 9 (Clean Architecture + CQRS + Event Sourcing)
│   ├── Core.Domain/         # Agregados (Misión, Personaje, Aula, Usuario), Eventos y Value Objects
│   ├── Core.Application/    # Comandos, Consultas, Handlers (MediatR) y Proyecciones
│   ├── Infrastructure/      # EF Core 9, Npgsql, Repositorios, Migraciones y Cliente HTTP IA
│   ├── WebApi/              # Minimal APIs, Endpoints de dominio, Rate Limiting y CORS
│   └── Core.Domain.Tests/   # 93 pruebas unitarias de lógica de negocio y seguridad
├── frontend/                # Aplicación Web React 19 + Vite 8 (Painterly RPG UI)
│   ├── functions/api/       # Cloudflare Pages Function (Reverse Proxy Same-Origin)
│   ├── public/              # Assets estáticos, robots.txt, _headers y _redirects
│   └── src/
│       ├── components/      # Componentes UI reutilizables y layout (Sidebar, Modales)
│       ├── features/        # Módulos por rol: alumno, docente, directivo, landing, auth
│       ├── hooks/           # Custom hooks de React Query y mutaciones
│       ├── services/        # Cliente HTTP (`apiFetch`) con cookies HttpOnly
│       └── store/           # Estado global ligero con Zustand
├── Dockerfile               # Contenedor unificado de producción (.NET 9 + Python FastAPI)
├── docker-compose.yml       # PostgreSQL 17 para desarrollo local
├── render.yaml              # Blueprint de infraestructura como código para Render.com
├── start.sh                 # Script supervisor de arranque (.NET + loop de uvicorn)
└── README.md
```

---

## 📄 Marco Académico y Licencia

Proyecto Final de Carrera (PFC) — Licenciatura en Sistemas de Información.  
Facultad de Ciencias Exactas y Naturales y Agrimensura (**FaCENA**), **Universidad Nacional del Nordeste (UNNE)**.  
La titularidad de los derechos patrimoniales sobre el desarrollo se rige bajo las normativas institucionales de la UNNE (Res. N° 2024-615-CS).
