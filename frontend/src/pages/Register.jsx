import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre_completo: '', email: '', clave: '', rol: 'estudiante' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.nombre_completo, form.email, form.clave, form.rol);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body p-5">
          <h2 className="text-center fw-bold mb-1">Crear cuenta</h2>
          <p className="text-center text-muted mb-4">Sistema PSIA</p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nombre completo</label>
              <input type="text" name="nombre_completo" className="form-control form-control-lg"
                value={form.nombre_completo} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Correo electrónico</label>
              <input type="email" name="email" className="form-control form-control-lg"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Contraseña</label>
              <input type="password" name="clave" className="form-control form-control-lg"
                value={form.clave} onChange={handleChange} required minLength={6} />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Tipo de cuenta</label>
              <div className="d-flex gap-3">
                <div
                  onClick={() => setForm({ ...form, rol: 'estudiante' })}
                  className={`flex-fill text-center p-3 rounded border-2 border ${form.rol === 'estudiante' ? 'border-success bg-success bg-opacity-10' : 'border-secondary'}`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '1.8rem' }}>🎓</div>
                  <div className="fw-semibold mt-1">Estudiante</div>
                </div>
                <div
                  onClick={() => setForm({ ...form, rol: 'profesor' })}
                  className={`flex-fill text-center p-3 rounded border-2 border ${form.rol === 'profesor' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '1.8rem' }}>👨‍🏫</div>
                  <div className="fw-semibold mt-1">Profesor</div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn w-100 py-2 fw-bold text-white"
              style={{ background: 'linear-gradient(135deg, #00b8a2, #007a6d)' }}
              disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: '#00b8a2' }}>Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;