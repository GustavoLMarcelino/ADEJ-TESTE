require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();
const routes = require('./Routes/routes');
const database = require('./Conn/db');
const Volunteer = require('./Modules/volunteer');

// Configurar o diretório de arquivos estáticos
app.use(express.static(path.join(__dirname, 'HTML')));
app.use(express.static(path.join(__dirname, 'imagens')));

// Usar body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar sessão
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Usar rotas
app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});

// Sincronização do banco de dados ao iniciar o servidor
(async () => {
  try {
    await database.sync();
    console.log('Conexão com o banco de dados estabelecida.');

    // Criar usuário admin se não existir
    const hashedPassword = await bcrypt.hash('admin', 10);
    const [user, created] = await Volunteer.findOrCreate({ where: { username: 'admin' }, defaults: { password: hashedPassword } });
    
    if (created) {
      console.log('Usuário admin criado com sucesso.');
    } else {
      console.log('Usuário admin já existe.');
    }
  } catch (error) {
    console.error('Erro ao conectar e sincronizar o banco de dados:', error);
  }
})();
