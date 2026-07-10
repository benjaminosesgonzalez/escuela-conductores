import React, { useState } from 'react';
import { Users, Plus, ClipboardList, Save, AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

const ProfesoresView = ({ profesores, setProfesores, sedesDisponibles }) => {
  // --- ESTADOS GENERALES ---
  const [vistaActual, setVistaActual] = useState('tabla'); // 'tabla', 'nuevo', 'editar'
  
  // --- ESTADOS TABLA Y FILTROS ---
  const [profesoresSeleccionados, setProfesoresSeleccionados] = useState([]);
  const [sedesMasivasProfes, setSedesMasivasProfes] = useState([]); 
  const [searchTermProfes, setSearchTermProfes] = useState('');
  const [filterSedeProfes, setFilterSedeProfes] = useState('');

  // --- ESTADOS FORMULARIO NUEVO ---
  const [formDataNuevo, setFormDataNuevo] = useState({
    rut: '', nombre: '', email: '', password: '', telefono: '', tipo_contrato: 'full_time'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // --- ESTADOS FORMULARIO EDICIÓN ---
  const [profesorEditando, setProfesorEditando] = useState(null);
  const [formDataEditar, setFormDataEditar] = useState({ 
    nombre: '', rut: '', telefono: '', tipo_contrato: 'full_time' 
  });

  // --- LÓGICA DE FILTRADO ---
  const profesoresFiltrados = profesores.filter(prof => {
    const matchSearch = (prof.rut && prof.rut.toLowerCase().includes(searchTermProfes.toLowerCase())) || (prof.nombre && prof.nombre.toLowerCase().includes(searchTermProfes.toLowerCase()));
    const matchSede = filterSedeProfes === '' || (prof.sedes && prof.sedes.some(s => s.id === Number(filterSedeProfes)));
    return matchSearch && matchSede;
  });

  // --- FUNCIONES DE TABLA (Originales y Restauradas) ---
  const handleAsignarSedesMasivaProfesores = async () => {
    if (profesoresSeleccionados.length === 0 || sedesMasivasProfes.length === 0) return alert("Selecciona profesores y al menos una sede.");
    try {
      const response = await fetch('http://localhost:5000/api/profesores/sedes-profesor', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
        body: JSON.stringify({ profesores_ids: profesoresSeleccionados, sedes_ids: sedesMasivasProfes.map(Number) })
      });
      const data = await response.json();
      if(response.ok) {
        alert(data.message); setProfesoresSeleccionados([]); setSedesMasivasProfes([]); 
        const profesRes = await fetch('http://localhost:5000/api/profesores', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
        const pData = await profesRes.json();
        if(pData.success) setProfesores(pData.data);
      } else { alert(data.message); }
    } catch (error) { console.error(error); }
  };

  const handleEliminarProfesores = async (idsArray) => {
    if (!window.confirm("¿Confirmar eliminación permanentemente?")) return;
    try {
      const response = await fetch('http://localhost:5000/api/profesores/eliminar', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
        body: JSON.stringify({ profesoresIds: idsArray })
      });
      const data = await response.json();
      if(response.ok) {
        alert(data.message); setProfesoresSeleccionados([]); 
        const profesRes = await fetch('http://localhost:5000/api/profesores', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
        const pData = await profesRes.json();
        if(pData.success) setProfesores(pData.data);
      } else { alert(data.message); }
    } catch (error) { console.error(error); }
  };

  const handleResetPasswordProfesor = async (idProfesor) => {
    if(!window.confirm("¿Confirmar reinicio de contraseña?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/profesores/reset-password/${idProfesor}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
      const data = await response.json(); alert(data.message);
    } catch(error) { console.error(error); }
  };

  // --- FUNCIONES FORMULARIO NUEVO ---
  const handleChangeNuevo = (e) => {
    const { name, value } = e.target;
    setFormDataNuevo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitNuevo = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage({ type: '', text: '' });
    try {
      const response = await fetch('http://localhost:5000/api/profesores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
        body: JSON.stringify(formDataNuevo)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Profesor registrado exitosamente.' });
        setProfesores(prev => [...prev, data.data]);
        setFormDataNuevo({ rut: '', nombre: '', email: '', password: '', telefono: '', tipo_contrato: 'full_time' });
        setTimeout(() => setVistaActual('tabla'), 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al registrar el profesor.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIONES FORMULARIO EDICIÓN ---
  const handleEditarProfesor = async (e) => {
    e.preventDefault();
    try {
      const payload = { nombre: formDataEditar.nombre, telefono: formDataEditar.telefono, tipo_contrato: formDataEditar.tipo_contrato };
      const response = await fetch(`http://localhost:5000/api/profesores/${profesorEditando.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
        body: JSON.stringify(payload)
      });
      if(response.ok) {
        alert("Actualizado exitosamente"); setProfesorEditando(null); setVistaActual('tabla');
        const profesRes = await fetch('http://localhost:5000/api/profesores', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
        const pData = await profesRes.json();
        if(pData.success) setProfesores(pData.data);
      }
    } catch (error) { console.error(error); }
  };

  // --- ESTILOS MENÚ ---
  const getTabStyle = (tabName) => ({
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px',
    cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', border: 'none', transition: 'all 0.2s',
    backgroundColor: vistaActual === tabName ? colors.primary : 'transparent',
    color: vistaActual === tabName ? 'white' : colors.textSecondary,
  });

  return (
    <div>
      {/* MENÚ DE PESTAÑAS */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: spacing.margin.xlarge, borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '16px' }}>
        <button onClick={() => setVistaActual('tabla')} style={getTabStyle('tabla')}>
          <ClipboardList size={20} /> Ver Tabla de Profesores
        </button>
        <button onClick={() => setVistaActual('nuevo')} style={getTabStyle('nuevo')}>
          <Plus size={20} /> Ingresar Profesor Nuevo
        </button>
      </div>

      {/* VISTA: TABLA */}
      {vistaActual === 'tabla' && (
        <Card title="Directorio de Profesores Registrados" icon={Users}>
          <div style={{ display: 'flex', gap: spacing.gap.normal, marginBottom: spacing.margin.large, flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="text" placeholder="Buscar por RUT o Nombre..." value={searchTermProfes} onChange={(e) => setSearchTermProfes(e.target.value)} style={{ flex: 2, minWidth: '200px', padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} />
            <select value={filterSedeProfes} onChange={(e) => setFilterSedeProfes(e.target.value)} style={{ flex: 1, minWidth: '150px', padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}>
              <option value="">Todas las Sedes</option>
              {sedesDisponibles.map(sede => <option key={sede.id} value={sede.id}>{sede.nombre}</option>)}
            </select>

            {profesoresSeleccionados.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', padding: '8px', backgroundColor: '#f0f9ff', border: '1px dashed #3b82f6', borderRadius: '8px', alignItems: 'center', width: '100%' }}>
                <span style={{ fontSize: '14px', color: '#1e40af', fontWeight: '500' }}>Asignar Sedes (Ctrl+Click):</span>
                <select multiple value={sedesMasivasProfes} onChange={(e) => setSedesMasivasProfes(Array.from(e.target.selectedOptions, option => option.value))} style={{ padding: '8px', borderRadius: '4px', border: `1px solid #bfdbfe`, outline: 'none', minWidth: '180px', maxHeight: '60px' }}>
                  {sedesDisponibles.map(sede => <option key={sede.id} value={sede.id}>{sede.nombre}</option>)}
                </select>
                <Button style={{ backgroundColor: colors.secretaria, padding: '8px 16px' }} onClick={handleAsignarSedesMasivaProfesores}>Confirmar ({profesoresSeleccionados.length})</Button>
                <Button style={{ backgroundColor: '#ef4444', padding: '8px 16px', marginLeft: 'auto' }} onClick={() => handleEliminarProfesores(profesoresSeleccionados)}><Trash2 size={16} style={{ marginRight: '5px', display: 'inline' }} />Eliminar</Button>
              </div>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.borderLight}`, color: colors.textSecondary }}>
                  <th style={{ padding: '12px' }}>Sel.</th><th style={{ padding: '12px' }}>RUT</th><th style={{ padding: '12px' }}>Nombre</th><th style={{ padding: '12px' }}>Sedes Asignadas</th><th style={{ padding: '12px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {profesoresFiltrados.map((prof) => (
                  <tr key={prof.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                    <td style={{ padding: '12px' }}>
                      <input type="checkbox" checked={profesoresSeleccionados.includes(prof.id)} onChange={(e) => e.target.checked ? setProfesoresSeleccionados([...profesoresSeleccionados, prof.id]) : setProfesoresSeleccionados(profesoresSeleccionados.filter(id => id !== prof.id))} />
                    </td>
                    <td style={{ padding: '12px' }}>{prof.rut}</td>
                    <td style={{ padding: '12px', fontWeight: '500' }}>{prof.nombre || 'Sin nombre'}</td>
                    <td style={{ padding: '12px' }}>
                      {prof.sedes?.length > 0 ? <span style={{ color: colors.success }}>{prof.sedes.map(s => s.nombre).join(', ')}</span> : <span style={{ color: colors.error }}>Sin sede</span>}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => { setProfesorEditando(prof); setFormDataEditar({ nombre: prof.nombre || '', rut: prof.rut || '', telefono: prof.telefono || '', tipo_contrato: prof.tipo_contrato || 'full_time' }); setVistaActual('editar'); }} style={{ cursor: 'pointer', border: 'none', background: 'none', color: colors.secretaria, marginRight: '15px' }} title="Editar"><Edit size={18} /></button>
                      <button onClick={() => handleEliminarProfesores([prof.id])} style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#ef4444' }} title="Eliminar"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* VISTA: FORMULARIO NUEVO PROFESOR */}
      {vistaActual === 'nuevo' && (
        <Card title="Registrar Nuevo Profesor" icon={Plus}>
          {message.text && (
            <div style={{ marginBottom: spacing.margin.lg, padding: spacing.padding.lg, backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', border: `1px solid ${message.type === 'error' ? colors.danger : colors.success}`, borderRadius: spacing.radius.lg, color: message.type === 'error' ? colors.danger : colors.success, display: 'flex', alignItems: 'center', gap: spacing.gap.normal, fontSize: "14px" }}>
              {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />} {message.text}
            </div>
          )}
          <form onSubmit={handleSubmitNuevo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.gap.large }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label style={{ fontWeight: '500', color: colors.textPrimary }}>RUT (Sin puntos, con guion)</label><input type="text" name="rut" value={formDataNuevo.rut} onChange={handleChangeNuevo} required placeholder="Ej: 12345678-9" style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label style={{ fontWeight: '500', color: colors.textPrimary }}>Nombre Completo</label><input type="text" name="nombre" value={formDataNuevo.nombre} onChange={handleChangeNuevo} required placeholder="Ej: Juan Pérez" style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label style={{ fontWeight: '500', color: colors.textPrimary }}>Correo Electrónico</label><input type="email" name="email" value={formDataNuevo.email} onChange={handleChangeNuevo} required placeholder="Ej: profesor@escuela.cl" style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label style={{ fontWeight: '500', color: colors.textPrimary }}>Contraseña Temporal</label><input type="password" name="password" value={formDataNuevo.password} onChange={handleChangeNuevo} required placeholder="Contraseña de acceso" style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label style={{ fontWeight: '500', color: colors.textPrimary }}>Teléfono</label><input type="text" name="telefono" value={formDataNuevo.telefono} onChange={handleChangeNuevo} required placeholder="Ej: +569 12345678" style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label style={{ fontWeight: '500', color: colors.textPrimary }}>Tipo de Contrato</label><select name="tipo_contrato" value={formDataNuevo.tipo_contrato} onChange={handleChangeNuevo} required style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}`, backgroundColor: 'white' }}><option value="full_time">Full Time</option><option value="part_time">Part Time</option></select></div>
            <div style={{ gridColumn: 'span 2', marginTop: '16px' }}><Button type="submit" variant="primary" disabled={loading} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}><Save size={20} />{loading ? 'Guardando...' : 'Guardar Nuevo Profesor'}</Button></div>
          </form>
        </Card>
      )}

      {/* VISTA: EDICIÓN PROFESOR */}
      {vistaActual === 'editar' && profesorEditando && (
        <Card title="Editar Datos del Profesor" icon={Edit}>
          <form onSubmit={handleEditarProfesor} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.gap.large }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label>Nombre Completo</label><input required type="text" value={formDataEditar.nombre} onChange={e => setFormDataEditar({...formDataEditar, nombre: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label>RUT (No editable)</label><input type="text" disabled value={formDataEditar.rut} style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#f3f4f6' }}/></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label>Teléfono</label><input type="text" value={formDataEditar.telefono} onChange={e => setFormDataEditar({...formDataEditar, telefono: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><label>Tipo de Contrato</label><select value={formDataEditar.tipo_contrato} onChange={e => setFormDataEditar({...formDataEditar, tipo_contrato: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}><option value="full_time">Full Time</option><option value="part_time">Part Time</option></select></div>
            
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
              <Button type="submit" style={{ backgroundColor: colors.secretaria }}>Guardar Cambios</Button>
              <Button type="button" onClick={() => setVistaActual('tabla')} style={{ backgroundColor: '#64748b' }}>Cancelar</Button>
              <Button type="button" onClick={() => handleResetPasswordProfesor(profesorEditando.id)} style={{ backgroundColor: '#ef4444', marginLeft: 'auto' }}>Reiniciar Contraseña</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ProfesoresView;