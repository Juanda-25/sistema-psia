import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{
      background: 'linear-gradient(180deg, #00b8a2, #000000)',
      boxShadow: '0px 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div className="container">
        <Link to="/home" className="navbar-brand fw-bold text-uppercase">
          Sistema PSIA
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center gap-1">
            <li className="nav-item">
              <Link to="/home" className={isActive('/home')}>🏠 Inicio</Link>
            </li>
            <li className="nav-item">
              <Link to="/dashboard" className={isActive('/dashboard')}>👤 Perfil</Link>
            </li>
            <li className="nav-item">
              <Link to="/grupos" className={isActive('/grupos')}>👥 Grupos</Link>
            </li>
            <li className="nav-item">
              <Link to="/calificador" className={isActive('/calificador')}>✅ Calificador</Link>
            </li>
            <li className="nav-item">
              <Link to="/preguntas" className={isActive('/preguntas')}>🤖 IA</Link>
            </li>
            <li className="nav-item">
              <span className="nav-link text-warning fw-bold">
                {user?.nombre_completo?.split(' ')[0]}
              </span>
            </li>
            <li className="nav-item">
              <button onClick={handleLogout} className="btn btn-sm btn-outline-danger ms-2">
                Salir
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;