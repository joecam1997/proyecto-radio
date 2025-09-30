'use client';
import React, { useState, useEffect } from "react";

export default function RadioApp() {
  const [stations, setStations] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ genre: "", country: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // radios por página

  // Cargar favoritos desde localStorage
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favs);
  }, []);

  // Guardar favoritos
  const toggleFavorite = (station) => {
    let updated;
    if (favorites.find((f) => f.url_resolved === station.url_resolved)) {
      updated = favorites.filter((f) => f.url_resolved !== station.url_resolved);
    } else {
      updated = [...favorites, station];
    }
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  // Buscar emisoras
  const fetchStations = async (page = 1) => {
    setLoading(true);
    const offset = (page - 1) * limit;
    let url = "";

    if (filter.country && filter.genre) {
      url = `https://all.api.radio-browser.info/json/stations/search?country=${filter.country}&tag=${filter.genre}&limit=${limit}&offset=${offset}`;
    } else if (filter.country) {
      url = `https://all.api.radio-browser.info/json/stations/bycountry/${filter.country}?limit=${limit}&offset=${offset}`;
    } else if (filter.genre) {
      url = `https://all.api.radio-browser.info/json/stations/bytag/${filter.genre}?limit=${limit}&offset=${offset}`;
    } else {
      alert("Ingresa género o país");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error HTTP: " + res.status);
      let data = await res.json();

      // Filtrar emisoras HTTPS válidas para móvil
      data = data.filter(
        (st) =>
          st.url_resolved &&
          st.url_resolved.startsWith("https://") &&
          st.name
      );

      if (data.length === 0) {
        alert(
          "No se encontraron emisoras válidas para este país/género en móvil."
        );
      }

      setStations(data);
      setCurrentPage(page);
    } catch (err) {
      console.error("❌ Error al cargar emisoras:", err);
      alert("No se pudieron cargar emisoras. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        🎧 Radio Online en Vivo
      </h1>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6 w-full max-w-2xl">
        <input
          type="text"
          placeholder="🎶 Género (ej: rock, jazz)"
          value={filter.genre}
          onChange={(e) => setFilter({ ...filter, genre: e.target.value })}
          className="p-3 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 flex-1"
        />
        <input
          type="text"
          placeholder="🌍 País (ej: Ecuador, Spain)"
          value={filter.country}
          onChange={(e) => setFilter({ ...filter, country: e.target.value })}
          className="p-3 rounded bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 flex-1"
        />
        <button
          onClick={() => fetchStations(1)}
          className="bg-green-500 px-4 py-3 rounded hover:bg-green-600 transition w-full sm:w-auto"
        >
          Buscar
        </button>
      </div>

      {/* Lista de emisoras */}
      {loading && <p>🔄 Cargando emisoras...</p>}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full max-w-4xl">
        {stations.map((station, i) => (
          <li
            key={i}
            className="p-4 bg-gray-800 rounded flex flex-col gap-3 shadow-lg"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {station.favicon ? (
                  <img
                    src={station.favicon}
                    alt={station.name}
                    className="w-12 h-12 object-contain rounded"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center text-sm">
                    🎵
                  </div>
                )}
                <div>
                  <p className="font-bold">{station.name}</p>
                  <p className="text-sm text-gray-400">{station.country}</p>
                </div>
              </div>
              <button
                onClick={() => toggleFavorite(station)}
                className="text-yellow-400 font-bold text-lg"
              >
                {favorites.find(
                  (f) => f.url_resolved === station.url_resolved
                )
                  ? "★"
                  : "☆"}
              </button>
            </div>

            {/* Reproductor dentro de la tarjeta */}
            <audio controls className="w-full mt-2">
              <source src={station.url_resolved} type="audio/mpeg" />
              Tu navegador no soporta audio HTML5
            </audio>
          </li>
        ))}
      </ul>

      {/* Paginación */}
      {stations.length > 0 && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => fetchStations(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            ⬅️ Anterior
          </button>
          <span className="px-4 py-2">Página {currentPage}</span>
          <button
            onClick={() => fetchStations(currentPage + 1)}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Siguiente ➡️
          </button>
        </div>
      )}

      {/* Favoritos */}
      {favorites.length > 0 && (
        <div className="w-full max-w-4xl mt-6">
          <h2 className="text-xl font-bold mb-2">⭐ Mis Favoritos</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map((fav, i) => (
              <li
                key={i}
                className="p-4 bg-gray-800 rounded flex flex-col gap-3 shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {fav.favicon ? (
                      <img
                        src={fav.favicon}
                        alt={fav.name}
                        className="w-12 h-12 object-contain rounded"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center text-sm">
                        🎵
                      </div>
                    )}
                    <div>
                      <p className="font-bold">{fav.name}</p>
                      <p className="text-sm text-gray-400">{fav.country}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFavorite(fav)}
                    className="text-yellow-400 font-bold text-lg"
                  >
                    ★
                  </button>
                </div>
                <audio controls className="w-full mt-2">
                  <source src={fav.url_resolved} type="audio/mpeg" />
                </audio>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
