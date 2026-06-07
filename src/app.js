const express = require('express');
const pool = require('./config/db');
const app = express();
app.use(express.json());

const initDB = async () => {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS equipos (' +
    'id SERIAL PRIMARY KEY,' +
    'nombre VARCHAR(50) NOT NULL,' +
    'puntos INT DEFAULT 0,' +
    'diferencia_goles INT DEFAULT 0' +
    ');'
  );
  console.log('Tabla equipos lista');
};

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'UP', database: 'CONNECTED' });
  } catch (error) {
    res.status(500).json({ status: 'DOWN', error: error.message });
  }
});

app.get('/api/posiciones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipos ORDER BY puntos DESC, diferencia_goles DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la tabla de posiciones' });
  }
});

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipos ORDER BY puntos DESC, diferencia_goles DESC');
    const equipos = result.rows;
    const filas = equipos.map((e, i) => {
      const medalla = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
      const difColor = e.diferencia_goles > 0 ? '#4ade80' : e.diferencia_goles < 0 ? '#f87171' : '#94a3b8';
      const difTexto = e.diferencia_goles > 0 ? `+${e.diferencia_goles}` : `${e.diferencia_goles}`;
      return `
        <tr>
          <td style="text-align:center;font-size:1.2rem">${medalla}</td>
          <td style="font-weight:600;color:#f1f5f9">${e.nombre}</td>
          <td style="text-align:center;font-weight:700;color:#facc15;font-size:1.1rem">${e.puntos}</td>
          <td style="text-align:center;font-weight:600;color:${difColor}">${difTexto}</td>
        </tr>`;
    }).join('');

    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>FutbolStats Pro</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', Arial, sans-serif;
      padding: 2rem;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 2rem;
      width: 100%;
      max-width: 560px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    .header {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .header h1 {
      font-size: 1.8rem;
      color: #f1f5f9;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      color: #64748b;
      font-size: 0.85rem;
      margin-top: 4px;
    }
    .badge {
      display: inline-block;
      background: #166534;
      color: #4ade80;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 99px;
      margin-top: 8px;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead tr {
      border-bottom: 1px solid #334155;
    }
    thead th {
      color: #64748b;
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 0 8px 10px;
      text-align: center;
    }
    thead th:nth-child(2) { text-align: left; }
    tbody tr {
      border-bottom: 1px solid #1e293b;
      transition: background 0.15s;
    }
    tbody tr:hover { background: #263348; }
    tbody td {
      padding: 12px 8px;
      color: #94a3b8;
      font-size: 0.95rem;
    }
    tbody tr:first-child { background: rgba(250,204,21,0.05); }
    .footer {
      text-align: center;
      margin-top: 1.5rem;
      color: #475569;
      font-size: 0.75rem;
    }
    .footer a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>⚽ FutbolStats Pro</h1>
      <p>Tabla de posiciones en tiempo real</p>
      <span class="badge">● EN VIVO</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Equipo</th>
          <th>PTS</th>
          <th>DG</th>
        </tr>
      </thead>
      <tbody>
        ${filas}
      </tbody>
    </table>
    <div class="footer">
      Powered by Node.js · PostgreSQL · Render &nbsp;|&nbsp;
      <a href="/api/posiciones">JSON API</a>
    </div>
  </div>
</body>
</html>`);
  } catch (error) {
    res.status(500).send('<h2>Error conectando a la base de datos</h2>');
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    await pool.query(`
      INSERT INTO equipos (nombre, puntos, diferencia_goles) VALUES
      ('ITP F.C.', 21, 15),
      ('Atletico Dev', 18, 10),
      ('Real Bogota', 15, 7),
      ('Deportivo Node', 12, 3),
      ('FC Express', 9, -2)
      ON CONFLICT DO NOTHING;
    `);
    res.json({ message: 'Equipos insertados correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  initDB().then(() => {
    app.listen(PORT, () => {
      console.log('Servidor corriendo en el puerto ' + PORT);
    });
  }).catch(err => {
    console.error('Error iniciando la BD:', err);
    process.exit(1);
  });
}

module.exports = app;
