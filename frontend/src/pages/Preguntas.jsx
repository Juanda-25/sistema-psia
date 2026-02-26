import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const PREGUNTAS_FRECUENTES = [
  '¿Qué es un PAT Colectivo?',
  '¿Cuál es la estructura del documento PAT?',
  '¿Cómo redacto los objetivos correctamente?',
  '¿Cómo hago el diagnóstico grupal?',
  '¿Cómo cito en normas APA?',
  '¿Qué debe tener el plan de acción?',
  '¿Cómo mejorar la nota en redacción?',
  '¿Qué errores debo evitar en el PAT?',
];

const Preguntas = () => {
  const [historial, setHistorial] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historial]);

  const enviarMensaje = async (texto) => {
    const mensajeTexto = texto || mensaje;
    if (!mensajeTexto.trim()) return;

    const nuevoHistorial = [
      ...historial,
      { role: 'user', content: mensajeTexto }
    ];
    setHistorial(nuevoHistorial);
    setMensaje('');
    setCargando(true);
    setError('');

    try {
      const { data } = await api.post('/ia/chat', {
        mensaje: mensajeTexto,
        historial: historial,
      });

      setHistorial([
        ...nuevoHistorial,
        { role: 'assistant', content: data.respuesta }
      ]);
    } catch (err) {
      setError('❌ ' + (err.response?.data?.message || 'Error al conectar con la IA'));
      setHistorial(nuevoHistorial);
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  const limpiarChat = () => {
    setHistorial([]);
    setError('');
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: '100px', maxWidth: '800px' }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h4 className="fw-bold mb-0">🤖 Asistente PAT</h4>
            <p className="text-muted small mb-0">
              IA entrenada para ayudarte con tu documento PAT Colectivo
            </p>
          </div>
          {historial.length > 0 && (
            <button className="btn btn-sm btn-outline-secondary"
              onClick={limpiarChat}>
              🗑️ Limpiar chat
            </button>
          )}
        </div>

        {/* Preguntas frecuentes */}
        {historial.length === 0 && (
          <div className="mb-4">
            <p className="text-muted small mb-2">💡 Preguntas frecuentes:</p>
            <div className="d-flex flex-wrap gap-2">
              {PREGUNTAS_FRECUENTES.map((p, i) => (
                <button key={i}
                  className="btn btn-sm btn-outline-secondary rounded-pill"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => enviarMensaje(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Área del chat */}
        <div className="card border-0 shadow-sm mb-3"
          style={{ height: '450px', overflowY: 'auto', background: '#f8f9fa' }}>
          <div className="p-3">

            {historial.length === 0 && (
              <div className="text-center p-5">
                <div style={{ fontSize: '4rem' }}>🤖</div>
                <h6 className="mt-3 fw-bold">¡Hola! Soy tu asistente PAT</h6>
                <p className="text-muted small">
                  Estoy entrenado para ayudarte con todo lo relacionado al
                  <strong> PAT Colectivo</strong>. Puedes preguntarme sobre
                  estructura, redacción, criterios de evaluación y más.
                </p>
              </div>
            )}

            {historial.map((msg, i) => (
              <div key={i} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white me-2"
                    style={{ width: 34, height: 34, minWidth: 34, fontSize: '1rem' }}>
                    🤖
                  </div>
                )}
                <div className={`p-3 rounded-3 ${msg.role === 'user'
                  ? 'text-white'
                  : 'bg-white border'}`}
                  style={{
                    maxWidth: '80%',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #00b8a2, #007a6d)'
                      : undefined,
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white ms-2"
                    style={{ width: 34, height: 34, minWidth: 34, fontSize: '0.8rem' }}>
                    👤
                  </div>
                )}
              </div>
            ))}

            {cargando && (
              <div className="d-flex justify-content-start mb-3">
                <div className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white me-2"
                  style={{ width: 34, height: 34, minWidth: 34 }}>
                  🤖
                </div>
                <div className="p-3 rounded-3 bg-white border">
                  <div className="d-flex gap-1 align-items-center">
                    <div className="spinner-grow spinner-grow-sm text-secondary" style={{ width: '6px', height: '6px' }} />
                    <div className="spinner-grow spinner-grow-sm text-secondary" style={{ width: '6px', height: '6px', animationDelay: '0.2s' }} />
                    <div className="spinner-grow spinner-grow-sm text-secondary" style={{ width: '6px', height: '6px', animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2 small">{error}</div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Sugerencias rápidas si ya hay historial */}
        {historial.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-3">
            {PREGUNTAS_FRECUENTES.slice(0, 4).map((p, i) => (
              <button key={i}
                className="btn btn-sm btn-outline-secondary rounded-pill"
                style={{ fontSize: '0.75rem' }}
                onClick={() => enviarMensaje(p)}
                disabled={cargando}>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input del mensaje */}
        <div className="card border-0 shadow-sm p-3">
          <div className="d-flex gap-2 align-items-end">
            <textarea
              className="form-control border-0"
              rows={2}
              placeholder="Escribe tu pregunta sobre el PAT Colectivo... (Enter para enviar)"
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={cargando}
              style={{ resize: 'none', background: '#f8f9fa', borderRadius: '12px' }}
            />
            <button
              className="btn text-white fw-bold px-4"
              style={{
                background: cargando ? '#ccc' : 'linear-gradient(135deg, #00b8a2, #007a6d)',
                borderRadius: '12px',
                minWidth: '80px'
              }}
              onClick={() => enviarMensaje()}
              disabled={cargando || !mensaje.trim()}>
              {cargando ? (
                <span className="spinner-border spinner-border-sm" />
              ) : '➤'}
            </button>
          </div>
          <small className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
            Presiona Enter para enviar · Shift+Enter para nueva línea
          </small>
        </div>
      </div>
    </>
  );
};

export default Preguntas;