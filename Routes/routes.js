const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { Sequelize, Beneficiado, Condicao } = require('../Modules/models');
const Volunteer = require('../Modules/volunteer');
const controller = require('../Controllers/controller');
const { Op } = require('sequelize');
const authMiddleware = require('../Middlewares/authMiddleware');

const router = express.Router();

const htmlDir = path.join(__dirname, '..', 'HTML');
const rootDir = path.join(__dirname, '..');

// Configurar sessão
router.use(session({
  secret: 'seu-segredo-aqui',
  resave: false,
  saveUninitialized: true
}));

// Redirecionar a rota inicial para /home diretamente
router.get('/', authMiddleware, (req, res) => {
  res.sendFile(path.join(htmlDir, 'Home.html'));
});

// Rotas de páginas
router.get('/cadastro', authMiddleware, (req, res) => {
  res.sendFile(path.join(htmlDir, 'Cadastro.html'));
});

router.get('/consulta', authMiddleware, (req, res) => {
  res.sendFile(path.join(htmlDir, 'Consulta.html'));
});

router.get('/login', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(htmlDir, 'Register.html'));
});

router.get('/home', (req, res) => {
  res.sendFile(path.join(htmlDir, 'Home.html'));
});

// Rota para lidar com o envio do formulário de cadastro
router.post('/cadastro', authMiddleware, async (req, res) => {
  try {
    await controller.createBeneficiadoComCondicao(req, res);
  } catch (error) {
    res.status(500).send('Erro ao cadastrar beneficiado');
  }
});

// Rota para processar o registro
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    await Volunteer.create({ username, password: hashedPassword });
    res.redirect('/login');
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).send('Erro ao registrar');
  }
});

// Rota para processar o login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const volunteer = await Volunteer.findOne({ where: { username } });
    if (volunteer) {
      const isPasswordValid = await bcrypt.compare(password, volunteer.password);
      if (isPasswordValid) {
        req.session.volunteerId = volunteer.id;
        console.log('Login bem-sucedido:', username);
        res.redirect('/home');
      } else {
        console.log('Senha inválida para o usuário:', username);
        res.status(401).send('Usuário ou senha inválidos');
      }
    } else {
      console.log('Usuário não encontrado:', username);
      res.status(401).send('Usuário ou senha inválidos');
    }
  } catch (error) {
    console.error('Erro ao logar:', error);
    res.status(500).send('Erro ao logar');
  }
});

// Exemplo de rota protegida
router.get('/protected', authMiddleware, (req, res) => {
  res.send('Esta é uma rota protegida');
});

// Rota para listar todos os beneficiados e para pesquisa
router.get('/api/beneficiados', authMiddleware, async (req, res) => {
  try {
    const { nome, id, cpf, sexo, condicao, telefone, data_nascimento, data_inscricao, renda, medicacao, email } = req.query;

    const whereClause = {
      [Op.and]: []
    };

    if (nome) whereClause[Op.and].push({ nome: { [Op.like]: `%${nome}%` } });
    if (id) whereClause[Op.and].push({ id });
    if (cpf) whereClause[Op.and].push({ cpf: { [Op.like]: `%${cpf}%` } });
    if (sexo) whereClause[Op.and].push({ sexo });
    if (telefone) whereClause[Op.and].push({ telefone: { [Op.like]: `%${telefone}%` } });
    if (data_nascimento) whereClause[Op.and].push({ dataNascimento: data_nascimento });
    if (data_inscricao) whereClause[Op.and].push({ dataInscricao: data_inscricao });
    if (renda) whereClause[Op.and].push({ rendaFamiliar: { [Op.like]: `%${renda}%` } });
    if (email) whereClause[Op.and].push({ email: { [Op.like]: `%${email}%` } });

    const condicaoClause = [];
    if (condicao) condicaoClause.push({ condicao: { [Op.like]: `%${condicao}%` } });
    if (medicacao) condicaoClause.push({ medicacao: { [Op.like]: `%${medicacao}%` } });

    const beneficiados = await Beneficiado.findAll({
      where: whereClause[Op.and].length ? whereClause : undefined,
      include: [{
        model: Condicao,
        where: condicaoClause.length ? { [Op.or]: condicaoClause } : undefined,
        required: false
      }]
    });

    const results = beneficiados.map(b => ({
      id: b.id,
      nome: b.nome,
      cpf: b.cpf,
      sexo: b.sexo,
      telefone: b.telefone,
      dataNascimento: b.dataNascimento,
      dataInscricao: b.dataInscricao,
      rendaFamiliar: b.rendaFamiliar,
      email: b.email,
      condicao: b.Condicaos.length > 0 ? b.Condicaos[0].condicao : '',
      medicacao: b.Condicaos.length > 0 ? b.Condicaos[0].medicacao : ''
    }));

    res.json(results);
  } catch (error) {
    console.error('Erro durante a pesquisa:', error);
    res.status(500).json({ error: 'Erro durante a pesquisa' });
  }
});

// Rota para exibir a página de edição com os dados do beneficiado
router.get('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const beneficiado = await Beneficiado.findByPk(req.params.id, {
      include: [{
        model: Condicao,
        required: false
      }]
    });

    if (!beneficiado) {
      return res.status(404).send('Beneficiado não encontrado');
    }

    res.sendFile(path.join(htmlDir, 'Editar.html'));
  } catch (error) {
    console.error('Erro ao buscar beneficiado:', error);
    res.status(500).send('Erro ao buscar beneficiado');
  }
});

// Rota para obter dados do beneficiado específico
router.get('/api/beneficiado/:id', authMiddleware, async (req, res) => {
  try {
    const beneficiado = await Beneficiado.findByPk(req.params.id, {
      include: [{
        model: Condicao,
        required: false
      }]
    });

    if (!beneficiado) {
      return res.status(404).json({ error: 'Beneficiado não encontrado' });
    }

    res.json(beneficiado);
  } catch (error) {
    console.error('Erro ao buscar beneficiado:', error);
    res.status(500).json({ error: 'Erro ao buscar beneficiado' });
  }
});

// Rota para atualizar os dados do beneficiado
router.post('/edit/:id', authMiddleware, async (req, res) => {
  try {
    const beneficiado = await Beneficiado.findByPk(req.params.id);

    if (!beneficiado) {
      return res.status(404).send('Beneficiado não encontrado');
    }

    // Atualizar os dados do beneficiado
    await beneficiado.update({
      nome: req.body.nome,
      dataNascimento: req.body['data-nascimento'],
      sexo: req.body.sexo,
      telefone: req.body.telefone,
      peso: req.body.peso,
      altura: req.body.altura,
      estadoCivil: req.body['estado-civil'],
      naturalidade: req.body.naturalidade,
      cpf: req.body.cpf,
      rg: req.body.rg,
      rendaFamiliar: req.body['renda-familiar'],
      endereco: req.body.endereco,
      email: req.body.email,
      contatoEmergencia: req.body['contato-emergencia'],
      relacao: req.body.relacao,
      nomeResponsavel: req.body['nome-responsavel'],
      cadastroUnico: req.body['cadastro-unico'] === 'on' ? req.body['cadastro-unico-text'] : null
    });

    // Atualizar os dados da condição associada ao beneficiado
    const condicao = await Condicao.findOne({ where: { BeneficiadoId: beneficiado.id } });

    if (condicao) {
      await condicao.update({
        tipo: req.body.tipo,
        condicao: req.body.condicao,
        cid: req.body.cid,
        pis: req.body.pis,
        nis: req.body.nis,
        medicacao: req.body.medicacao,
        equipamentoLocomocao: req.body.equipamento_locomocao,
        tiposTratamento: req.body.tipos_tratamento,
        servicosUtilizados: req.body.servicos_utilizados,
        usoContinuoMedicamento: req.body.uso_continuo_medicamento,
        alergia: req.body.alergia,
        alergiaMedicamento: req.body.alergia_medicamento,
        observacoes: req.body.observacoes
      });
    }

    res.redirect('/consulta');
  } catch (error) {
    console.error('Erro ao atualizar beneficiado:', error);
    res.status(500).send('Erro ao atualizar beneficiado');
  }
});

// Rota para deletar um beneficiado
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const beneficiado = await Beneficiado.findByPk(req.params.id);

    if (!beneficiado) {
      return res.status(404).json({ error: 'Beneficiado não encontrado' });
    }

    await beneficiado.destroy();
    res.status(200).json({ message: 'Beneficiado deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar beneficiado:', error);
    res.status(500).json({ error: 'Erro ao deletar beneficiado' });
  }
});


module.exports = router;
