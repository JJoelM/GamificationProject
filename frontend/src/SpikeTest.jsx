// Componente descartable. Pegalo dentro de frontend/src/ solo para esta prueba
// de cableado, y usalo en App.jsx mientras dure el spike.
import { useState } from "react";

const API_URL = "http://localhost:5173/generar-mision";

export default function SpikeTest() {
  const [texto, setTexto] = useState("");
  const [mision, setMision] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  async function generar() {
    setCargando(true);
    setError(null);
    setMision(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      if (!res.ok) throw new Error(`Backend respondió ${res.status}`);
      const data = await res.json();
      setMision(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Spike — cableado React → FastAPI → Gemini</h2>
      <textarea
        rows={5}
        style={{ width: "100%" }}
        placeholder="Pegá un texto educativo de prueba"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <div>
        <button onClick={generar} disabled={cargando || !texto.trim()}>
          {cargando ? "Generando..." : "Generar misión"}
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {mision && (
        <div>
          <h3>{mision.titulo}</h3>
          <ol>
            {mision.preguntas.map((p, i) => (
              <li key={i}>
                <strong>{p.enunciado}</strong>
                <ul>
                  {p.opciones.map((op) => (
                    <li key={op}>{op}</li>
                  ))}
                </ul>
                <em>
                  Correcta: {p.respuesta_correcta} — {p.explicacion}
                </em>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
