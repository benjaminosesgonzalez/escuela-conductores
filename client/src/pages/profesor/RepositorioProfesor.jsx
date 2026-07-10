import React, { useState, useEffect } from 'react';
import { FolderOpen, Upload, Trash2, Eye } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

const RepositorioProfesor = () => {
  const currentUser = authService.getCurrentUser();
  const [archivos, setArchivos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [loading, setLoading] = useState(true);

  const cargarArchivos = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/repositorio");
      const data = await response.json();

      if (data.success) {
        setArchivos(data.archivos);
      }
    } catch (error) {
      console.error("Error al cargar archivos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarArchivos();
  }, []);

  const subirArchivo = async () => {
    if (!archivoSeleccionado) {
      alert("Selecciona un archivo antes de subir.");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivoSeleccionado);

    try {
      setCargandoArchivo(true);

      const response = await fetch("http://localhost:5000/api/repositorio/subir", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert("Archivo subido correctamente.");
        setArchivoSeleccionado(null);
        await cargarArchivos();

        const inputArchivo = document.getElementById("archivoRepositorio");
        if (inputArchivo) {
          inputArchivo.value = "";
        }
      } else {
        alert(data.message || "No se pudo subir el archivo.");
      }

    } catch (error) {
      console.error("Error al subir archivo:", error);
      alert("Error al subir archivo.");
    } finally {
      setCargandoArchivo(false);
    }
  };

  const eliminarArchivo = async (id) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar este archivo?");

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/repositorio/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        alert("Archivo eliminado correctamente.");
        await cargarArchivos();
      } else {
        alert(data.message || "No se pudo eliminar el archivo.");
      }

    } catch (error) {
      console.error("Error al eliminar archivo:", error);
      alert("Error al eliminar archivo.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: spacing.margin.xlarge,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.gap.normal
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: spacing.radius.lg,
          backgroundColor: colors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <FolderOpen size={28} color={colors.white} />
        </div>

        <div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: colors.textPrimary,
            margin: '0 0 4px 0'
          }}>
            Repositorio de archivos
          </h2>
          <p style={{
            fontSize: '14px',
            color: colors.textSecondary,
            margin: 0
          }}>
            Sube material de apoyo para los alumnos
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <Card style={{ marginBottom: spacing.margin.xlarge }}>
        <div style={{
          border: `2px dashed ${colors.border}`,
          borderRadius: spacing.radius.lg,
          padding: spacing.padding.xlarge,
          textAlign: 'center',
          backgroundColor: colors.backgroundAlt,
          transition: 'all 0.2s ease'
        }}>
          <FolderOpen size={48} color={colors.primary} style={{ marginBottom: spacing.margin.lg }} />

          <h3 style={{
            fontSize: '18px',
            color: colors.textPrimary,
            margin: `0 0 ${spacing.margin.md} 0`,
            fontWeight: '600'
          }}>
            Cargar archivo
          </h3>

          <p style={{
            color: colors.textSecondary,
            fontSize: '14px',
            marginBottom: spacing.margin.lg
          }}>
            Selecciona un archivo PDF o MP4 desde tu computador
          </p>

          <input
            type="file"
            accept=".pdf,.mp4,application/pdf,video/mp4"
            id="archivoRepositorio"
            style={{ display: 'none' }}
            onChange={(e) => {
              const archivo = e.target.files[0];
              if (archivo) {
                setArchivoSeleccionado(archivo);
              }
            }}
          />

          <Button
            variant="secondary"
            onClick={() => document.getElementById("archivoRepositorio").click()}
            style={{ marginRight: spacing.margin.md }}
          >
            Seleccionar archivo
          </Button>

          <Button
            variant="success"
            onClick={subirArchivo}
            disabled={cargandoArchivo || !archivoSeleccionado}
            icon={Upload}
          >
            {cargandoArchivo ? 'Subiendo...' : 'Subir'}
          </Button>

          {archivoSeleccionado && (
            <p style={{
              marginTop: spacing.margin.lg,
              color: colors.textPrimary,
              fontSize: '14px'
            }}>
              📄 <strong>{archivoSeleccionado.name}</strong>
            </p>
          )}
        </div>
      </Card>

      {/* Archivos Cargados */}
      <Card title="Archivos cargados" icon={FolderOpen}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: spacing.padding.xlarge,
            color: colors.textTertiary
          }}>
            Cargando archivos...
          </div>
        ) : archivos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: spacing.padding.xlarge,
            color: colors.textTertiary
          }}>
            Aún no hay archivos cargados en el repositorio
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.gap.normal
          }}>
            {archivos.map((archivo) => (
              <div
                key={archivo.id}
                style={{
                  backgroundColor: colors.backgroundAlt,
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: spacing.radius.md,
                  padding: spacing.padding.lg,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.borderLight;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <p style={{
                    margin: `0 0 ${spacing.margin.sm} 0`,
                    fontWeight: '600',
                    color: colors.textPrimary
                  }}>
                    {archivo.nombreOriginal}
                  </p>

                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: colors.textTertiary
                  }}>
                    {archivo.tipoArchivo} · {new Date(archivo.fechaSubida).toLocaleString()}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: spacing.gap.normal }}>
                  <a
                    href={`http://localhost:5000${archivo.rutaArchivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <Button variant="secondary" size="sm" icon={Eye}>
                      Ver
                    </Button>
                  </a>

                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => eliminarArchivo(archivo.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default RepositorioProfesor;
