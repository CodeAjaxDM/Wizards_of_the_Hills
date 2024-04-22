const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db')

class Purchase extends Model { }

Purchase.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  itemNumber: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Purchase'
});

module.exports = Purchase;