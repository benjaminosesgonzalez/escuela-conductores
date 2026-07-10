import React, { useState } from 'react';
import { Users, Plus, ClipboardList, Save, AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

const SecretariasView = ({ secretarias, setSecretarias }) => {
  // --- ESTADOS GENERALES ---
  const [vistaActual, setVistaActual] = useState('tabla'); 
  
  // --- ESTADOS TABLA Y FILTROS ---
  const [searchTerm, setSearchTerm] = useState('');

  // --- ESTADOS FORMULARIO NUEVO ---
  const [formDataNuevo, setFormDataNuevo] = useState({
    rut: '', nombre: '', email: '', password: '', telefono: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // --- ESTADOS FORMULARIO EDICIÓN ---
  const [secretariaEditando, setSecretariaEditando] = useState(null);
  const [formDataEditar, setFormDataEditar] = useState({ 
    nombre: '', rut: '', telefono: '' 
  });

  // --- LÓGICA DE FILTRADO ---
  const secretariasFiltradas = secretarias.filter(sec => {
    const matchSearch = (sec.rut && sec.rut.toLowerCase().includes(searchTerm.toLowerCase())) || 
                        (sec.nombre && sec.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch;
  });

  // --- FUNCIONES DE TABLA ---
  const handleEliminarSecretaria = async (id) => {
    if (!window.confirm("¿Confirmar eliminación permanentemente? Esto también borrará su cuenta de acceso.")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/secretarias/${id}`, {
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${authService.getToken()}` }
      });
      const data = await response.json();
      if(response.ok) {
        alert(data.message);
        // Recargar tabla
        const secRes = await fetch('http://localhost:5000/api/secretarias', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
        const secData = await secRes.json();
        if(secData.success) setSecretarias(secData.data);
      } else { alert(data.message); }
    } catch (error) { console.error(error); }
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
      // Usa la ruta específica para registro
      const response = await fetch('http://localhost:5000/api/secretarias/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
        body: JSON.stringify(formDataNuevo)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Secretaria registrada exitosamente.' });
        // Recargar toda la lista para traer las relaciones completas (como el email del user)
        const secRes = await fetch('http://localhost:5000/api/secretarias', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
        const secData = await secRes.json();
        if(secData.success) setSecretarias(secData.data);
        
        setFormDataNuevo({ rut: '', nombre: '', email: '', password: '', telefono: '' });
        setTimeout(() => setVistaActual('tabla'), 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al registrar la secretaria.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIONES FORMULARIO EDICIÓN ---
  const handleEditarSecretaria = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/secretarias/${secretariaEditando.id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authService.getToken()}` },
        body: JSON.stringify(formDataEditar)
      });
      const data = await response.json();
      if(response.ok) {
        alert("Actualizado exitosamente"); 
        setSecretariaEditando(null); 
        setVistaActual('tabla');
        
        const secRes = await fetch('http://localhost:5000/api/secretarias', { headers: { 'Authorization': `Bearer ${authService.getToken()}` } });
        const secData = await secRes.json();
        if(secData.success) setSecretarias(secData.data);
      } else {
        alert(data.message);
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
          <ClipboardList size={20} /> Ver Directorio
        </button>
        <button onClick={() => setVistaActual('nuevo')} style={getTabStyle('nuevo')}>
          <Plus size={20} /> Ingresar Nueva Secretaria
        </button>
      </div>

      {/* VISTA: TABLA */}
      {vistaActual === 'tabla' && (
        <Card title="Directorio de Secretarias" icon={Users}>
          <div style={{ display: 'flex', gap: spacing.gap.normal, marginBottom: spacing.margin.large, flexWrap: 'wrap', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Buscar por RUT o Nombre..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={{ flex: 1, minWidth: '200px', padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} 
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.borderLight}`, color: colors.textSecondary }}>
                  <th style={{ padding: '12px' }}>RUT</th>
                  <th style={{ padding: '12px' }}>Nombre</th>
                  <th style={{ padding: '12px' }}>Correo de Acceso</th>
                  <th style={{ padding: '12px' }}>Teléfono</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {secretariasFiltradas.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: colors.textSecondary }}>No hay secretarias registradas o que coincidan con la búsqueda.</td></tr>
                ) : (
                  secretariasFiltradas.map((sec) => (
                    <tr key={sec.id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                      <td style={{ padding: '12px' }}>{sec.rut || 'No registrado'}</td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{sec.nombre || 'Sin nombre'}</td>
                      <td style={{ padding: '12px', color: colors.primary }}>{sec.user?.email || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{sec.telefono || 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button onClick={() => { 
                          setSecretariaEditando(sec); 
                          setFormDataEditar({ nombre: sec.nombre || '', rut: sec.rut || '', telefono: sec.telefono || '' }); 
                          setVistaActual('editar'); 
                        }} style={{ cursor: 'pointer', border: 'none', background: 'none', color: colors.primary, marginRight: '15px' }} title="Editar">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleEliminarSecretaria(sec.id)} style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#ef4444' }} title="Eliminar">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* VISTA: FORMULARIO NUEVA SECRETARIA */}
      {vistaActual === 'nuevo' && (
        <Card title="Registrar Nueva Secretaria" icon={Plus}>
          {message.text && (
            <div style={{ marginBottom: spacing.margin.lg, padding: spacing.padding.lg, backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', border: `1px solid ${message.type === 'error' ? colors.danger : colors.success}`, borderRadius: spacing.radius.lg, color: message.type === 'error' ? colors.danger : colors.success, display: 'flex', alignItems: 'center', gap: spacing.gap.normal, fontSize: "14px" }}>
              {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />} {message.text}
            </div>
          )}
          <form onSubmit={handleSubmitNuevo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.gap.large }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500', color: colors.textPrimary }}>Nombre Completo</label>
              <input type="text" name="nombre" value={formDataNuevo.nombre} onChange={handleChangeNuevo} required placeholder="Ej: Ana Gómez" style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500', color: colors.textPrimary }}>RUT (Opcional)</label>
              <input type="text" name="rut" value={formDataNuevo.rut} onChange={handleChangeNuevo} placeholder="Ej: 12345678-9" style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500', color: colors.textPrimary }}>Correo de Acceso</label>
              <input type="email" name="email" value={formDataNuevo.email} onChange={handleChangeNuevo} required placeholder="Ej: secretaria@escuela.cl" style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500', color: colors.textPrimary }}>Contraseña Inicial</label>
              <input type="password" name="password" value={formDataNuevo.password} onChange={handleChangeNuevo} required placeholder="Contraseña de acceso" style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500', color: colors.textPrimary }}>Teléfono</label>
              <input type="text" name="telefono" value={formDataNuevo.telefono} onChange={handleChangeNuevo} required placeholder="Ej: +569 12345678" style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }} />
            </div>
            <div style={{ gridColumn: 'span 2', marginTop: '16px' }}>
              <Button type="submit" disabled={loading} style={{ backgroundColor: colors.primary, width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <Save size={20} />{loading ? 'Guardando...' : 'Crear Perfil de Secretaria'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* VISTA: EDICIÓN SECRETARIA */}
      {vistaActual === 'editar' && secretariaEditando && (
        <Card title="Editar Datos de la Secretaria" icon={Edit}>
          <form onSubmit={handleEditarSecretaria} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.gap.large }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Nombre Completo</label>
              <input required type="text" value={formDataEditar.nombre} onChange={e => setFormDataEditar({...formDataEditar, nombre: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>RUT</label>
              <input type="text" value={formDataEditar.rut} onChange={e => setFormDataEditar({...formDataEditar, rut: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label>Teléfono</label>
              <input type="text" value={formDataEditar.telefono} onChange={e => setFormDataEditar({...formDataEditar, telefono: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${colors.borderLight}` }}/>
            </div>
            
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
              <Button type="submit" style={{ backgroundColor: colors.primary }}>Guardar Cambios</Button>
              <Button type="button" onClick={() => setVistaActual('tabla')} style={{ backgroundColor: '#64748b' }}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default SecretariasView;