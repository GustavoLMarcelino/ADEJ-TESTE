const Sequelize = require('sequelize');

// Configuração da conexão com o banco de dados MySQL
const sequelize = new Sequelize('ADEJ', 'root', '', {
  dialect: 'mysql', 
  host: 'localhost',
});

module.exports = sequelize;
