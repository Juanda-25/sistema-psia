const calificadorService = require('./calificador.service');

const getRubricas = async (req, res) => {
  try {
    const rubricas = await calificadorService.getRubricas();
    res.json(rubricas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRubricaById = async (req, res) => {
  try {
    const rubrica = await calificadorService.getRubricaById(req.params.id);
    res.json(rubrica);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const crearRubrica = async (req, res) => {
  try {
    const rubrica = await calificadorService.crearRubrica(req.user.id, req.body);
    res.status(201).json(rubrica);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const buscarEstudiantes = async (req, res) => {
  try {
    const { nombre } = req.query;
    if (!nombre) return res.json([]);
    const estudiantes = await calificadorService.buscarEstudiantes(nombre);
    res.json(estudiantes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Estudiante sube documento → IA califica automáticamente
const evaluarConIA = async (req, res) => {
  try {
    const body = typeof req.body.data === 'string'
      ? JSON.parse(req.body.data)
      : req.body;

    const nombre_archivo = req.file?.originalname || body.nombre_archivo;
    const ruta_archivo   = req.file?.path          || body.ruta_archivo;

    if (!ruta_archivo) throw new Error('Debes subir un archivo');
    if (!body.rubrica_id) throw new Error('Debes seleccionar una rúbrica');

    const evaluacion = await calificadorService.evaluarConIA(req.user.id, {
      rubrica_id: body.rubrica_id,
      nombre_archivo,
      ruta_archivo,
    });

    res.status(201).json(evaluacion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Profesor ajusta nota de una evaluación
const ajustarNota = async (req, res) => {
  try {
    const evaluacion = await calificadorService.ajustarNota(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json(evaluacion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getResultado = async (req, res) => {
  try {
    const evaluacion = await calificadorService.getEvaluacionById(req.params.id);
    res.json(evaluacion);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const getMisResultados = async (req, res) => {
  try {
    const resultados = await calificadorService.getEvaluacionesByEstudiante(req.user.id);
    res.json(resultados);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Profesor ve todos los documentos subidos
const getTodasEvaluaciones = async (req, res) => {
  try {
    const evaluaciones = await calificadorService.getTodasEvaluaciones();
    res.json(evaluaciones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getRubricas,
  getRubricaById,
  crearRubrica,
  buscarEstudiantes,
  evaluarConIA,
  ajustarNota,
  getResultado,
  getMisResultados,
  getTodasEvaluaciones,
};