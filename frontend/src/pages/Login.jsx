import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', clave: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.clave);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body p-5">
          <h2 className="text-center fw-bold mb-1">Sistema PSIA</h2>
          <p className="text-center text-muted mb-4">Inicia sesión para continuar</p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Correo electrónico</label>
              <input type="email" name="email" className="form-control form-control-lg"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Contraseña</label>
              <input type="password" name="clave" className="form-control form-control-lg"
                value={form.clave} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn w-100 py-2 fw-bold text-white"
              style={{ background: 'linear-gradient(135deg, #00b8a2, #007a6d)' }}
              disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ color: '#00b8a2' }}>Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;