const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Category')
const Category = mongoose.model('categories')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')

//Definindo as rotas

router.get('/', eAdmin, (req,res) => {
   //res.send("Página principal do painel ADM")
   res.render('admin/index')
})

router.get('/posts', eAdmin, (req,res) => {
    res.send("Página de Posts")
})

router.get('/categories', eAdmin, (req,res) => {
    //res.send('Página de categorias')
    Category.find().sort({date: 'desc'}).then((categories)=> {
        res.render("admin/categories", {categories: categories.map(categories => categories.toJSON())})
    }).catch((err)=> {
        req.flash('error_msg', "Houve um erro ao listar categorias")
        res.redirect('/admin')
    })
    
})

router.get('/categories/add', eAdmin, (req,res) => {
    res.render("admin/addcategories")
})

router.post('/categories/new', eAdmin, (req,res)=> {

    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: 'Nome inválido!'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({texto: "Slug inválido!"})
    }

    if(req.body.nome.length < 2) {
        erros.push({texto: "Nome da categoria muito pequeno"})
    }

    if(erros.length > 0) {
        res.render('admin/addcategories', {erros: erros})
    } else {
        const newCategory = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Category(newCategory).save().then(()=> {
            //console.log('Categoria salva com sucesso!')
            req.flash('success_msg', "Categoria criada com sucesso!")
            res.redirect('/admin/categories')
        }).catch((err)=> {
            req.flash('error_msg', "Houve um erro ao salvar a categoria! Tente novamente.")
            //console.log('Erro ao salvar categoria!')
            res.redirect('/admin')
        })
    }
})

router.get('/categories/edit/:id', eAdmin, (req,res) => {
    //res.send('página de edição de categoria')
    Category.findOne({_id: req.params.id}).then((categoria)=>{
        res.render('admin/editcategories', {categoria: categoria.toJSON()})
    }).catch((err)=> {
        req.flash('error_msg', "Esta categoria não existe")
        res.redirect('/admin/categories')
    })
    
})

router.post('/categories/edit', eAdmin, (req,res) => {
    Category.findOne({_id: req.body.id}).then((categoria)=>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash('success_msg', "Categoria editada com sucesso!")
            res.redirect('/admin/categories')
        }).catch((err)=>{
            req.flash('error_msg', "Houve um erro ao editar a categoria")
            res.redirect('/admin/categories')
        })
    }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro na edição da categoria')
        res.redirect('/admin/categories')
    })
})

router.post('/categories/delete', eAdmin, (req,res)=>{
    Category.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada!')
        res.redirect('/admin/categories')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar!')
        res.redirect('/admin/categories')
    })
})

router.get('/postagens', (req,res) => {
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens)=>{
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err)=>{
        req.flash('error_msg','Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })
})

router.get('/postagens/add', (req,res) => {
    Category.find().lean().then((categories) => {
        res.render('admin/addpostagem', {categories: categories})
    }).catch((err) => {
        req.flash('error_msg', "erro ao carregar o formulário")
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', (req,res) => {
    var erros = [];
    if(req.body.categoria == '0') {
        erros.push({texto: "Categoria inválida. Registre uma categoria"})
    }

    if(erros.length > 0) {
        res.render('admin/addpostagem', {erros: erros})
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
        new Postagem(novaPostagem).save().then(()=>{
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro ao criar a postagem!')
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id', eAdmin, (req,res)=>{

    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{

        Category.find().lean().then((categoria)=>{
            res.render('admin/editpostagens', {categoria: categoria, postagem: postagem})
        }).catch((err)=>{
            req.flash('error_msg','houve um erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })

    }).catch((err)=>{
        req.flash('error_msg','houve um erro ao editar')
        res.redirect('/admin/postagens')
    })    
})


router.post('/postagem/edit', (req,res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash('success_msg', 'postagem editada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((err)=>{
            req.flash('error_msg', 'erro interno')
            res.redirect('/admin/postagens')
        })
    }).catch((err)=>{
        req.flash('error_msg', 'houve um erro ao salvar a edição')
        res.redirect('/admin/postagens')
    })
})

router.get('/postagens/deletar/:id', (req,res)=>{
    Postagem.remove({_id: req.params.id}).then(()=>{
        req.flash('success_msg', 'postagem deletada com sucesso!')
        res.redirect('/admin/postagens')
    }).catch((err)=>{
        req.flash('error_msg','Erro ao excluir postagem')
        res.redirect('/admin/postagens')
    })
})
    


module.exports = router