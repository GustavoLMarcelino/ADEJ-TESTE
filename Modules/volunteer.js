const { Sequelize, DataTypes } = require('sequelize');
const database = require('../Conn/db');

const Volunteer = database.define('Volunteer', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Volunteer;
