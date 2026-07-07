import React, { useState } from 'react';
import { Calendar, Save, CheckSquare, Square } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

// Genera los bloques de 15 minutos desde 09:00 hasta 19:45
const generateTimeSlots = () => {
  const slots = [];
  let hour = 9;
  let min = 0;
  while (hour < 20) {
    const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
    slots.push(timeStr);
    min += 15;
    if (min === 60) { hour++; min = 0; }
  }
  return slots;
};

// Calcula la hora de fin sumando 15 mins (para el backend)
const getHoraFin = (timeStr) => {
  let [h, m] = timeStr.split(':').map(Number);
  m += 15;
  if (m === 60) { h++; m = 0; }
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
};

const diasSemana = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' }
];

const timeSlots = generateTimeSlots();

const SalaPsicotecnicaView = () => {
  // Estado que guarda los bloques seleccionados por día { 1: ['09:00', '09:15'], 2: [] ... }
  const [selectedBlocks, setSelectedBlocks] = useState({
    1: [], 2: [], 3: [], 4: [], 5: []
  });

  const [isSaving, setIsSaving] = useState(false);

  // Seleccionar/Deseleccionar un bloque individual
  const toggleBlock = (diaId, timeStr) => {
    setSelectedBlocks(prev => {
      const dayBlocks = prev[diaId];
      if (dayBlocks.includes(timeStr)) {
        return { ...prev, [diaId]: dayBlocks.filter(t => t !== timeStr) };
      } else {
        return { ...prev, [diaId]: [...dayBlocks, timeStr] };
      }
    });
  };

  // Seleccionar/Deseleccionar el día completo
  const toggleDay = (diaId) => {
    setSelectedBlocks(prev => {
      if (prev[diaId].length === timeSlots.length) {
        return { ...prev, [diaId]: [] }; // Deseleccionar todo
      } else {
        return { ...prev, [diaId]: [...timeSlots] }; // Seleccionar todo
      }
    });
  };

  const handleConfirmar = async () => {
    if (!window.confirm("¿Confirmas que deseas aplicar este horario para la sala psicotécnica?")) return;
    setIsSaving(true);

    try {
      // Iteramos por cada día para enviar su rango
      const promises = diasSemana.map(async (dia) => {
        const blocks = selectedBlocks[dia.id];
        
        // Si no hay bloques, no enviamos nada (o podrías hacer un endpoint para borrar, pero por ahora lo omitimos)
        if (blocks.length === 0) return Promise.resolve();

        // Ordenamos los tiempos para buscar el inicio y el fin
        const sortedBlocks = [...blocks].sort();
        const hora_inicio = `${sortedBlocks[0]}:00`;
        const hora_fin = getHoraFin(sortedBlocks[sortedBlocks.length - 1]);

        return fetch('http://localhost:5000/api/agendamiento/configurar-sala', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          },
          body: JSON.stringify({ 
            dia_semana: dia.id, 
            hora_inicio, 
            hora_fin 
          })
        });
      });

      await Promise.all(promises);
      alert("Horarios de la sala psicotécnica configurados exitosamente. Los alumnos ya pueden agendar.");
    } catch (error) {
      console.error("Error al configurar horario:", error);
      alert("Ocurrió un error al guardar los horarios.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card title="Configuración de Sala Psicotécnica" icon={Calendar}>
      <div style={{ marginBottom: spacing.margin.large, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: colors.textSecondary, margin: 0, fontSize: '14px', maxWidth: '600px' }}>
          Haz clic en las celdas para marcar los bloques de 15 minutos en los que la sala estará abierta. 
          El sistema agrupará tu selección calculando la hora de apertura y cierre por cada día.
        </p>
        <Button 
          onClick={handleConfirmar} 
          disabled={isSaving}
          style={{ backgroundColor: colors.secretaria, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Save size={18} />
          {isSaving ? 'Guardando...' : 'Confirmar Horario'}
        </Button>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: spacing.radius.md, border: `1px solid ${colors.borderLight}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '14px' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', backgroundColor: '#f8fafc', borderBottom: `2px solid ${colors.borderLight}`, borderRight: `1px solid ${colors.borderLight}`, width: '80px' }}>
                Hora
              </th>
              {diasSemana.map(dia => (
                <th key={dia.id} style={{ padding: '12px', backgroundColor: '#f8fafc', borderBottom: `2px solid ${colors.borderLight}`, borderRight: `1px solid ${colors.borderLight}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600', color: colors.textPrimary }}>{dia.nombre}</span>
                    <button 
                      onClick={() => toggleDay(dia.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.secretaria, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                    >
                      {selectedBlocks[dia.id].length === timeSlots.length ? <CheckSquare size={14} /> : <Square size={14} />}
                      Todo el día
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time}>
                <td style={{ padding: '8px', borderBottom: `1px solid ${colors.borderLight}`, borderRight: `1px solid ${colors.borderLight}`, fontWeight: '500', color: colors.textSecondary, backgroundColor: '#f8fafc' }}>
                  {time}
                </td>
                {diasSemana.map(dia => {
                  const isSelected = selectedBlocks[dia.id].includes(time);
                  return (
                    <td 
                      key={`${dia.id}-${time}`}
                      onClick={() => toggleBlock(dia.id, time)}
                      style={{ 
                        padding: '0', 
                        borderBottom: `1px solid ${colors.borderLight}`, 
                        borderRight: `1px solid ${colors.borderLight}`,
                        backgroundColor: isSelected ? '#dbeafe' : 'white',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      <div style={{ height: '30px', width: '100%' }}></div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SalaPsicotecnicaView;