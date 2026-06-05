import React, { useState, useEffect } from "react";

const ReservarVehiculo = () => {
  const [fechaUso, setFechaUso] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [idSede, setIdSede] = useState("");
  const [detalles, setDetalles] = useState("");

  const [sedes, setSedes] = useState([]);
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSedes();
    fetchMisSolicitudes();
  }, []);

  const fetchSedes = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/sedes", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (data.success) setSedes(data.data);
    } catch (err) {
      console.error("Error cargando sedes:", err);
    }
  };

  const fetchMisSolicitudes = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/solicitudes-auto/mis-solicitudes",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await response.json();
      if (data.success) setMisSolicitudes(data.data);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/solicitudes-auto",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            id_sede: idSede,
            fecha_uso: fechaUso,
            hora_uso: horaInicio,
            hora_termino: horaFin,
            detalles: detalles,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setFechaUso("");
        setHoraInicio("");
        setHoraFin("");
        setIdSede("");
        setDetalles("");
        fetchMisSolicitudes();
      } else {
        setError(data.message || "Error al crear la solicitud");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (estado) => {
    switch (estado) {
      case "aceptado":
        return "bg-green-100 text-green-700 border-green-400";
      case "pendiente":
        return "bg-yellow-100 text-yellow-700 border-yellow-400";
      case "rechazado":
        return "bg-red-100 text-red-700 border-red-400";
      default:
        return "bg-gray-100 text-gray-700 border-gray-400";
    }
  };

  return (
    <div className="flex h-screen bg-indigo-50 font-sans">
      {/* SIDEBAR (Simulado en base a tu diseño) */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-4 bg-indigo-800 text-lg font-bold tracking-wider">
          PROFESOR
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          <a
            href="#"
            className="flex items-center px-4 py-3 text-indigo-200 hover:bg-indigo-800 rounded-lg"
          >
            Inicio
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-indigo-200 hover:bg-indigo-800 rounded-lg"
          >
            Alumnos
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 text-indigo-200 hover:bg-indigo-800 rounded-lg"
          >
            Mis clases
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-3 bg-indigo-700 text-white rounded-lg font-medium"
          >
            Reservar vehículo
          </a>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="bg-indigo-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">ESCUELA DE CONDUCTORES</h1>
          <div className="flex items-center space-x-2">
            <span>Pedro Instructor</span>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              P
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL: Layout de 2 columnas */}
        <main className="p-8 flex gap-8 h-full overflow-hidden">
          {/* FORMULARIO (Columna Izquierda) */}
          <div className="bg-white p-8 rounded-xl shadow-sm flex-1 max-w-3xl border border-gray-100 h-fit">
            <h2 className="text-2xl text-indigo-900 font-semibold mb-6">
              Nueva Solicitud de Vehículo
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-x-8 gap-y-6"
            >
              {/* Seleccionar Fecha */}
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-2">
                  Seleccionar Fecha
                </label>
                <input
                  type="date"
                  value={fechaUso}
                  onChange={(e) => setFechaUso(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Seleccionar Sede (Adaptado de tu diseño de Vehículo) */}
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-2">
                  Sede
                </label>
                <select
                  value={idSede}
                  onChange={(e) => setIdSede(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Seleccionar sede</option>
                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Horario */}
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-2">
                  Horario
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-700"
                    required
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-700"
                    required
                  />
                </div>
              </div>

              {/* Destino / Propósito */}
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-2">
                  Destino/Propósito
                </label>
                <textarea
                  value={detalles}
                  onChange={(e) => setDetalles(e.target.value)}
                  placeholder="Describe el propósito de la reservación..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 h-28 resize-none focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>

              {/* Botón Submit */}
              <div className="col-span-2 flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar Solicitud"}
                </button>
              </div>
            </form>
          </div>

          {/* HISTORIAL (Columna Derecha) */}
          <div className="bg-white p-6 rounded-xl shadow-sm w-96 border border-gray-100 overflow-y-auto h-full">
            <h3 className="text-xl text-indigo-900 font-semibold mb-6">
              Solicitudes Previas
            </h3>

            <div className="space-y-4">
              {misSolicitudes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No tienes solicitudes previas.
                </p>
              ) : (
                misSolicitudes.map((solicitud) => (
                  <div
                    key={solicitud.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-500">
                        {new Date(solicitud.fecha_uso).toLocaleDateString(
                          "es-ES",
                          { day: "numeric", month: "long", year: "numeric" },
                        )}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(solicitud.estado)}`}
                      >
                        {solicitud.estado.charAt(0).toUpperCase() +
                          solicitud.estado.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="w-5 mr-2">🕒</span>
                        {solicitud.hora_uso.slice(0, 5)} -{" "}
                        {solicitud.hora_termino.slice(0, 5)}
                      </div>
                      <div className="flex items-center">
                        <span className="w-5 mr-2">🏢</span>
                        {solicitud.sede?.nombre || "Sede no asignada"}
                      </div>
                      {solicitud.detalles && (
                        <div className="flex items-center">
                          <span className="w-5 mr-2">📍</span>
                          <span className="truncate">{solicitud.detalles}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReservarVehiculo;
