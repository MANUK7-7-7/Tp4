import { DataTypes, Model } from "sequelize";
import { sequelize } from "../dbconfig.js";

export class Escucha extends Model {}

Escucha.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        reproducciones: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        }
    },
    {
        sequelize,
        modelName: "escucha",
        tableName: 'escucha', // Sino le agrega una "s" al final
        timestamps: false,
    }
);