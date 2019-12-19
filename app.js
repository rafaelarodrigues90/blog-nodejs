// carregando modulos
    const express = require('express');
    const app = express();
    const handlebars = require('express-handlebars');
    const bodyParser = require('body-parser');
    const mongoose = require('mongoose');
    const admin = require('./routes/admin');
    const path = require('path')
    const session = require('express-session')
    const flash = require('connect-flash') // sessão que só aparece uma vez
    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')
    const usuarios = require('./routes/usuario')
    const passport = require('passport')
    require('./config/auth')(passport)


// configurações
    //session
        app.use(session({
            secret: 'cursodenode',
            resave: true,
            saveUninitialized: true
        }))

    // passport
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())

    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg') // variavel global
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null // armazena dados do user logado
            next()
        })

    // body parser: converter o body da requisição para vários formatos
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());

    // handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');

    // mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost:27017/blogapp', {useUnifiedTopology: true, useNewUrlParser: true})
            .then(() => console.log('Conectado ao MongoDB'))
            .catch((err) => console.log('Erro: ' + err))

    // Public
        // eslint-disable-next-line no-undef
        app.use(express.static(path.join(__dirname, 'public')))

// rotas
    // principal
    app.get('/', (req, res) => {
        Postagem.find().populate('categoria').sort({data:"desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    });

    // exibir postagem por slug
    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if(postagem) {
                res.render('postagem/index', {postagem: postagem})
            } else {
                req.flash('error_msg', 'Postagem não encontrada')
                res.redirect('/')
            }
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    })

    // erro 404
    app.get('/404', (req, res) => {
        res.send('404: Page not found')
    })

    // listar categorias
    app.get('/categorias', (req, res) => {
        Categoria.find().then((categorias) => {
            res.render('categorias/index', {categorias: categorias})
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', "Houve um erro ao listar as categorias")
            res.redirect('/')
        })
    });

    // exibir categoria por slug
    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if (categoria) {
                Postagem.find({categoria: categoria._id}).then((postagens) => {
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    console.log(err)
                    req.flash('error_msg', 'Não há postagens nesta categoria')
                    res.redirect('/')
                })
            } else {
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect('/')
            }
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', "Houve um erro interno ao carregar página")
            res.redirect('/')
        })
    })

    // rota admin
    app.use('/admin', admin);

    // rota usuários
    app.use('/usuarios', usuarios)


    // servidor
        const PORT = 8081;
        app.listen(PORT, () => console.log('Servidor conectado em http://localhost:8081'));
