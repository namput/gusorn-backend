const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Templates = sequelize.define(
    "Templates",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
          },          
        templateName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        },
        templateUrl: {
        type: DataTypes.STRING(255),
        allowNull: false,
        },
    },
    {
        tableName: "templates",
        timestamps: true,
    }

)


module.exports = Templates;