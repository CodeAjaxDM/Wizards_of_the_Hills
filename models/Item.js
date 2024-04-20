const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');

const Item = sequelize.define('Item', {
    itemNumber: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    authorName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    authorWebsite: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filePath: {
        type: Sequelize.STRING, // Path to the .zip file
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Item;
