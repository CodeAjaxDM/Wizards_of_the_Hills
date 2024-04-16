const { Sequelize } = require('sequelize')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/cmsdb1.sqlite'
})

module.exports = sequelize