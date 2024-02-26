import { exit } from "node:process";
import categorias from "./categorias.js";
import precios from "./precios.js";
import usarios from "./usuarios.js";
import db from "../config/db.js";
import { Categoria, Precio, Usuarios } from '../models/index.js'
import usuarios from "./usuarios.js";

const importarDatos = async () => {
  try {
    await db.authenticate(); // Autenticación

    await db.sync(); // Generar las columnas

    // Insertamos los datos
    await Promise.all([
      Categoria.bulkCreate(categorias),
      Precio.bulkCreate(precios),
      Usuarios.bulkCreate(usuarios)
    ]);
    console.log("Datos Importados Correctamente");
    exit();
  } catch (error) {
    console.log(error);
    exit(1);
  }
};

const eliminarDatos = async () => {
  try {
    await db.sync({ force: true });

    console.log("Datos eliminados correctamente");
    exit();
  } catch (error) {
    console.log(error);
    exit(1);
  }
};

if (process.argv[2] === "-i") {
  importarDatos();
}

if (process.argv[2] === "-e") {
  eliminarDatos();
}
