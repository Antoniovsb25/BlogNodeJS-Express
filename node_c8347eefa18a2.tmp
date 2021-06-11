//Carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Postagem")
const Postagem = mongoose.model('postagens')
require("./models/Category")
const Category = mongoose.model('categories')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require("./config/auth")(passport)

//Configurações

    //Sessão
    app.use(session({
        secret: 'cursodenode',
        resave: true,
        saveUnitilialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    //MiddleWare
    app.use((req,res,next)=> {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null;
        next()
    })
    //body parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

    //HandleBars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')

    //Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/blogapp', {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    }).then(()=> {
        console.log('Conectado com sucesso ao mongo!')
    }).catch((err)=> {
        console.log(`Erro ao se conectar ao mongo: ${err}`)
    })
    //Public
    app.use(express.static(path.join(__dirname, 'public'))) //mostrando ao express aonde estão os arquivos estáticos
    app.use((req,res,next)=> {
        console.log("Oi, eu sou um middleware")
        next()
    })
//Rotas
    app.get('/', (req,res)=>{
        Postagem.find().populate('categoria').sort({data: 'desc'}).lean().then((postagens)=>{
            res.render('index', {postagens: postagens})
        }).catch((err)=>{
            console.log(err)
            req.flash('error_msg', 'Erro interno')
            res.redirect('/404')
        })  
    })

    app.get('/postagem/:slug', (req,res) => {
        const slug = req.params.slug
        Postagem.findOne({slug})
            .then(postagem => {
                if(postagem){
                    const post = {
                        titulo: postagem.titulo,
                        data: postagem.data,
                        conteudo: postagem.conteudo
                    }
                    res.render('postagem/index', post)
                }else{
                    req.flash("error_msg", "Essa postagem nao existe")
                    res.redirect("/")
                }
            })
            .catch(err => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/")
            })
    })


    app.get('/categories', (req,res)=>{
        Category.find().lean().then((categories)=>{
            res.render('categories/index', {categories: categories})
            
        }).catch((err)=>{
            req.flash('error_msg','Houve um erro ao listar categorias')
            res.redirect('/')
        })
    })



   

    app.get('/404', (req,res)=>{
        res.send('Error 404')
    })

   
    app.use('/admin', admin) //prefixo de todas as rotas
    app.use('/usuarios', usuarios)
//Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log("Servidor rodando com sucesso!")
})

