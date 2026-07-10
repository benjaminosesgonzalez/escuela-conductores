import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Circle, Save, AlertCircle, Loader, Activity } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

// Utilidad para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayStr = () => new Date().toISOString().split('T')[0];

const SalaPsicotecnicaAlumno = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(getTodayStr());
  const [bloques, setBloques] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const cargarDisponibilidad = async (fechaStr) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = authService.getToken();
      // Consultamos la disponibilidad para la fecha seleccionada
      const response = await fetch(`http://localhost:5000/api/agendamiento/disponibilidad-sala?fecha=${fechaStr}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setBloques(data.data || []);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al obtener disponibilidad' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de red al conectar con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDisponibilidad(fechaSeleccionada);
    setSeleccionados([]); // Limpiamos selección al cambiar de día
  }, [fechaSeleccionada]);

  const toggleBloque = (hora_inicio) => {
    setSeleccionados(prev => {
      // Si ya está seleccionado, lo quitamos
      if (prev.includes(hora_inicio)) {
        return prev.filter(h => h !== hora_inicio);
      }
      // Validamos el límite de 2 bloques por día
      if (prev.length >= 2) {
        setMessage({ type: 'error', text: 'Solo puedes agendar un máximo de 2 bloques por día.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        return prev;
      }
      return [...prev, hora_inicio];
    });
  };

  const handleAgendar = async () => {
    if (seleccionados.length === 0) return;
    if (!window.confirm(`¿Confirmas la reserva de ${seleccionados.length} bloque(s) para el ${fechaSeleccionada}?`)) return;
    
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = authService.getToken();
      
      // Enviamos una petición POST por cada bloque seleccionado
      const promesas = seleccionados.map(hora_inicio => 
        fetch('http://localhost:5000/api/agendamiento/agendar-bloque', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ fecha: fechaSeleccionada, hora_inicio })
        })
      );

      const resultados = await Promise.all(promesas);
      let hayError = false;

      for (let res of resultados) {
        if (!res.ok) {
          const errData = await res.json();
          setMessage({ type: 'error', text: errData.message });
          hayError = true;
          break; // Detenemos la lectura si uno falla (ej. LÍMITE_EXCEDIDO)
        }
      }

      if (!hayError) {
        setMessage({ type: 'success', text: 'Bloques agendados exitosamente. ¡Te esperamos!' });
        setSeleccionados([]);
        cargarDisponibilidad(fechaSeleccionada); // Recargamos para actualizar vista
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ocurrió un error al procesar tu reserva.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: spacing.margin.xlarge }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 8px 0' }}>
          Sala Psicotécnica
        </h2>
        <p style={{ fontSize: '20px', color: colors.textSecondary, margin: 0 }}>
          Reserva equipos psicotécnicos. Máximo 2 bloques (30 min) por día.
        </p>
      </div>

      {message.text && (
        <div style={{
          marginBottom: spacing.margin.lg, padding: spacing.padding.lg,
          backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
          border: `1px solid ${message.type === 'error' ? colors.danger : colors.success}`,
          borderRadius: spacing.radius.lg,
          color: message.type === 'error' ? colors.danger : colors.success,
          display: 'flex', alignItems: 'center', gap: spacing.gap.normal, fontSize: '14px'
        }}>
          {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing.gap.spacious, marginBottom: spacing.margin.xlarge }}>
        <Card title="Elige una fecha" icon={Calendar}>
          <div style={{ display: 'flex', gap: spacing.gap.normal, alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="date" 
              value={fechaSeleccionada}
              min={getTodayStr()}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              style={{
                padding: '12px', borderRadius: spacing.radius.md, border: `1px solid ${colors.borderLight}`,
                fontSize: '16px', color: colors.textPrimary, outline: 'none'
              }}
            />
            <p style={{ color: colors.textTertiary, fontSize: '14px', margin: 0 }}>
              Selecciona el día en el que deseas asistir a la sala psicotécnica.
            </p>
          </div>
        </Card>
      </div>

      <Card title={`Horarios disponibles - ${fechaSeleccionada}`} icon={Activity}>
        {loading ? (
          <div style={{ padding: spacing.padding.xlarge, textAlign: 'center', color: colors.textTertiary }}>
            <Loader size={32} style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
            Buscando horarios...
          </div>
        ) : bloques.length === 0 ? (
          <div style={{ padding: spacing.padding.xlarge, textAlign: 'center', color: colors.textTertiary }}>
            No hay horarios configurados o la sala está cerrada en esta fecha.
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: spacing.gap.normal, marginBottom: spacing.margin.xlarge }}>
              {bloques.map((bloque, idx) => {
                const isSelected = seleccionados.includes(bloque.hora_inicio);
                const isUnavailable = !bloque.disponible;

                return (
                  <div
                    key={idx}
                    onClick={() => !isUnavailable && toggleBloque(bloque.hora_inicio)}
                    style={{
                      padding: spacing.padding.lg,
                      backgroundColor: isUnavailable ? '#f1f5f9' : isSelected ? '#f0fdf4' : 'white',
                      border: `2px solid ${isUnavailable ? colors.borderLight : isSelected ? colors.success : colors.borderLight}`,
                      borderRadius: spacing.radius.md,
                      cursor: isUnavailable ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center', gap: spacing.gap.normal,
                      opacity: isUnavailable ? 0.6 : 1
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: spacing.radius.full,
                      backgroundColor: isUnavailable ? '#e2e8f0' : isSelected ? '#dcfce7' : '#f8fafc',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {isUnavailable ? <Circle size={24} color="#94a3b8" /> : isSelected ? <CheckCircle size={24} color={colors.success} /> : <Clock size={24} color={colors.alumno} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 4px 0' }}>
                        {bloque.hora_inicio} - {bloque.hora_fin}
                      </p>
                      <p style={{ fontSize: '12px', color: isUnavailable ? '#64748b' : isSelected ? colors.success : colors.textTertiary, margin: 0, fontWeight: '500' }}>
                        {isUnavailable ? 'Ocupado' : isSelected ? '✓ Seleccionado' : 'Disponible'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              variant="success"
              fullWidth={true}
              onClick={handleAgendar}
              disabled={saving || seleccionados.length === 0}
              icon={Save}
              size="lg"
            >
              {saving ? 'Procesando reserva...' : `Confirmar ${seleccionados.length} bloque(s)`}
            </Button>
          </>
        )}
      </Card>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SalaPsicotecnicaAlumno;