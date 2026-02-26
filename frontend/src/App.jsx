import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login       from './pages/Login';
import Register    from './pages/Register';
import Home        from './pages/Home';
import Dashboard   from './pages/Dashboard';
import Calificador from './pages/Calificador';
import Preguntas   from './pages/Preguntas';
import Grupos      from './pages/Grupos';

import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/home"        element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/calificador" element={<ProtectedRoute><Calificador /></ProtectedRoute>} />
        <Route path="/preguntas"   element={<ProtectedRoute><Preguntas /></ProtectedRoute>} />
        <Route path="/grupos"      element={<ProtectedRoute><Grupos /></ProtectedRoute>} />
        <Route path="/"            element={<Navigate to="/login" replace />} />
        <Route path="*"            element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;