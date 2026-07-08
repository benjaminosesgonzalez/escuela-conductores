import React, { useState, useEffect } from 'react';
import { Car, MapPin, Calendar, Clock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, Button } from './index.js'; // Adjust path if necessary
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

const SolicitarVehiculo = ({ userRole }) => {
  const [sedesDisponibles, setSedesDisponibles] = useState([]);
  const [formData, setFormData] = useState({
    id_sede: '',
    fecha_uso: '',
    hora_uso: '',
    hora_termino: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Utilidad para la fecha mínima (hoy)
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Cargar sedes al montar el componente
    const fetchSedes = async () => {
      try {
        const token = authService.getToken();
        const res = await fetch('http://localhost:5000/api/sedes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSedesDisponibles(data.data || []);
        }
      } catch (error) {
        console.error("Error cargando sedes:", error);
      }
    };
    fetchSedes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validación básica de horas
    if (formData.hora_uso >= formData.hora_termino) {
      setMessage({ type: 'error', text: 'La hora de término debe ser posterior a la de inicio.' });
      setLoading(false);
      return;
    }

    try {
      const token = authService.getToken();
      const response = await fetch('http://localhost:5000/api/solicitudes-auto', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Solicitud enviada exitosamente. La secretaría revisará la disponibilidad.' });
        // Limpiar formulario
        setFormData({ id_sede: '', fecha_uso: '', hora_uso: '', hora_termino: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al enviar la solicitud.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de red al conectar con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Solicitar Vehículo de Práctica" icon={Car}>
      <div style={{ marginBottom: spacing.margin.large }}>
        <p style={{ color: colors.textSecondary, margin: 0, fontSize: '14px' }}>
          {userRole === 'alumno' 
            ? 'Si ya finalizaste tu curso, solicita un vehículo para rendir tu examen municipal. Recuerda hacerlo con anticipación.'
            : 'Solicita un vehículo de la flota para impartir tus clases prácticas.'}
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

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.gap.large }}>
        
        {/* SEDE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
            <MapPin size={16} color={colors.textSecondary}/> Sede de retiro
          </label>
          <select 
            name="id_sede" 
            value={formData.id_sede} 
            onChange={handleChange} 
            required
            style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}`, backgroundColor: 'white' }}
          >
            <option value="">Seleccione la sede...</option>
            {sedesDisponibles.map(sede => (
              <option key={sede.id} value={sede.id}>{sede.nombre}</option>
            ))}
          </select>
        </div>

        {/* FECHA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
            <Calendar size={16} color={colors.textSecondary}/> Fecha de uso
          </label>
          <input 
            type="date" 
            name="fecha_uso"
            min={getTodayStr()}
            value={formData.fecha_uso} 
            onChange={handleChange} 
            required
            style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}
          />
        </div>

        {/* ESPACIO VACÍO PARA CUADRAR GRID */}
        <div></div>

        {/* HORA INICIO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
            <Clock size={16} color={colors.textSecondary}/> Hora de inicio
          </label>
          <input 
            type="time" 
            name="hora_uso"
            value={formData.hora_uso} 
            onChange={handleChange} 
            required
            style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}
          />
        </div>

        {/* HORA TÉRMINO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
            <Clock size={16} color={colors.textSecondary}/> Hora de término
          </label>
          <input 
            type="time" 
            name="hora_termino"
            value={formData.hora_termino} 
            onChange={handleChange} 
            required
            style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}
          />
        </div>

        <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
          <Button 
            type="submit" 
            disabled={loading}
            style={{ 
              backgroundColor: userRole === 'alumno' ? colors.alumno : colors.profesor, 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '8px' 
            }}
          >
            <Save size={18} />
            {loading ? 'Enviando solicitud...' : 'Enviar Solicitud'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SolicitarVehiculo;