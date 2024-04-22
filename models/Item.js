const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Purchase = require('./Purchase');

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
        allowNull: true // Changed to allow null
    },
    filePath: {
        type: Sequelize.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    published: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false // Default value set to false
    },
    ownedByAuthor: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true // Default value set to true
    },
});

Item.belongsToMany(User, {
    through: Purchase,
    foreignKey: 'itemId',
    otherKey: 'userId'
});

module.exports = Item;
