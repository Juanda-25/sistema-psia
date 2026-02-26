const express = require('express');
const router = express.Router();
const { verifyToken, verifyProfesor } = require('../../middlewares/auth.middleware');
const ctrl = require('./grupos.controller');

router.get('/',               verifyToken, ctrl.getGrupos);
router.get('/recomendados',   verifyToken, ctrl.getGruposRecomendados);
router.get('/mis-grupos',     verifyToken, ctrl.getMisGrupos);
router.get('/:id',            verifyToken, ctrl.getGrupoById);
router.post('/',              verifyToken, verifyProfesor, ctrl.crearGrupo);
router.post('/:id/unirse',    verifyToken, ctrl.unirseAGrupo);
router.delete('/:id/salir',   verifyToken, ctrl.salirDeGrupo);

module.exports = router;