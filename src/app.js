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