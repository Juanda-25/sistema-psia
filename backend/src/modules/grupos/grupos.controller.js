const gruposService = require('./grupos.service');

const getGrupos = async (req, res) => {
  try {
    const grupos = await gruposService.getGrupos();
    res.json(grupos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getGruposRecomendados = async (req, res) => {
  try {
    const data = await gruposService.getGruposRecomendados(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getGrupoById = async (req, res) => {
  try {
    const grupo = await gruposService.getGrupoById(req.params.id, req.user.id);
    res.json(grupo);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const getMisGrupos = async (req, res) => {
  try {
    const grupos = await gruposService.getMisGrupos(req.user.id);
    res.json(grupos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const unirseAGrupo = async (req, res) => {
  try {
    const grupo = await gruposService.unirseAGrupo(req.user.id, req.params.id);
    res.json(grupo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const salirDeGrupo = async (req, res) => {
  try {
    const result = await gruposService.salirDeGrupo(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const crearGrupo = async (req, res) => {
  try {
    const grupo = await gruposService.crearGrupo(req.body);
    res.status(201).json(grupo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getGrupos,
  getGruposRecomendados,
  getGrupoById,
  getMisGrupos,
  unirseAGrupo,
  salirDeGrupo,
  crearGrupo,
};