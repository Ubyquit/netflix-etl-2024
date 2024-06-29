const fs = require("fs");
const csv = require("csv-parser");
const { MongoClient } = require("mongodb");
const path = require("path");

// Ruta del archivo CSV
const filePath = path.join(__dirname, "netflix_titles.csv");

// Conexión a MongoDB
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "netflix_etl";
let db;

async function runETL() {
  await client.connect();
  db = client.db(dbName);
  const collection = db.collection("titles");

  // Limpiar la colección antes de cargar nuevos datos
  await collection.deleteMany({});

  const insertPromises = [];

  // Leer y transformar datos del CSV
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      // Transformar la duración a minutos y calcular la antigüedad del contenido
      if (row.duration.includes("Season")) {
        row.duration = parseInt(row.duration.split(" ")[0]) * 60; // Aproximación de 60 minutos por temporada
        } else {
        row.duration = parseInt(row.duration.split(" ")[0]);
      }

      row.date_added = new Date(row.date_added);
      row.content_age = new Date().getFullYear() - parseInt(row.release_year);

      // Agregar la operación de inserción a la lista de promesas
      insertPromises.push(collection.insertOne(row));
    })
    .on("end", async () => {
      // Esperar a que todas las inserciones se completen
      try {
        await Promise.all(insertPromises);
        console.log("Datos cargados en MongoDB exitosamente.");
      } catch (error) {
        console.error("Error durante la inserción:", error);
      } finally {
        await client.close();
      }
    });
}

// invocar la función principal
runETL().catch(console.error);
