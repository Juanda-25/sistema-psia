import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const colorNota = (nota) => {
  if (nota >= 4.0) return 'bg-success';
  if (nota >= 3.0) return 'bg-warning text-dark';
  return 'bg-danger';
};

const Calificador = () => {
  const { user } = useAuth();
  const esProfesor = user?.rol === 'profesor';

  const [tab, setTab] = useState(esProfesor ? 'documentos' : 'subir');
  const [msg, setMsg] = useState({ texto: '', tipo: 'info' });
  const [cargando, setCargando] = useState(false);
  const [rubricas, setRubricas] = useState([]);
  const [misResultados, setMisResultados] = useState([]);
  const [todasEvaluaciones, setTodasEvaluaciones] = useState([]);
  const [detalleEval, setDetalleEval] = useState(null);

  // Form estudiante
  const [archivo, setArchivo] = useState(null);
  const [rubricaId, setRubricaId] = useState('');

  // Form nueva rúbrica
  const [nuevaRubrica, setNuevaRubrica] = useState({
    nombre: '', descripcion: '',
    criterios: [
      { nombre: 'Redacción y ortografía',       descripcion: '', puntaje_max: 20 },
      { nombre: 'Estructura del documento',      descripcion: '', puntaje_max: 20 },
      { nombre: 'Originalidad',                  descripcion: '', puntaje_max: 20 },
      { nombre: 'Cumplimiento de objetivos PAT', descripcion: '', puntaje_max: 20 },
      { nombre: 'Calidad de la investigación',   descripcion: '', puntaje_max: 20 },
    ]
  });

  // Form ajuste nota profesor
  const [ajuste, setAjuste] = useState({ nota_profesor: '', comentario_profesor: '' });

  const mostrarMsg = (texto, tipo = 'info') => {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg({ texto: '', tipo: 'info' }), 6000);
  };

  useEffect(() => {
    api.get('/calificador/rubricas').then(({ data }) => setRubricas(data));
    if (!esProfesor) {
      api.get('/calificador/resultados').then(({ data }) => setMisResultados(data));
    } else {
      api.get('/calificador/todas').then(({ data }) => setTodasEvaluaciones(data));
    }
  }, []);

  // ── Estudiante sube doc y la IA califica ──
  const handleSubirDoc = async (e) => {
    e.preventDefault();
    if (!archivo) { mostrarMsg('❌ Debes seleccionar un archivo', 'danger'); return; }
    if (!rubricaId) { mostrarMsg('❌ Debes seleccionar una rúbrica', 'danger'); return; }

    setCargando(true);
    mostrarMsg('🤖 La IA está analizando tu documento... esto puede tomar unos segundos', 'warning');

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('data', JSON.stringify({ rubrica_id: parseInt(rubricaId) }));

    try {
      const { data } = await api.post('/calificador/evaluar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      mostrarMsg(`✅ ¡Documento calificado! Nota final: ${data.puntaje_total} / 5.0`, 'success');
      setArchivo(null);
      setRubricaId('');
      const res = await api.get('/calificador/resultados');
      setMisResultados(res.data);
      setDetalleEval(data);
      setTab('detalle');
    } catch (err) {
      mostrarMsg('❌ ' + (err.response?.data?.message || 'Error al procesar el documento'), 'danger');
    } finally {
      setCargando(false);
    }
  };

  // ── Profesor ajusta nota ──
  const handleAjustarNota = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/calificador/evaluar/${detalleEval.id}/ajustar`, ajuste);
      setDetalleEval(data);
      mostrarMsg('✅ Nota ajustada correctamente', 'success');
    } catch (err) {
      mostrarMsg('❌ ' + (err.response?.data?.message || 'Error al ajustar nota'), 'danger');
    }
  };

  // ── Crear rúbrica ──
  const handleCrearRubrica = async (e) => {
    e.preventDefault();
    const suma = nuevaRubrica.criterios.reduce((a, c) => a + Number(c.puntaje_max), 0);
    if (suma !== 100) {
      mostrarMsg(`❌ La suma de puntajes debe ser 100. Actualmente es ${suma}`, 'danger');
      return;
    }
    try {
      await api.post('/calificador/rubricas', nuevaRubrica);
      mostrarMsg('✅ Rúbrica creada correctamente', 'success');
      const { data } = await api.get('/calificador/rubricas');
      setRubricas(data);
      setTab('documentos');
    } catch (err) {
      mostrarMsg('❌ ' + (err.response?.data?.message || 'Error al crear rúbrica'), 'danger');
    }
  };

  const updateCriterio = (i, field, value) => {
    const updated = [...nuevaRubrica.criterios];
    updated[i] = { ...updated[i], [field]: value };
    setNuevaRubrica({ ...nuevaRubrica, criterios: updated });
  };

  const verDetalle = async (id) => {
    const { data } = await api.get(`/calificador/resultados/${id}`);
    setDetalleEval(data);
    setAjuste({ nota_profesor: data.puntaje_total, comentario_profesor: data.comentario || '' });
    setTab('detalle');
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '100px' }}>
        <h4 className="fw-bold mb-1">Sistema Calificador</h4>
        <p className="text-muted mb-3">
          {esProfesor ? 'Panel del Profesor — Gestión de rúbricas y documentos' : 'Sube tu documento PAT y recibe tu nota automáticamente'}
        </p>

        {msg.texto && (
          <div className={`alert alert-${msg.tipo} d-flex align-items-center`}>
            {cargando && <div className="spinner-border spinner-border-sm me-2" role="status" />}
            {msg.texto}
          </div>
        )}

        {/* ── TABS ── */}
        <ul className="nav nav-tabs mb-4">
          {esProfesor ? (
            <>
              <li className="nav-item">
                <button className={`nav-link ${tab === 'documentos' ? 'active' : ''}`}
                  onClick={() => setTab('documentos')}>
                  📄 Documentos subidos
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${tab === 'rubricas' ? 'active' : ''}`}
                  onClick={() => setTab('rubricas')}>
                  📋 Mis rúbricas
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${tab === 'nueva-rubrica' ? 'active' : ''}`}
                  onClick={() => setTab('nueva-rubrica')}>
                  ➕ Crear rúbrica
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <button className={`nav-link ${tab === 'subir' ? 'active' : ''}`}
                  onClick={() => setTab('subir')}>
                  📤 Subir documento
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${tab === 'resultados' ? 'active' : ''}`}
                  onClick={() => setTab('resultados')}>
                  📊 Mis resultados
                </button>
              </li>
            </>
          )}
          {detalleEval && (
            <li className="nav-item">
              <button className={`nav-link ${tab === 'detalle' ? 'active' : ''}`}
                onClick={() => setTab('detalle')}>
                🔍 Detalle
              </button>
            </li>
          )}
        </ul>

        {/* ── ESTUDIANTE: SUBIR DOCUMENTO ── */}
        {tab === 'subir' && !esProfesor && (
          <div className="card border-0 shadow-sm p-4" style={{ maxWidth: '600px' }}>
            <h6 className="fw-bold mb-3">📤 Subir documento PAT para calificación automática</h6>
            <form onSubmit={handleSubirDoc}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Seleccionar Rúbrica</label>
                <select className="form-select" value={rubricaId}
                  onChange={e => setRubricaId(e.target.value)} required>
                  <option value="">-- Elige la rúbrica del profesor --</option>
                  {rubricas.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} — Prof. {r.profesor}
                    </option>
                  ))}
                </select>
                {rubricas.length === 0 && (
                  <small className="text-muted mt-1 d-block">
                    ⚠️ No hay rúbricas disponibles aún. El profesor debe crear una primero.
                  </small>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Documento PAT (PDF / DOC / DOCX)</label>
                <input type="file" className="form-control" accept=".pdf,.doc,.docx"
                  onChange={e => setArchivo(e.target.files[0])} required />
                {archivo && (
                  <small className="text-success mt-1 d-block">
                    📎 {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)
                  </small>
                )}
              </div>

              <button type="submit" className="btn text-white fw-bold w-100 py-2"
                style={{ background: 'linear-gradient(135deg, #00b8a2, #007a6d)' }}
                disabled={cargando}>
                {cargando ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Analizando con IA...</>
                ) : '🤖 Enviar para calificación automática'}
              </button>
            </form>
          </div>
        )}

        {/* ── ESTUDIANTE: MIS RESULTADOS ── */}
        {tab === 'resultados' && !esProfesor && (
          <div className="card border-0 shadow-sm p-4">
            <h6 className="fw-bold mb-3">Mis evaluaciones</h6>
            {misResultados.length === 0
              ? <p className="text-muted">Aún no tienes evaluaciones. ¡Sube tu primer documento!</p>
              : misResultados.map(r => (
                <div key={r.id}
                  className="d-flex justify-content-between align-items-center border-bottom py-3"
                  style={{ cursor: 'pointer' }}
                  onClick={() => verDetalle(r.id)}>
                  <div>
                    <span className="fw-semibold">📄 {r.nombre_archivo}</span>
                    <small className="text-muted d-block">Rúbrica: {r.rubrica}</small>
                    <small className="text-muted">
                      {new Date(r.creado_en).toLocaleDateString('es-CO')}
                    </small>
                  </div>
                  <div className="text-center">
                    <span className={`badge fs-5 ${colorNota(parseFloat(r.puntaje_total))}`}>
                      {r.puntaje_total}
                    </span>
                    <small className="d-block text-muted">/ 5.0</small>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ── PROFESOR: DOCUMENTOS SUBIDOS ── */}
        {tab === 'documentos' && esProfesor && (
          <div className="card border-0 shadow-sm p-4">
            <h6 className="fw-bold mb-3">
              Documentos subidos por estudiantes
              <span className="badge bg-secondary ms-2">{todasEvaluaciones.length}</span>
            </h6>
            {todasEvaluaciones.length === 0
              ? <p className="text-muted">Ningún estudiante ha subido documentos aún.</p>
              : todasEvaluaciones.map(r => (
                <div key={r.id}
                  className="d-flex justify-content-between align-items-center border-bottom py-3"
                  style={{ cursor: 'pointer' }}
                  onClick={() => verDetalle(r.id)}>
                  <div>
                    <span className="fw-semibold">📄 {r.nombre_archivo}</span>
                    <small className="text-muted d-block">
                      👤 {r.estudiante} — Rúbrica: {r.rubrica}
                    </small>
                    <small className="text-muted">
                      {new Date(r.creado_en).toLocaleDateString('es-CO')}
                    </small>
                  </div>
                  <div className="text-center">
                    <span className={`badge fs-5 ${colorNota(parseFloat(r.puntaje_total))}`}>
                      {r.puntaje_total}
                    </span>
                    <small className="d-block text-muted">/ 5.0</small>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ── PROFESOR: MIS RÚBRICAS ── */}
        {tab === 'rubricas' && esProfesor && (
          <div className="card border-0 shadow-sm p-4">
            <h6 className="fw-bold mb-3">Rúbricas creadas</h6>
            {rubricas.length === 0
              ? <p className="text-muted">No has creado rúbricas aún.</p>
              : rubricas.map(r => (
                <div key={r.id} className="border-bottom py-3">
                  <span className="fw-semibold">{r.nombre}</span>
                  {r.descripcion && (
                    <small className="text-muted d-block">{r.descripcion}</small>
                  )}
                  <small className="text-muted d-block">
                    Creada: {new Date(r.creado_en).toLocaleDateString('es-CO')}
                  </small>
                </div>
              ))
            }
          </div>
        )}

        {/* ── PROFESOR: CREAR RÚBRICA ── */}
        {tab === 'nueva-rubrica' && esProfesor && (
          <form onSubmit={handleCrearRubrica} className="card border-0 shadow-sm p-4">
            <div className="mb-3">
              <label className="form-label fw-semibold">Nombre de la rúbrica</label>
              <input type="text" className="form-control" value={nuevaRubrica.nombre}
                onChange={e => setNuevaRubrica({ ...nuevaRubrica, nombre: e.target.value })}
                placeholder="Ej: Rúbrica PAT Colectivo 2026" required />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Descripción</label>
              <textarea className="form-control" rows={2} value={nuevaRubrica.descripcion}
                onChange={e => setNuevaRubrica({ ...nuevaRubrica, descripcion: e.target.value })} />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold mb-0">Criterios de evaluación</h6>
              <small className={`fw-bold ${nuevaRubrica.criterios.reduce((a, c) => a + Number(c.puntaje_max), 0) === 100 ? 'text-success' : 'text-danger'}`}>
                Suma: {nuevaRubrica.criterios.reduce((a, c) => a + Number(c.puntaje_max), 0)} / 100
              </small>
            </div>

            {nuevaRubrica.criterios.map((c, i) => (
              <div key={i} className="row g-2 mb-2 align-items-center">
                <div className="col-md-7">
                  <input type="text" className="form-control" value={c.nombre}
                    onChange={e => updateCriterio(i, 'nombre', e.target.value)}
                    placeholder="Nombre del criterio" required />
                </div>
                <div className="col-md-2">
                  <input type="number" className="form-control text-center"
                    value={c.puntaje_max} min="1" max="100"
                    onChange={e => updateCriterio(i, 'puntaje_max', parseFloat(e.target.value))}
                    required />
                </div>
                <div className="col-md-3">
                  <button type="button" className="btn btn-outline-danger btn-sm w-100"
                    onClick={() => setNuevaRubrica({
                      ...nuevaRubrica,
                      criterios: nuevaRubrica.criterios.filter((_, j) => j !== i)
                    })}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-outline-secondary btn-sm mt-2 mb-4"
              onClick={() => setNuevaRubrica({
                ...nuevaRubrica,
                criterios: [...nuevaRubrica.criterios, { nombre: '', descripcion: '', puntaje_max: 10 }]
              })}>
              + Agregar criterio
            </button>

            <div>
              <button type="submit" className="btn text-white fw-bold px-4"
                style={{ background: 'linear-gradient(135deg, #00b8a2, #007a6d)' }}>
                Crear rúbrica
              </button>
            </div>
          </form>
        )}

        {/* ── DETALLE EVALUACIÓN ── */}
        {tab === 'detalle' && detalleEval && (
          <div className="card border-0 shadow-sm p-4">
            <button className="btn btn-sm btn-outline-secondary mb-4"
              onClick={() => setTab(esProfesor ? 'documentos' : 'resultados')}>
              ← Volver
            </button>

            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h5 className="fw-bold">📄 {detalleEval.nombre_archivo}</h5>
                <p className="text-muted mb-1">Rúbrica: {detalleEval.rubrica_nombre}</p>
                {esProfesor && (
                  <p className="text-muted mb-1">Estudiante: {detalleEval.estudiante}</p>
                )}
                <p className="text-muted mb-0">
                  Fecha: {new Date(detalleEval.creado_en).toLocaleDateString('es-CO')}
                </p>
              </div>
              <div className="text-center">
                <div className={`badge fs-2 p-3 ${colorNota(parseFloat(detalleEval.puntaje_total))}`}>
                  {detalleEval.puntaje_total}
                </div>
                <div className="text-muted mt-1 small">Nota final / 5.0</div>
                <div className="text-muted small">Calificado por IA 🤖</div>
              </div>
            </div>

            {/* Detalle por criterio */}
            <h6 className="fw-bold mb-3">Detalle por criterio</h6>
            {detalleEval.detalle.map((d, i) => (
              <div key={i} className="card border-0 bg-light p-3 mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-semibold">{d.criterio}</span>
                  <span className="badge bg-secondary">
                    {d.puntaje} / {d.puntaje_max} pts
                  </span>
                </div>
                {d.observacion && (
                  <small className="text-muted mt-1 d-block">💬 {d.observacion}</small>
                )}
              </div>
            ))}

            {/* Comentario general */}
            {detalleEval.comentario && (
              <div className="mt-3 p-3 bg-light rounded">
                <strong>Comentario general:</strong>
                <p className="mb-0 mt-1 text-muted">{detalleEval.comentario}</p>
              </div>
            )}

            {/* Profesor puede ajustar nota */}
            {esProfesor && (
              <div className="mt-4 p-4 border rounded">
                <h6 className="fw-bold mb-3">✏️ Ajustar nota</h6>
                <form onSubmit={handleAjustarNota}>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label small">Nueva nota (1.0 – 5.0)</label>
                      <input type="number" className="form-control" min="1" max="5" step="0.1"
                        value={ajuste.nota_profesor}
                        onChange={e => setAjuste({ ...ajuste, nota_profesor: e.target.value })}
                        required />
                    </div>
                    <div className="col-md-9">
                      <label className="form-label small">Comentario para el estudiante</label>
                      <input type="text" className="form-control"
                        value={ajuste.comentario_profesor}
                        onChange={e => setAjuste({ ...ajuste, comentario_profesor: e.target.value })}
                        placeholder="Retroalimentación para el estudiante..." />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary mt-3 fw-bold">
                    💾 Guardar ajuste
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Calificador;