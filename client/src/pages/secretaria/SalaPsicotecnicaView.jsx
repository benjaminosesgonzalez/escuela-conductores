import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Save, CheckSquare, Square, Loader } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

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

const getHoraFin = (timeStr) => {
  let [h, m] = timeStr.split(':').map(Number);
  m += 15;
  if (m === 60) { h++; m = 0; }
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
};

const getTodayStr = () => new Date().toISOString().split('T')[0];

const getDiasDeLaSemana = (fechaBaseStr) => {
  const baseDate = new Date(fechaBaseStr + 'T12:00:00'); 
  const day = baseDate.getDay();
  const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(baseDate.setDate(diff));

  const week = [];
  const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  
  for (let i = 0; i < 5; i++) {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);
    week.push({
      id: i + 1,
      nombre: nombresDias[i],
      fecha: currentDate.toISOString().split('T')[0] 
    });
  }
  return week;
};

const timeSlots = generateTimeSlots();

const SalaPsicotecnicaView = () => {
  const [fechaBase, setFechaBase] = useState(getTodayStr());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingWeek, setIsLoadingWeek] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState({
    1: [], 2: [], 3: [], 4: [], 5: []
  });

  const diasSemana = useMemo(() => getDiasDeLaSemana(fechaBase), [fechaBase]);

  // Carga los horarios guardados cada vez que cambias la semana
  useEffect(() => {
    const fetchSemana = async () => {
      setIsLoadingWeek(true);
      try {
        const newSelectedBlocks = { 1: [], 2: [], 3: [], 4: [], 5: [] };
        const token = authService.getToken();

        // Consultamos la disponibilidad de los 5 días en paralelo
        const promises = diasSemana.map(async (dia) => {
          const res = await fetch(`http://localhost:5000/api/agendamiento/disponibilidad-sala?fecha=${dia.fecha}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            // Si hay bloques configurados para ese día, extraemos sus horas de inicio
            if (data.data && data.data.length > 0) {
              newSelectedBlocks[dia.id] = data.data.map(b => b.hora_inicio);
            }
          }
        });

        await Promise.all(promises);
        setSelectedBlocks(newSelectedBlocks); // Actualizamos la tabla
      } catch (error) {
        console.error("Error cargando la semana:", error);
      } finally {
        setIsLoadingWeek(false);
      }
    };

    fetchSemana();
  }, [fechaBase, diasSemana]);

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

  const toggleDay = (diaId) => {
    setSelectedBlocks(prev => {
      if (prev[diaId].length === timeSlots.length) {
        return { ...prev, [diaId]: [] }; 
      } else {
        return { ...prev, [diaId]: [...timeSlots] }; 
      }
    });
  };

  const handleConfirmar = async () => {
    if (!window.confirm("¿Confirmas que deseas aplicar este horario para la semana seleccionada?")) return;
    setIsSaving(true);

    try {
      const promises = diasSemana.map(async (dia) => {
        const blocks = selectedBlocks[dia.id];
        
        let hora_inicio = null;
        let hora_fin = null;
        
        // Si hay bloques seleccionados, calculamos las horas. Si no, quedan en null.
        if (blocks.length > 0) {
          const sortedBlocks = [...blocks].sort();
          hora_inicio = `${sortedBlocks[0]}:00`;
          hora_fin = getHoraFin(sortedBlocks[sortedBlocks.length - 1]);
        }

        return fetch('http://localhost:5000/api/agendamiento/configurar-sala', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`
          },
          body: JSON.stringify({ 
            fecha: dia.fecha,
            hora_inicio, 
            hora_fin 
          })
        });
      });

      await Promise.all(promises);
      alert("Horarios guardados exitosamente.");
    } catch (error) {
      console.error("Error al configurar horario:", error);
      alert("Ocurrió un error al guardar los horarios.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card title="Configuración de Sala Psicotécnica" icon={Calendar}>
      
      <div style={{ display: 'flex', gap: spacing.gap.normal, alignItems: 'center', flexWrap: 'wrap', marginBottom: spacing.margin.large, padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: `1px solid ${colors.borderLight}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={20} color={colors.secretaria} />
          <label style={{ fontWeight: 'bold' }}>Selecciona una fecha de la semana a configurar:</label>
        </div>
        <input 
          type="date" 
          value={fechaBase}
          onChange={(e) => setFechaBase(e.target.value)}
          style={{
            padding: '10px', borderRadius: spacing.radius.md, border: `1px solid ${colors.borderLight}`,
            fontSize: '15px', outline: 'none'
          }}
        />
        {isLoadingWeek ? (
           <span style={{ fontSize: '13px', color: colors.secretaria, display: 'flex', alignItems: 'center', gap: '5px' }}>
             <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Cargando horarios de la semana...
           </span>
        ) : (
          <span style={{ fontSize: '13px', color: colors.textTertiary }}>
            El sistema calculó los días de esta semana.
          </span>
        )}
      </div>

      <div style={{ marginBottom: spacing.margin.large, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: colors.textSecondary, margin: 0, fontSize: '14px', maxWidth: '600px' }}>
          Haz clic en las celdas para marcar los bloques de 15 minutos en los que la sala estará abierta. 
        </p>
        <Button 
          onClick={handleConfirmar} 
          disabled={isSaving || isLoadingWeek}
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
                    <span style={{ fontSize: '12px', color: colors.textSecondary }}>{dia.fecha}</span>
                    <button 
                      onClick={() => toggleDay(dia.id)}
                      disabled={isLoadingWeek}
                      style={{ background: 'none', border: 'none', cursor: isLoadingWeek ? 'not-allowed' : 'pointer', color: colors.secretaria, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
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
                      onClick={() => !isLoadingWeek && toggleBlock(dia.id, time)}
                      style={{ 
                        padding: '0', 
                        borderBottom: `1px solid ${colors.borderLight}`, 
                        borderRight: `1px solid ${colors.borderLight}`,
                        backgroundColor: isSelected ? '#dbeafe' : 'white',
                        cursor: isLoadingWeek ? 'wait' : 'pointer',
                        transition: 'background-color 0.1s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected && !isLoadingWeek) e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected && !isLoadingWeek) e.currentTarget.style.backgroundColor = 'white';
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
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Card>
  );
};

export default SalaPsicotecnicaView;