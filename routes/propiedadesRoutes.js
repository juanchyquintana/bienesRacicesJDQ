import express from "express";
import { body } from "express-validator";
import {
  admin,
  crear,
  guardar,
  agregarImagen,
  almacenarImagen,
  editar,
  guardarCambios,
  eliminar,
  mostrarPropiedad,
  enviarMensaje,
  verMensajes,
  cambiarEstado,
} from "../controllers/propiedadControllers.js";
import protegerRuta from "../middleware/protegerRutas.js";
import upload from "../middleware/subirImagen.js";
import identificarUsuario from "../middleware/identificarUsuario.js";

const router = express.Router();

router.get("/mis-propiedades", protegerRuta, admin);

router.get("/propiedades/crear", protegerRuta, crear);
router.post(
  "/propiedades/crear",
  protegerRuta,
  body("titulo").notEmpty().withMessage("El Título del Anuncio es Obligatorio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La Descripción no puede ir vacia")
    .isLength({ max: 200 })
    .withMessage("La Descripción es muy larga"),
  body("categoria").isNumeric().withMessage("Selecciona una Categoria"),
  body("precio").isNumeric().withMessage("Selecciona una rango de Precios"),
  body("habitaciones")
    .isNumeric()
    .withMessage("Selecciona la cantidad de Habitaciones"),
  body("estacionamiento")
    .isNumeric()
    .withMessage("Selecciona la cantidad de Estacionamientos"),
  body("wc").isNumeric().withMessage("Selecciona la cantidad de Baños"),
  body("lat").notEmpty().withMessage("Ubica la propiedad en el Mapa"),
  guardar
);

router.get("/propiedades/agregar-imagen/:id", protegerRuta, agregarImagen);
router.post(
  "/propiedades/agregar-imagen/:id",
  protegerRuta,
  upload.single("imagen"),
  almacenarImagen
);

router.get("/propiedades/editar/:id", protegerRuta, editar);
router.post(
  "/propiedades/editar/:id",
  protegerRuta,
  body("titulo").notEmpty().withMessage("El Título del Anuncio es Obligatorio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La Descripción no puede ir vacia")
    .isLength({ max: 200 })
    .withMessage("La Descripción es muy larga"),
  body("categoria").isNumeric().withMessage("Selecciona una Categoria"),
  body("precio").isNumeric().withMessage("Selecciona una rango de Precios"),
  body("habitaciones")
    .isNumeric()
    .withMessage("Selecciona la cantidad de Habitaciones"),
  body("estacionamiento")
    .isNumeric()
    .withMessage("Selecciona la cantidad de Estacionamientos"),
  body("wc").isNumeric().withMessage("Selecciona la cantidad de Baños"),
  body("lat").notEmpty().withMessage("Ubica la propiedad en el Mapa"),
  guardarCambios
);

router.post("/propiedades/eliminar/:id", protegerRuta, eliminar);

router.get("/propiedad/:id", identificarUsuario, mostrarPropiedad);

router.post(
  "/propiedad/:id",
  identificarUsuario,
  body("mensaje")
    .isLength({ min: 20 })
    .withMessage("El Mensaje no puede ir vacío o es muy corto"),
  enviarMensaje
);

router.get("/mensajes/:id", protegerRuta, verMensajes);

router.put("/propiedades/:id", protegerRuta, cambiarEstado);

export default router;
