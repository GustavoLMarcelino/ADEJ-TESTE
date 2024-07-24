const { Beneficiado, Condicao } = require('../Modules/models');
const database = require('../Conn/db'); // Importar a conexão do banco de dados
const { Sequelize } = require('sequelize');

exports.createBeneficiadoComCondicao = async (req, res) => {
  try {
    // Iniciar uma transação para garantir a atomicidade da operação
    const result = await database.transaction(async (t) => {
      // Criar o beneficiado (isso é onde ocorre o INSERT INTO Beneficiados)
      const newBeneficiado = await Beneficiado.create({
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
        dataInscricao: new Date(), // Define a data de inscrição automaticamente
        email: req.body.email,
        contatoEmergencia: req.body['contato-emergencia'],
        relacao: req.body.relacao,
        nomeResponsavel: req.body['nome-responsavel'],
        cadastroUnico: req.body['cadastro-unico'] === 'on' ? req.body['cadastro-unico-text'] : null // Capturar o valor do campo adicional
      }, { transaction: t });

      // Criar a condição associada ao beneficiado
      const newCondicao = await Condicao.create({
        tipo: req.body.tipo,
        condicao: req.body.condicao,
        cid: req.body.cid,
        pis: req.body.pis,
        nis: req.body.nis,
        medicacao: req.body.medicacao,
        equipamentoLocomocao: req.body.equipamentoLocomocao,
        tiposTratamento: req.body.tiposTratamento,
        servicosUtilizados: req.body.servicosUtilizados,
        usoContinuoMedicamento: req.body.usoContinuoMedicamento,
        alergia: req.body.alergia,
        alergiaMedicamento: req.body.alergiaMedicamento,
        observacoes: req.body.observacoes,
        BeneficiadoId: newBeneficiado.id
      }, { transaction: t });

      return { newBeneficiado, newCondicao };
    });

    res.redirect('/Home.html'); // Redirecionar para a página inicial ou outra página adequada após o cadastro
  } catch (error) {
    console.error('Erro durante a transação:', error);
    if (error.name === 'SequelizeValidationError') {
      const errorMessages = error.errors.map(err => err.message);
      res.status(400).json({ error: 'Validation error', details: errorMessages });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};



exports.searchBeneficiados = async (req, res) => {
  try {
    const { nome, id, cpf, sexo, condicao, telefone, data_nascimento, data_inscricao, renda, medicacao, email } = req.query;

    const whereClause = {
      [Sequelize.Op.or]: []
    };

    if (nome) whereClause[Sequelize.Op.or].push({ nome: { [Sequelize.Op.like]: `%${nome}%` } });
    if (id) whereClause[Sequelize.Op.or].push({ id });
    if (cpf) whereClause[Sequelize.Op.or].push({ cpf: { [Sequelize.Op.like]: `%${cpf}%` } });
    if (sexo) whereClause[Sequelize.Op.or].push({ sexo });
    if (telefone) whereClause[Sequelize.Op.or].push({ telefone: { [Sequelize.Op.like]: `%${telefone}%` } });
    if (data_nascimento) whereClause[Sequelize.Op.or].push({ dataNascimento: data_nascimento });
    if (data_inscricao) whereClause[Sequelize.Op.or].push({ dataInscricao: data_inscricao });
    if (renda) whereClause[Sequelize.Op.or].push({ rendaFamiliar: { [Sequelize.Op.like]: `%${renda}%` } });
    if (email) whereClause[Sequelize.Op.or].push({ email: { [Sequelize.Op.like]: `%${email}%` } });

    const condicaoClause = [];
    if (condicao) condicaoClause.push({ condicao: { [Sequelize.Op.like]: `%${condicao}%` } });
    if (medicacao) condicaoClause.push({ medicacao: { [Sequelize.Op.like]: `%${medicacao}%` } });

    const beneficiados = await Beneficiado.findAll({
      where: whereClause[Sequelize.Op.or].length ? whereClause : undefined,
      include: [{
        model: Condicao,
        where: condicaoClause.length ? { [Sequelize.Op.or]: condicaoClause } : undefined,
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
};
