import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2 } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

const AlumnosView = ({ alumnos, setAlumnos, sedesDisponibles, setStatsData }) => {
  const [vistaAlumno, setVistaAlumno] = useState('tabla'); 
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
  const [alumnoEditando, setAlumnoEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterComuna, setFilterComuna] = useState('');
  const [filterSede, setFilterSede] = useState('');
  const [sedeMasiva, setSedeMasiva] = useState('');
  const [formData, setFormData] = useState({ nombre: '', rut: '', email: '', telefono: '', sexo: '', comuna: '', id_plan_matriculado: '' });
  
  // NUEVO ESTADO: Guardará los planes reales que vienen del backend
  const [planesDisponibles, setPlanesDisponibles] = useState([]);

  // NUEVO EFECTO: Carga los planes dinámicamente al montar el componente
  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/planes', {
          headers: { 'Authorization': `Bearer ${authService.getToken()}` }
        });
        const data = await response.json();
        if (data.success) {
          setPlanesDisponibles(data.data);
        }
      } catch (error) {
        console.error("Error al cargar los planes:", error);
      }
    };
    fetchPlanes();
  }, []);

  const comunasUnicas = [...new Set(alumnos.map(a => a.comuna).filter(Boolean))];

  const alumnosFiltrados = alumnos.filter(alum => {
    const matchSearch = alum.rut.toLowerCase().includes(searchTerm.toLowerCase()) || alum.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchComuna = filterComuna === '' || alum.comuna === filterComuna;
    const matchSede = filterSede === '' || alum.id_sede === Number(filterSede);
    return matchSearch && matchComuna && matchSede;
  });

  const handleCrearAlumno = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/alumnos/registro/nuevo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if(response.ok) {
        alert(data.message);
        setFormData({nombre: '', rut: '', email: '', telefono: '', sexo: '', comuna: '', id_plan_matriculado: ''});
        setVistaAlumno('tabla');
        const alumnosRes = await fetch('http://localhost:5000/api/alumnos', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
        const alData = await alumnosRes.json();
        if(alData.success) { setAlumnos(alData.data); setStatsData(prev => ({ ...prev, totalAlumnos: alData.data.length })); }
      } else { alert(data.message); }
    } catch (error) { console.error(error); }
  };

  const handleEditarAlumno = async (e) => {
    e.preventDefault();
    try {
      const payloadSeguro = { nombre: formData.nombre, telefono: formData.telefono, sexo: formData.sexo, comuna: formData.comuna, email: formData.email };
      const response = await fetch(`http://localhost:5000/api/alumnos/${alumnoEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
        body: JSON.stringify(payloadSeguro)
      });
      const data = await response.json();
      if(response.ok) {
        alert(data.message);
        setAlumnoEditando(null); setVistaAlumno('tabla');
        const alumnosRes = await fetch('http://localhost:5000/api/alumnos', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
        const alData = await alumnosRes.json();
        if(alData.success) setAlumnos(alData.data);
      } else { alert(data.message); }
    } catch (error) { console.error(error); }
  };

  const handleResetPassword = async (idAlumno) => {
    if(!window.confirm("¿Estás segura(o) de que deseas reiniciar la contraseña?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/alumnos/reset-password/${idAlumno}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
      const data = await response.json(); alert(data.message);
    } catch(error) { console.error(error); }
  };

  const handleAsignarSedeMasiva = async () => {
    if (alumnosSeleccionados.length === 0) return alert("Selecciona alumnos primero");
    if (!sedeMasiva) return alert("Por favor, elige una sede.");
    try {
      const response = await fetch('http://localhost:5000/api/alumnos/sede-alumno', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
        body: JSON.stringify({ alumnos_ids: alumnosSeleccionados, id_sede: parseInt(sedeMasiva) })
      });
      const data = await response.json();
      if(response.ok) {
        alert(data.message); setAlumnosSeleccionados([]); setSedeMasiva('');
        const alumnosRes = await fetch('http://localhost:5000/api/alumnos', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
        const alData = await alumnosRes.json();
        if(alData.success) setAlumnos(alData.data);
      } else { alert(data.message); }
    } catch (error) { console.error(error); }
  };

  const handleEliminarAlumnos = async (idsArray) => {
    if (!window.confirm("¿Confirmar eliminación permanentemente?")) return;
    try {
      const response = await fetch('http://localhost:5000/api/alumnos/eliminar', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
        body: JSON.stringify({ alumnosIds: idsArray })
      });
      const data = await response.json();
      if(response.ok) {
        alert(data.message); setAlumnosSeleccionados([]);
        const alumnosRes = await fetch('http://localhost:5000/api/alumnos', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
        const alData = await alumnosRes.json();
        if(alData.success) setAlumnos(alData.data);
      } else { alert(data.message); }
    } catch (error) { console.error(error); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: spacing.gap.normal, marginBottom: spacing.margin.large }}>
        <Button onClick={() => setVistaAlumno('tabla')} style={{ backgroundColor: vistaAlumno === 'tabla' ? colors.secretaria : colors.background, color: vistaAlumno === 'tabla' ? 'white' : colors.textPrimary }}>📋 Ver Tabla de Alumnos</Button>
        <Button onClick={() => { setFormData({nombre: '', rut: '', email: '', telefono: '', sexo: '', comuna: '', id_plan_matriculado: ''}); setVistaAlumno('crear'); }} style={{ backgroundColor: vistaAlumno === 'crear' ? colors.secretaria : colors.background, color: vistaAlumno === 'crear' ? 'white' : colors.textPrimary }}>➕ Ingresar Alumno Nuevo</Button>
      </div>

      {vistaAlumno === 'tabla' ? (
        <Card title="Directorio de Alumnos Registrados" icon={Users}>
          <div style={{ display: 'flex', gap: spacing.gap.normal, marginBottom: spacing.margin.large, flexWrap: 'wrap' }}>
            <input type="text" placeholder="Buscar por RUT o Nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 2, minWidth: '200px', padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} />
            <select value={filterComuna} onChange={(e) => setFilterComuna(e.target.value)} style={{ flex: 1, minWidth: '150px', padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}`, backgroundColor: colors.white }}>
              <option value="">Todas las Comunas</option>
              {comunasUnicas.map(comuna => <option key={comuna} value={comuna}>{comuna}</option>)}
            </select>
            <select value={filterSede} onChange={(e) => setFilterSede(e.target.value)} style={{ flex: 1, minWidth: '150px', padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}`, backgroundColor: colors.white }}>
              <option value="">Todas las Sedes</option>
              {sedesDisponibles.map(sede => <option key={sede.id} value={sede.id}>{sede.nombre}</option>)}
            </select>
            
            {alumnosSeleccionados.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', padding: '8px', backgroundColor: '#f0f9ff', border: '1px dashed #3b82f6', borderRadius: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#1e40af', fontWeight: '500' }}>Asignar a:</span>
                <select value={sedeMasiva} onChange={(e) => setSedeMasiva(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: `1px solid #bfdbfe`, outline: 'none', minWidth: '150px' }}>
                  <option value="">Elegir Sede...</option>
                  {sedesDisponibles.map(sede => <option key={sede.id} value={sede.id}>{sede.nombre}</option>)}
                </select>
                <Button style={{ backgroundColor: colors.secretaria, padding: '8px 16px' }} onClick={handleAsignarSedeMasiva}>Confirmar ({alumnosSeleccionados.length})</Button>
                <Button style={{ backgroundColor: '#ef4444', padding: '8px 16px', marginLeft: 'auto' }} onClick={() => handleEliminarAlumnos(alumnosSeleccionados)}><Trash2 size={16} style={{ marginRight: '5px', display: 'inline' }} />Eliminar ({alumnosSeleccionados.length})</Button>
              </div>
            )}
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.borderLight}`, color: colors.textSecondary }}>
                <th style={{ padding: '12px' }}>Sel.</th><th style={{ padding: '12px' }}>RUT</th><th style={{ padding: '12px' }}>Nombre</th><th style={{ padding: '12px' }}>Comuna</th><th style={{ padding: '12px' }}>Sede</th><th style={{ padding: '12px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnosFiltrados.map((alum) => (
                <tr key={alum.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                  <td style={{ padding: '12px' }}><input type="checkbox" checked={alumnosSeleccionados.includes(alum.id)} onChange={(e) => e.target.checked ? setAlumnosSeleccionados([...alumnosSeleccionados, alum.id]) : setAlumnosSeleccionados(alumnosSeleccionados.filter(id => id !== alum.id)) } /></td>
                  <td style={{ padding: '12px' }}>{alum.rut}</td><td style={{ padding: '12px', fontWeight: '500' }}>{alum.nombre}</td><td style={{ padding: '12px' }}>{alum.comuna || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{alum.id_sede && sedesDisponibles.some(s => s.id === alum.id_sede) ? <span style={{ color: colors.success, fontWeight: '500', fontSize: '14px' }}>{sedesDisponibles.find(s => s.id === alum.id_sede).nombre}</span> : <span style={{ color: colors.error, fontSize: '12px', fontWeight: 'bold' }}>Sin sede</span>}</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => { setAlumnoEditando(alum); setFormData({ ...alum, email: alum.user?.email || '' }); setVistaAlumno('editar'); }} style={{ cursor: 'pointer', border: 'none', background: 'none', color: colors.secretaria, marginRight: '15px' }}><Edit size={18} /></button>
                    <button onClick={() => handleEliminarAlumnos([alum.id])} style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#ef4444' }}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card title={vistaAlumno === 'editar' ? "Editar Datos del Alumno" : "Ingresar Nuevo Alumno"} icon={vistaAlumno === 'editar' ? Edit : UserPlus}>
          <form onSubmit={vistaAlumno === 'editar' ? handleEditarAlumno : handleCrearAlumno} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.gap.large }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label>Nombre Completo</label><input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label>RUT</label><input required type="text" disabled={vistaAlumno === 'editar'} value={formData.rut} onChange={e => setFormData({...formData, rut: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label>Email</label><input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label>Teléfono</label><input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label>Sexo</label><select value={formData.sexo} onChange={e => setFormData({...formData, sexo: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}><option value="">Seleccione...</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option></select></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label>Comuna</label><input type="text" value={formData.comuna} onChange={e => setFormData({...formData, comuna: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/></div>
            
            {/* MENÚ DE PLANES DINÁMICO */}
            {vistaAlumno === 'crear' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
                <label>Plan a Matricular</label>
                <select required value={formData.id_plan_matriculado} onChange={e => setFormData({...formData, id_plan_matriculado: Number(e.target.value)})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}>
                  <option value="">Seleccione un plan...</option>
                  {planesDisponibles.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.nombre} - ${plan.precio.toLocaleString('es-CL')}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
              <Button type="submit" style={{ backgroundColor: colors.secretaria }}>Guardar</Button>
              <Button type="button" onClick={() => setVistaAlumno('tabla')} style={{ backgroundColor: '#64748b' }}>Cancelar</Button>
              {vistaAlumno === 'editar' && <Button type="button" onClick={() => handleResetPassword(alumnoEditando.id)} style={{ backgroundColor: '#ef4444', marginLeft: 'auto' }}>Reiniciar Contraseña</Button>}
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default AlumnosView;