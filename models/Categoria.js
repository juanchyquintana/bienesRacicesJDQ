import db from '../config/db.js'
import { DataTypes } from 'sequelize'

const Categoria = db.define('categorias', {
    nombre: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
});

export default Categoria;