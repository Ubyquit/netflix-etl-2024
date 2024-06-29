const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();
const port = 3000;

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Conexión a MongoDB
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'netflix_etl';
let db;

async function connectDB() {
  await client.connect();
  db = client.db(dbName);
}

connectDB().catch(console.error);

// Ruta para la vista principal
app.get('/', async (req, res) => {
  const collection = db.collection('titles');
  const data = await collection.find().toArray();
  res.render('index', { data });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});