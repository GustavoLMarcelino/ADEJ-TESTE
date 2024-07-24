const Sequelize = require('sequelize');
const database = require('../Conn/db');

// Definição do modelo de Beneficiado
const Beneficiado = database.define('Beneficiado', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  dataNascimento: {
    type: Sequelize.DATEONLY,
    allowNull: false
  },
  sexo: {
    type: Sequelize.STRING,
    allowNull: false
  },
  telefone: {
    type: Sequelize.STRING,
    allowNull: false
  },
  peso: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  altura: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  estadoCivil: {
    type: Sequelize.STRING,
    allowNull: false
  },
  naturalidade: {
    type: Sequelize.STRING,
    allowNull: false
  },
  cpf: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  rg: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  rendaFamiliar: {
    type: Sequelize.STRING,
    allowNull: false
  },
  endereco: {
    type: Sequelize.STRING,
    allowNull: false
  },
  dataInscricao: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  contatoEmergencia: {
    type: Sequelize.STRING,
    allowNull: false
  },
  relacao: {
    type: Sequelize.STRING,
    allowNull: false
  },
  nomeResponsavel: {
    type: Sequelize.STRING,
    allowNull: false
  },
  cadastroUnico: {
    type: Sequelize.TEXT,  // Alterado para TEXT
    allowNull: true
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
});

// Definição do modelo de Condição
const Condicao = database.define('Condicao', {
  tipo: {
    type: Sequelize.STRING,
    allowNull: false
  },
  condicao: {
    type: Sequelize.STRING,
    allowNull: false
  },
  cid: {
    type: Sequelize.STRING,
    allowNull: false
  },
  pis: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  nis: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  medicacao: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  equipamentoLocomocao: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  tiposTratamento: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  servicosUtilizados: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  usoContinuoMedicamento: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  alergia: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  alergiaMedicamento: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  observacoes: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  BeneficiadoId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Beneficiado,
      key: 'id'
    }
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
});

// Relacionamentos
Beneficiado.hasMany(Condicao, { foreignKey: 'BeneficiadoId' });
Condicao.belongsTo(Beneficiado, { foreignKey: 'BeneficiadoId' });

module.exports = {
  Beneficiado,
  Condicao
};
