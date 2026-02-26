import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ hobbies: '', contacto: '', semestre: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/profile').then(({ data }) => {
      setProfile(data);
      setForm({ hobbies: data.hobbies || '', contacto: data.contacto || '', semestre: data.semestre || '' });
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', form);
      setMsg('✅ Perfil actualizado correctamente');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('❌ Error al guardar');
    }
  };

  if (loading) return <><Navbar /><div className="container" style={{ paddingTop: '100px' }}>Cargando perfil...</div></>;

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '100px', maxWidth: '640px' }}>
        <h4 className="fw-bold mb-4">Mi Perfil</h4>

        <div className="card border-0 shadow-sm p-4 mb-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: 60, height: 60, fontSize: '1.5rem' }}>
              {profile?.nombre_completo?.[0]}
            </div>
            <div>
              <h5 className="mb-0 fw-bold">{profile?.nombre_completo}</h5>
              <small className="text-muted">{profile?.email}</small><br />
              <span className={`badge ${profile?.rol === 'profesor' ? 'bg-primary' : 'bg-secondary'}`}>
                {profile?.rol}
              </span>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm p-4">
          <h6 className="fw-bold mb-3">Editar información</h6>
          {msg && <div className="alert alert-info py-2">{msg}</div>}
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label">Semestre</label>
              <input type="text" className="form-control" value={form.semestre}
                onChange={e => setForm({ ...form, semestre: e.target.value })} placeholder="Ej: 5to semestre" />
            </div>
            <div className="mb-3">
              <label className="form-label">Contacto / Teléfono</label>
              <input type="text" className="form-control" value={form.contacto}
                onChange={e => setForm({ ...form, contacto: e.target.value })} placeholder="+57 300 000 0000" />
            </div>
            <div className="mb-4">
              <label className="form-label">Hobbies / Intereses</label>
              <textarea className="form-control" rows={3} value={form.hobbies}
                onChange={e => setForm({ ...form, hobbies: e.target.value })} placeholder="Música, deportes..." />
            </div>
            <button type="submit" className="btn text-white fw-bold w-100"
              style={{ background: 'linear-gradient(135deg, #00b8a2, #007a6d)' }}>
              Guardar cambios
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Dashboard;