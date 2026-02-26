const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken, verifyProfesor } = require('../../middlewares/auth.middleware');
const ctrl = require('./calificador.controller');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOADS_DIR || 'uploads');
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF, DOC o DOCX'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
});

// ── Rúbricas ──────────────────────────────────────────────
router.get('/rubricas',           verifyToken, ctrl.getRubricas);
router.get('/rubricas/:id',       verifyToken, ctrl.getRubricaById);
router.post('/rubricas',          verifyToken, verifyProfesor, ctrl.crearRubrica);

// ── Estudiantes ───────────────────────────────────────────
router.get('/estudiantes/buscar', verifyToken, verifyProfesor, ctrl.buscarEstudiantes);

// ── Evaluaciones ──────────────────────────────────────────
// Estudiante sube doc → IA califica
router.post('/evaluar',           verifyToken, upload.single('archivo'), ctrl.evaluarConIA);

// Profesor ajusta nota
router.put('/evaluar/:id/ajustar', verifyToken, verifyProfesor, ctrl.ajustarNota);

// Profesor ve todos los docs subidos
router.get('/todas',              verifyToken, verifyProfesor, ctrl.getTodasEvaluaciones);

// Estudiante ve sus resultados
router.get('/resultados',         verifyToken, ctrl.getMisResultados);
router.get('/resultados/:id',     verifyToken, ctrl.getResultado);

module.exports = router;