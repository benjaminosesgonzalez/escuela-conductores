import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import SecretariaLayout from '../../layouts/SecretariaLayout.jsx';
import AgendarClasesSecretaria from './AgendarClasesSecretaria.jsx';
import InicioView from './InicioView.jsx';
import AlumnosView from './AlumnosView.jsx';
import ProfesoresView from './ProfesoresView.jsx';
import { Card } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';
import SalaPsicotecnicaView from './SalaPsicotecnicaView.jsx';
import VehiculosView from './VehiculosView.jsx';

const DashboardSecretaria = () => {
  const [activeTab, setActiveTab] = useState('inicio');
  
  // Datos Globales
  const [alumnos, setAlumnos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [sedesDisponibles, setSedesDisponibles] = useState([]);
  const [autos, setAutos] = useState([]);
  const [statsData, setStatsData] = useState({ totalAlumnos: 0, totalProfesores: 0, totalAutos: 0 });
  const currentUser = authService.getCurrentUser();
  const secretariaNombre = currentUser?.nombre || 'Secretaria';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = authService.getToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        const [alumnosRes, profesRes, autosRes, sedesRes] = await Promise.all([
          fetch('http://localhost:5000/api/alumnos', { headers }),
          fetch('http://localhost:5000/api/profesores', { headers }),
          fetch('http://localhost:5000/api/autos', { headers }),
          fetch('http://localhost:5000/api/sedes', { headers })
        ]);

        const alumnosData = await alumnosRes.json();
        const profesData = await profesRes.json();
        const autosData = await autosRes.json();

        if (alumnosData.success) {
          setAlumnos(alumnosData.data);
          setStatsData(prev => ({ ...prev, totalAlumnos: alumnosData.data.length }));
        }
        
        if (profesData.success) {
          setProfesores(profesData.data);
          setStatsData(prev => ({ ...prev, totalProfesores: profesData.data.length }));
        }

         if (autosData.success) {
          setAutos(autosData.data);
          setStatsData(prev => ({ ...prev, totalAutos: autosData.data.length }));
        }

        if (sedesRes.ok) {
          const sedesData = await sedesRes.json();
          if (sedesData.success) setSedesDisponibles(sedesData.data);
        }
      } catch (error) {
        console.error("Error cargando la data del dashboard:", error);
      }
    };

    fetchDashboardData();
  }, []); // Se ejecuta una vez, las vistas actualizan los estados locales

  return (
    <SecretariaLayout activeTab={activeTab} onTabChange={setActiveTab}>
      
      {activeTab === 'inicio' && (
        <InicioView 
          secretariaNombre={secretariaNombre} 
          statsData={statsData} 
          setActiveTab={setActiveTab} 
          sedesDisponibles={sedesDisponibles} 
        />
      )}

      {activeTab === 'alumnos' && (
        <AlumnosView alumnos={alumnos} setAlumnos={setAlumnos} sedesDisponibles={sedesDisponibles} setStatsData={setStatsData} />
      )}

      {activeTab === 'profesores' && (
        <ProfesoresView profesores={profesores} setProfesores={setProfesores} sedesDisponibles={sedesDisponibles} />
      )}

      {/* VISTA DE SALA PSICOTÉCNICA */}
      {activeTab === 'psicotecnico' && (
        <SalaPsicotecnicaView />
      )}

      {/* VISTA DE VEHÍCULOS */}
      {activeTab === 'vehiculos' && (
        <VehiculosView autos={autos} setAutos={setAutos} sedesDisponibles={sedesDisponibles} setStatsData={setStatsData} />
      )}

      {/* LOS DEMÁS MÓDULOS EN DESARROLLO */}
      {(activeTab === 'reportes' || activeTab === 'configuracion') && (
        <Card title={activeTab.toUpperCase()} icon={FileText}>
          <p style={{ color: colors.textSecondary, textAlign: 'center', padding: spacing.padding.xlarge }}>Módulo en desarrollo</p>
        </Card>
      )}

      {activeTab === 'agendar-clases' && <AgendarClasesSecretaria />}
      
    </SecretariaLayout>
  );
};

export default DashboardSecretaria;
