const express = require('express');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json()); // Middleware para analisar o corpo da solicitação no formato JSON

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.header('Access-Control-Allow-Credentials', true);
  if ('OPTIONS' == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Configurações do transporte de e-mail
const transporter = nodemailer.createTransport({
  // Configurações do servidor de e-mail ou serviço de terceiros
  // Exemplo para usar o Gmail:
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com', // Substitua com o seu e-mail
    pass: 'yourpassword' // Substitua com a sua senha
  }
});

// Configuração do banco de dados SQLite
const db = new sqlite3.Database('root:your_db_path//your_db.db (for windows) and root\your_db_path\your_db.db (for unix based systems)');


// Rota para enviar o e-mail e salvar os dados no banco de dados
app.post('/enviar-email', (req, res) => {
  console.log(req.body);
  res.send('Formulario Recebido');
  if (req.method === 'POST') {
    const { destinatario, assunto, conteudo} = req.body;
    const usuario = JSON.parse(req.body.usuario);

    // Salvar os dados no banco de dados SQLite
    
    const sql = `INSERT INTO usuarios (email, nome, senha, cpf, celular) VALUES ('${usuario.email}', '${usuario.nome}', '${usuario.senha}', '${usuario.cpf}', '${usuario.celular}')`;
    console.log(sql);
    db.run(sql, function (err) {
      
      if (err) {
        console.error('Erro ao inserir os dados no banco de dados:', err);
        res.status(500).send('Erro ao salvar os dados no banco de dados');
      } else {
        console.log('Dados inseridos no banco de dados com sucesso');

        // Configurações do e-mail
        const mailOptions = {
          from: 'youremail@gmail.com', // Substitua com o seu e-mail
          to: destinatario,
          subject: assunto,
          text: conteudo
        };

        console.log('Recebida solicitação POST para /enviar-email');

        // Enviar o e-mail
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log('Erro ao enviar o e-mail:', error);
            res.status(500).send('Erro ao enviar o e-mail');
          } else {
            console.log('E-mail enviado:', info.response);
            res.send('E-mail enviado com sucesso');
          }
        });
      }
    });
  } else {
    res.status(405).send('Method Not Allowed');
  }
});

// Inicie o servidor na porta desejada
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
