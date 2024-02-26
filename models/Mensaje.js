import db from '../config/db.js'
import { DataTypes } from 'sequelize'

const Mensaje = db.define('mensajes', {
    mensaje: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
});

export default Mensaje;