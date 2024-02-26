import Propiedad from "./Propiedad.js";
import Precio from "./Precio.js";
import Categoria from "./Categoria.js";
import Usuarios from "./Usuarios.js";
import Mensaje from "./Mensaje.js";

// Precio.hasOne(Propiedad)
Propiedad.belongsTo(Precio, { foreignKey: "precioId" });
Propiedad.belongsTo(Categoria, { foreignKey: "categoriaId" });
Propiedad.belongsTo(Usuarios, { foreignKey: "usuarioId" });
Propiedad.hasMany(Mensaje, { foreignKey: "propiedadId"});

Mensaje.belongsTo(Propiedad, { foreignKey: "propiedadId" });
Mensaje.belongsTo(Usuarios, { foreignKey: "usuarioId" });

export { Propiedad, Precio, Categoria, Usuarios, Mensaje };
