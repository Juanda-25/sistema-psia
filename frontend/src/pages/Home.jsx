import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recomendados, setRecomendados] = useState([]);

  useEffect(() => {
    api.get('/grupos/recomendados')
      .then(({ data }) => setRecomendados(data.grupos?.slice(0, 5) || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '100px' }}>
        <div className="mb-4">
          <h4 className="fw-bold">Hola, {user?.nombre_completo?.split(' ')[0]} 👋</h4>
          <p className="text-muted">Bienvenido al Sistema PSIA</p>
        </div>

        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="card h-100 text-center p-4 border-0 shadow-sm"
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => navigate('/grupos')}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2.5rem' }}>👥</div>
              <h6 className="fw-bold mt-2">Grupos</h6>
              <p className="text-muted small">Únete a grupos de trabajo</p>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card h-100 text-center p-4 border-0 shadow-sm"
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => navigate('/calificador')}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2.5rem' }}>✅</div>
              <h6 className="fw-bold mt-2">Calificador</h6>
              <p className="text-muted small">Califica tu documento PAT</p>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card h-100 text-center p-4 border-0 shadow-sm"
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => navigate('/preguntas')}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2.5rem' }}>🤖</div>
              <h6 className="fw-bold mt-2">Preguntas IA</h6>
              <p className="text-muted small">Consulta dudas sobre tu PAT</p>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <div className="card h-100 text-center p-4 border-0 shadow-sm"
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => navigate('/dashboard')}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2.5rem' }}>👤</div>
              <h6 className="fw-bold mt-2">Mi Perfil</h6>
              <p className="text-muted small">Edita tu información</p>
            </div>
          </div>

          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ borderLeft: '4px solid #00b8a2', paddingLeft: '10px' }}>
                  Grupos recomendados para ti
                </h5>
                <button className="btn btn-sm btn-outline-secondary"
                  onClick={() => navigate('/grupos')}>
                  Ver todos →
                </button>
              </div>
              {recomendados.length === 0 ? (
                <p className="text-muted mb-0">No hay grupos disponibles aún.</p>
              ) : (
                recomendados.map((g, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center py-2 border-bottom"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/grupos')}>
                    <span className="fw-semibold">👥 {g.nombre}</span>
                    <span className={`badge ${parseInt(g.cupos_disponibles) === 0 ? 'bg-danger' : 'bg-success'}`}>
                      {parseInt(g.cupos_disponibles) === 0 ? 'Completo' : `${g.cupos_disponibles} cupos`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;