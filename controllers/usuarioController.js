import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js";
import bcrypt from "bcrypt";
import { check, validationResult } from "express-validator";
import { generarId, generarJWT } from "../helpers/tokens.js";
import Usuario from "../models/Usuarios.js";

const formularioLogin = (req, res) => {
  res.render("auth/login.pug", {
    pagina: "Iniciar Sesión",
    csrfToken: req.csrfToken(),
  });
};

const autenticar = async (req, res) => {
  await check("email")
    .isEmail()
    .withMessage("El Email es obligatorio")
    .run(req);
  await check("password")
    .notEmpty()
    .withMessage("El Password es obligatorio")
    .run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vácio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/login", {
      pagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { email, password } = req.body;

  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El Usuario no existe" }],
    });
  }

  if (!usuario.confirmado) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "Tu cuenta no ha sido confirmada" }],
    });
  }

  if (!usuario.verificarPassword(password)) {
    return res.render("auth/login", {
      pagina: "Iniciar Sesión",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El Password es Incorrecto" }],
    });
  }

  const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });
  return res
    .cookie("_token", token, {
      httpOnly: true,
      // secure: true,
      // sameSite: true
    })
    .redirect("/mis-propiedades");
};

const cerrarSesion = (req, res) => {
  return res.clearCookie('_token').status(200).redirect('/auth/login')
}

const formularioRegistro = (req, res) => {
  res.render("auth/registro.pug", {
    pagina: "Crear Cuenta",
    csrfToken: req.csrfToken(),
  });
};

const registrar = async (req, res) => {
  // Validacion
  await check("nombre")
    .notEmpty()
    .withMessage("El Nombre es obligatorio")
    .run(req);
  await check("email")
    .isEmail()
    .withMessage("El Email es obligatorio")
    .run(req);
  await check("password")
    .isLength({ min: 4 })
    .withMessage("El Password debe ser de al menos 4 caracteres")
    .run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vácio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/registro.pug", {
      pagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  const { nombre, email, password } = req.body;

  const existeUsuario = await Usuario.findOne({ where: { email } });
  if (existeUsuario) {
    return res.render("auth/registro.pug", {
      pagina: "Crear Cuenta",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El Usuario Existe" }],
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  res.render("templates/mensaje.pug", {
    pagina: "Cuenta creada correctamente",
    mensaje: "Hemos Enviado un Email de Confirmación, presiona en el enlace",
  });
};

const confirmar = async (req, res, next) => {
  const { token } = req.params;

  const usuario = await Usuario.findOne({ where: { token } });
  if (!usuario) {
    return res.render("auth/confirmar-cuenta.pug", {
      pagina: "Error al confirmar tu cuenta",
      mensaje: "Hubo un error al confirmar tu cuenta, intenta de nuevo",
      error: true,
    });
  }

  usuario.token = null;
  usuario.confirmado = true;
  await usuario.save();

  return res.render("auth/confirmar-cuenta.pug", {
    pagina: "Cuenta Confirmada",
    mensaje: "La cuenta se confirmó correctamente",
  });
};

const formularioOlvidePassword = (req, res) => {
  res.render("auth/olvide-password.pug", {
    pagina: "Recupera tu cuenta Bienes Raices",
    csrfToken: req.csrfToken(),
  });
};

const resetPassword = async (req, res) => {
  await check("email")
    .isEmail()
    .withMessage("El Email es obligatorio")
    .run(req);

  let resultado = validationResult(req);
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/olvide-password.pug", {
      pagina: "Recupera tu acceso a Bienes Raices",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { email } = req.body;
  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    return res.render("auth/olvide-password.pu", {
      pagina: "Recupera tu acceso a Bienes Raices",
      csrfToken: req.csrfToken(),
      errores: [{ msg: "El Email no pertenece a ningún usuario" }],
    });
  }

  // Generar Token y enviar email
  usuario.token = generarId();
  await usuario.save();

  emailOlvidePassword({
    email: usuario.email,
    nombre: usuario.nombre,
    token: usuario.token,
  });

  res.render("templates/mensaje.pug", {
    pagina: "Reestablece tu password",
    mensaje: "Hemos enviado un email con las instrucciones.",
  });
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render("auth/confirmar-cuenta.pug", {
      pagina: "Reestablece tu Password",
      mensaje: "Hubo un error al validar tu información, intenta de nuevo",
      error: true,
    });
  }

  res.render("auth/reset-password.pug", {
    pagina: "Reestablece tu password",
    csrfToken: req.csrfToken(),
  });
};

const nuevoPassword = async (req, res) => {
  await check("password")
    .isLength({ min: 4 })
    .withMessage("El Password debe ser de al menos 4 caracteres")
    .run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vácio
  if (!resultado.isEmpty()) {
    // Errores
    return res.render("auth/reset-password.pug", {
      pagina: "Reestablece tu Password",
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  const usuario = await Usuario.findOne({ where: { token } });

  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(password, salt);
  usuario.token = null;

  await usuario.save();

  res.render("auth/confirmar-cuenta.pug", {
    pagina: "Password Reestablecido",
    mensaje: "El Password se guardó correctamente.",
  });
};

export {
  formularioLogin,
  formularioRegistro,
  formularioOlvidePassword,
  registrar,
  confirmar,
  resetPassword,
  comprobarToken,
  nuevoPassword,
  autenticar,
  cerrarSesion
};
