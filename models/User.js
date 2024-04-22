const sequelize = require('../db');
const { Model, DataTypes } = require('sequelize');
const Purchase = require('./Purchase');

class User extends Model {

    static async findUser(username, password){
        try {
            const user = await User.findByPk(username);
            if(user && user.password === password){
                return user;
            }else{
                return null;
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    static async updateAuthorName(username, newAuthorName) {
      try {
        const user = await User.findByPk(username);
        if (user) {
          user.authorName = newAuthorName;
          await user.save();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error updating author name:', error);
        return false;
      }
    }

    isAdminUser() {
      return this.isAdmin;
    }
}

User.init({
  username: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  authorName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false // Default value set to false
  }
}, {
  sequelize, 
  modelName: 'User'
});

User.hasMany(Purchase, {
  foreignKey: 'userId',
  sourceKey: 'username',
  onDelete: 'CASCADE'
});

module.exports = User;
