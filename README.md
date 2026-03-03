# 🎓 Sistema PSIA — Plan de Acción Tutorial Colectivo

Sistema web académico para la gestión del PAT Colectivo universitario. Permite calificar documentos automáticamente con IA, recomendar grupos de trabajo y resolver dudas académicas mediante un asistente inteligente.

---

## 🚀 Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + Bootstrap |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL |
| Autenticación | JWT + bcrypt |
| IA | Google Gemini API |
| Subida de archivos | Multer |

---

## ✅ Funcionalidades

### 👤 Autenticación
- Registro con rol (estudiante / profesor)
- Login con JWT
- Rutas protegidas por rol

### 📋 Sistema Calificador
- El estudiante sube su documento PAT (PDF / DOCX)
- La IA analiza el documento y califica automáticamente según la rúbrica
- Escala de calificación colombiana: 1.0 a 5.0
- El profesor puede ajustar la nota y agregar comentarios
- El profesor crea rúbricas con criterios personalizados

### 👥 Sistema Recomendador de Grupos
- El profesor crea grupos con temas y semestre
- El sistema recomienda grupos según semestre y hobbies del estudiante
- Los estudiantes pueden unirse y salir de grupos
- Máximo 5 integrantes por grupo

### 🤖 Asistente IA (Chat PAT)
- Chat con IA entrenada específicamente para el PAT Colectivo
- Responde sobre estructura, redacción, criterios y consejos
- Historial de conversación por sesión
- Preguntas frecuentes como accesos rápidos

### 👤 Perfil de Usuario
- Ver y editar información personal
- Semestre, contacto y hobbies
- El perfil mejora las recomendaciones de grupos

---

## 📁 Estructura del proyecto
```
PSIA/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    # Conexión PostgreSQL
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js       # JWT + roles
│   │   └── modules/
│   │       ├── auth/                    # Login y registro
│   │       ├── users/                   # Perfil de usuario
│   │       ├── calificador/             # Rúbricas + IA calificadora
│   │       ├── grupos/                  # Grupos recomendados
│   │       └── ia/                      # Chat asistente PAT
│   ├── database/
│   │   └── schema.sql                   # Esquema de la BD
│   ├── uploads/                         # Documentos subidos
│   └── .env.example
├── frontend/
│   └── src/
│       ├── api/axios.js                 # Cliente HTTP
│       ├── context/AuthContext.jsx      # Estado global
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Home.jsx
│           ├── Dashboard.jsx
│           ├── Calificador.jsx
│           ├── Grupos.jsx
│           └── Preguntas.jsx
└── README.md
```

---

## ⚙️ Instalación y configuración

### Requisitos previos
- Node.js v18 o superior
- PostgreSQL v16 o superior
- Cuenta en Google AI Studio (para la API Key de Gemini)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/sistema-psia.git
cd sistema-psia
```

### 2. Configurar la base de datos
```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE psia;"

# Importar el esquema
psql -U postgres -d psia -f backend/database/schema.sql

# Agregar tabla de grupos (si no está en schema.sql)
psql -U postgres -d psia -c "
CREATE TABLE IF NOT EXISTS grupos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  semestre VARCHAR(50) DEFAULT NULL,
  temas TEXT DEFAULT NULL,
  max_integrantes INT NOT NULL DEFAULT 5,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS grupo_miembros (
  id SERIAL PRIMARY KEY,
  grupo_id INT NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  unido_en TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(grupo_id, usuario_id)
);"
```

### 3. Configurar el backend
```bash
cd backend
npm install
```

Crea el archivo `.env` basándote en `.env.example`:
```env
PORT=3001
DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA@localhost:5432/psia
JWT_SECRET=clave_super_secreta_patcia_2026
JWT_EXPIRES_IN=7d
UPLOADS_DIR=uploads
MAX_FILE_SIZE_MB=10
GEMINI_API_KEY=TU_API_KEY_DE_GEMINI
```

### 4. Configurar el frontend
```bash
cd frontend
npm install
```

### 5. Iniciar el proyecto

Terminal 1 — Backend:
```bash
cd backend
npm run dev
```

Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
```

### 6. Acceder al sistema
Abre el navegador en: **http://localhost:5173**

---

## 🔑 Obtener API Key de Google Gemini (gratis)

1. Ve a https://aistudio.google.com/apikey
2. Crea una nueva API Key en un proyecto nuevo
3. Cópiala y pégala en el `.env` del backend

---

## 👥 Roles del sistema

| Rol | Permisos |
|---|---|
| **Estudiante** | Subir documentos, ver calificaciones, unirse a grupos, usar chat IA |
| **Profesor** | Crear rúbricas, ver todos los documentos, ajustar notas, crear grupos |

---

## 🗄️ Base de datos

| Tabla | Descripción |
|---|---|
| `usuarios` | Registro de usuarios con rol |
| `perfil_usuario` | Información adicional del perfil |
| `rubricas` | Rúbricas de evaluación creadas por profesores |
| `criterios` | Criterios de cada rúbrica |
| `evaluaciones` | Documentos evaluados con su nota |
| `calificaciones_criterio` | Detalle de puntaje por criterio |
| `grupos` | Grupos de trabajo disponibles |
| `grupo_miembros` | Relación estudiantes-grupos |

---

## 📌 Variables de entorno necesarias

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (default: 3001) |
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `JWT_SECRET` | Clave secreta para tokens JWT |
| `JWT_EXPIRES_IN` | Duración del token (default: 7d) |
| `UPLOADS_DIR` | Carpeta para archivos subidos |
| `MAX_FILE_SIZE_MB` | Tamaño máximo de archivo en MB |
| `GEMINI_API_KEY` | API Key de Google Gemini |

---

## 👨‍💻 Desarrollado con
- React + Vite
- Node.js + Express
- PostgreSQL
- Google Gemini AI
- Bootstrap 5

## 👨‍💻 Desarrollado por

Juan David Guevara Atencia
