import { DataTypes, Model } from "sequelize";
import { sequelize } from "../dbconfig.js";

export class Usuario extends Model {}

Usuario.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        userid: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
 
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    },
    {
        sequelize,
        modelName: "usuario",
        tableName: 'usuario', // Sino le agrega una "s" al final
        timestamps: false,
    }
);