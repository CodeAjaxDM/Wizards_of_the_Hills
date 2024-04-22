const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db')

class Purchase extends Model {}

Purchase.init({
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'User',
      key: 'username'
    }
  },
  itemId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Item',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Purchase'
});

module.exports = Purchase;