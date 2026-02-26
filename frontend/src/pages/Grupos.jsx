import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Grupos = () => {
  const { user } = useAuth();
  const esProfesor = user?.rol === 'profesor';

  const [tab, setTab] = useState('recomendados');
  const [recomendados, setRecomendados] = useState([]);
  const [misGrupos, setMisGrupos] = useState([]);
  const [grupoDetalle, setGrupoDetalle] = useState(null);
  const [msg, setMsg] = useState({ texto: '', tipo: 'info' });
  const [cargando, setCargando] = useState(true);

  const [nuevoGrupo, setNuevoGrupo] = useState({
    nombre: '', descripcion: '', semestre: '', temas: '', max_integrantes: 5
  });

  const mostrarMsg = (texto, tipo = 'info') => {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg({ texto: '', tipo: 'info' }), 4000);
  };

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [recRes, misRes] = await Promise.all([
        api.get('/grupos/recomendados'),
        api.get('/grupos/mis-grupos'),
      ]);
      setRecomendados(recRes.data.grupos || []);
      setMisGrupos(misRes.data);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleUnirse = async (grupoId) => {
    try {
      await api.post(`/grupos/${grupoId}/unirse`);
      mostrarMsg('✅ ¡Te uniste al grupo exitosamente!', 'success');
      cargarDatos();
    } catch (err) {
      mostrarMsg('❌ ' + (err.response?.data?.message || 'Error al unirse'), 'danger');
    }
  };

  const handleSalir = async (grupoId) => {
    try {
      await api.delete(`/grupos/${grupoId}/salir`);
      mostrarMsg('✅ Saliste del grupo', 'info');
      setGrupoDetalle(null);
      setTab('mis-grupos');
      cargarDatos();
    } catch (err) {
      mostrarMsg('❌ ' + (err.response?.data?.message || 'Error al salir'), 'danger');
    }
  };

  const verDetalle = async (id) => {
    const { data } = await api.get(`/grupos/${id}`);
    setGrupoDetalle(data);
    setTab('detalle');
  };

  const handleCrearGrupo = async (e) => {
    e.preventDefault();
    try {
      await api.post('/grupos', nuevoGrupo);
      mostrarMsg('✅ Grupo creado correctamente', 'success');
      setNuevoGrupo({ nombre: '', descripcion: '', semestre: '', temas: '', max_integrantes: 5 });
      cargarDatos();
      setTab('recomendados');
    } catch (err) {
      mostrarMsg('❌ ' + (err.response?.data?.message || 'Error al crear grupo'), 'danger');
    }
  };

  const colorCupos = (cupos, max) => {
    const pct = cupos / max;
    if (pct === 0) return 'danger';
    if (pct <= 0.4) return 'warning';
    return 'success';
  };

  const TarjetaGrupo = ({ grupo, esMio = false }) => (
    <div className="card border-0 shadow-sm mb-3"
      style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div onClick={() => verDetalle(grupo.id)} style={{ flex: 1 }}>
            <h6 className="fw-bold mb-1">👥 {grupo.nombre}</h6>
            {grupo.descripcion && (
              <p className="text-muted small mb-1">{grupo.descripcion}</p>
            )}
            <div className="d-flex flex-wrap gap-1 mb-1">
              {grupo.semestre && (
                <span className="badge bg-primary">📚 {grupo.semestre}</span>
              )}
              {grupo.temas && grupo.temas.split(',').map((t, i) => (
                <span key={i} className="badge bg-light text-dark border">
                  🏷️ {t.trim()}
                </span>
              ))}
            </div>
            <span className={`badge bg-${colorCupos(parseInt(grupo.cupos_disponibles), grupo.max_integrantes)}`}>
              {parseInt(grupo.cupos_disponibles) === 0
                ? '🔴 Completo'
                : `🟢 ${grupo.cupos_disponibles} cupos disponibles`}
            </span>
            <small className="text-muted d-block mt-1">
              {grupo.total_miembros} / {grupo.max_integrantes} integrantes
            </small>
            {grupo.score > 0 && !esMio && (
              <small className="text-success d-block mt-1">
                ⭐ Recomendado para ti
              </small>
            )}
          </div>
          <div className="ms-3">
            {esMio ? (
              <button className="btn btn-sm btn-outline-danger"
                onClick={() => handleSalir(grupo.id)}>
                Salir
              </button>
            ) : (
              <button
                className="btn btn-sm text-white fw-bold"
                style={{ background: 'linear-gradient(135deg, #00b8a2, #007a6d)' }}
                onClick={() => handleUnirse(grupo.id)}
                disabled={parseInt(grupo.cupos_disponibles) === 0}>
                {parseInt(grupo.cupos_disponibles) === 0 ? 'Lleno' : 'Unirse'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '100px' }}>
        <h4 className="fw-bold mb-1">Grupos de Trabajo</h4>
        <p className="text-muted mb-3">
          {esProfesor
            ? 'Gestiona los grupos de trabajo'
            : 'Únete a un grupo recomendado según tu semestre e intereses'}
        </p>

        {msg.texto && (
          <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>
        )}

        {/* TABS */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button className={`nav-link ${tab === 'recomendados' ? 'active' : ''}`}
              onClick={() => setTab('recomendados')}>
              ⭐ Recomendados
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${tab === 'mis-grupos' ? 'active' : ''}`}
              onClick={() => setTab('mis-grupos')}>
              👤 Mis grupos
              {misGrupos.length > 0 && (
                <span className="badge bg-success ms-1">{misGrupos.length}</span>
              )}
            </button>
          </li>
          {esProfesor && (
            <li className="nav-item">
              <button className={`nav-link ${tab === 'crear' ? 'active' : ''}`}
                onClick={() => setTab('crear')}>
                ➕ Crear grupo
              </button>
            </li>
          )}
          {grupoDetalle && (
            <li className="nav-item">
              <button className={`nav-link ${tab === 'detalle' ? 'active' : ''}`}
                onClick={() => setTab('detalle')}>
                🔍 Detalle
              </button>
            </li>
          )}
        </ul>

        {/* RECOMENDADOS */}
        {tab === 'recomendados' && (
          <div>
            {cargando ? (
              <p className="text-muted">Cargando recomendaciones...</p>
            ) : recomendados.length === 0 ? (
              <div className="text-center p-5">
                <div style={{ fontSize: '3rem' }}>🔍</div>
                <h6 className="mt-3">No hay grupos disponibles por ahora</h6>
                <p className="text-muted">
                  {esProfesor
                    ? 'Crea el primer grupo usando la pestaña "Crear grupo"'
                    : 'El profesor aún no ha creado grupos. ¡Vuelve pronto!'}
                </p>
              </div>
            ) : (
              <>
                {!esProfesor && (
                  <div className="alert alert-info py-2 mb-3">
                    💡 Los grupos se ordenan según tu semestre e intereses del perfil.
                    <a href="/dashboard" className="ms-1" style={{ color: '#00b8a2' }}>
                      Actualiza tu perfil
                    </a> para mejores recomendaciones.
                  </div>
                )}
                <div className="row">
                  {recomendados.map(g => (
                    <div key={g.id} className="col-md-6">
                      <TarjetaGrupo grupo={g} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* MIS GRUPOS */}
        {tab === 'mis-grupos' && (
          <div>
            {misGrupos.length === 0 ? (
              <div className="text-center p-5">
                <div style={{ fontSize: '3rem' }}>👥</div>
                <h6 className="mt-3">Aún no estás en ningún grupo</h6>
                <p className="text-muted">Ve a "Recomendados" y únete a un grupo</p>
                <button className="btn text-white fw-bold"
                  style={{ background: 'linear-gradient(135deg, #00b8a2, #007a6d)' }}
                  onClick={() => setTab('recomendados')}>
                  Ver grupos recomendados
                </button>
              </div>
            ) : (
              <div className="row">
                {misGrupos.map(g => (
                  <div key={g.id} className="col-md-6">
                    <TarjetaGrupo grupo={g} esMio={true} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CREAR GRUPO (solo profesor) */}
        {tab === 'crear' && esProfesor && (
          <form onSubmit={handleCrearGrupo} className="card border-0 shadow-sm p-4"
            style={{ maxWidth: '600px' }}>
            <h6 className="fw-bold mb-3">Crear nuevo grupo</h6>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nombre del grupo</label>
              <input type="text" className="form-control" value={nuevoGrupo.nombre}
                onChange={e => setNuevoGrupo({ ...nuevoGrupo, nombre: e.target.value })}
                placeholder="Ej: Grupo Investigación IA" required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Descripción</label>
              <textarea className="form-control" rows={2} value={nuevoGrupo.descripcion}
                onChange={e => setNuevoGrupo({ ...nuevoGrupo, descripcion: e.target.value })}
                placeholder="Temática o enfoque del grupo..." />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Temas / Palabras clave
                <small className="text-muted fw-normal ms-2">(separa con comas)</small>
              </label>
              <input type="text" className="form-control" value={nuevoGrupo.temas}
                onChange={e => setNuevoGrupo({ ...nuevoGrupo, temas: e.target.value })}
                placeholder="Ej: programación, inteligencia artificial, robótica" />
              <small className="text-muted d-block mt-1">
                💡 Estos temas se compararán con los hobbies de los estudiantes para recomendar el grupo
              </small>
            </div>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Semestre</label>
                <input type="text" className="form-control" value={nuevoGrupo.semestre}
                  onChange={e => setNuevoGrupo({ ...nuevoGrupo, semestre: e.target.value })}
                  placeholder="Ej: 5to semestre" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Máx. integrantes</label>
                <input type="number" className="form-control" min="2" max="10"
                  value={nuevoGrupo.max_integrantes}
                  onChange={e => setNuevoGrupo({ ...nuevoGrupo, max_integrantes: parseInt(e.target.value) })} />
              </div>
            </div>
            <button type="submit" className="btn text-white fw-bold px-4"
              style={{ background: 'linear-gradient(135deg, #00b8a2, #007a6d)' }}>
              Crear grupo
            </button>
          </form>
        )}

        {/* DETALLE GRUPO */}
        {tab === 'detalle' && grupoDetalle && (
          <div className="card border-0 shadow-sm p-4">
            <button className="btn btn-sm btn-outline-secondary mb-4"
              onClick={() => setTab('recomendados')}>
              ← Volver
            </button>

            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h5 className="fw-bold">👥 {grupoDetalle.nombre}</h5>
                {grupoDetalle.descripcion && (
                  <p className="text-muted mb-2">{grupoDetalle.descripcion}</p>
                )}
                <div className="d-flex flex-wrap gap-1">
                  {grupoDetalle.semestre && (
                    <span className="badge bg-primary">📚 {grupoDetalle.semestre}</span>
                  )}
                  {grupoDetalle.temas && grupoDetalle.temas.split(',').map((t, i) => (
                    <span key={i} className="badge bg-light text-dark border">
                      🏷️ {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="fs-3 fw-bold" style={{ color: '#00b8a2' }}>
                  {grupoDetalle.total_miembros}/{grupoDetalle.max_integrantes}
                </div>
                <small className="text-muted">integrantes</small>
              </div>
            </div>

            <h6 className="fw-bold mb-3">Integrantes</h6>
            {grupoDetalle.miembros.length === 0 ? (
              <p className="text-muted">Aún no hay integrantes.</p>
            ) : (
              grupoDetalle.miembros.map((m, i) => (
                <div key={i} className="d-flex align-items-center gap-3 py-2 border-bottom">
                  <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{ width: 38, height: 38, minWidth: 38, fontSize: '1rem' }}>
                    {m.nombre_completo?.[0]}
                  </div>
                  <div>
                    <span className="fw-semibold">{m.nombre_completo}</span>
                    {m.semestre && (
                      <small className="text-muted ms-2">{m.semestre}</small>
                    )}
                  </div>
                </div>
              ))
            )}

            <div className="mt-4 d-flex gap-2">
              {!grupoDetalle.es_miembro && parseInt(grupoDetalle.cupos_disponibles) > 0 && (
                <button className="btn text-white fw-bold"
                  style={{ background: 'linear-gradient(135deg, #00b8a2, #007a6d)' }}
                  onClick={() => handleUnirse(grupoDetalle.id)}>
                  Unirse al grupo
                </button>
              )}
              {grupoDetalle.es_miembro && (
                <button className="btn btn-outline-danger"
                  onClick={() => handleSalir(grupoDetalle.id)}>
                  Salir del grupo
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Grupos;