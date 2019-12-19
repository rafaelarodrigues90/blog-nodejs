const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')


// ROTA PRINCIPAL
    router.get('/', eAdmin, (req, res) => {
        res.render('/admin/index')
    });


// CATEGORIAS

    // Create
    router.get('/categorias/add', eAdmin, (req, res) => {
        res.render('admin/addcategorias')
    });

    router.post('/categorias/nova', eAdmin, (req, res) => {
        const erros = []

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({texto: 'Nome inválido'})
        }

        if(!req.body.slug || typeof req.body.slug == undefined || req.body.nome == null) {
            erros.push({texto: 'Slug inválido'})
        }

        if(req.body.nome.length < 2) {
            erros.push({texto:'Nome da categoria muito pequeno'})
        }

        if(erros.length > 0) {
            res.render('admin/addcategorias', {erros: erros})
        } else {
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }
        
            new Categoria(novaCategoria).save().then(() => {
                req.flash('success_msg', 'Categoria criada com sucesso')
                res.redirect('/admin/categorias')
            }).catch((err) => {
            console.log(err)
                req.flash('error_msg', 'Houve um erro ao salvar categoria. Tente novamente.')
                res.redirect('/admin')
            })
        }
    });


    // Read
    router.get('/categorias', eAdmin, (req, res) => {
        Categoria.find().sort({date: 'desc'}).then((categorias) => {
            res.render('admin/categorias', {categorias: categorias})
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin')
        }) //lista todas as categorias existentes 
    });


    // Update
    router.get('/categorias/edit/:id', eAdmin, (req, res) => {
        Categoria.findOne({_id:req.params.id}).then((categoria) => {
            res.render('admin/editcategorias', {categoria: categoria});
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', 'Esta categoria não existe');
            res.redirect('/admin/categorias');
        });
    });

    router.post('/categorias/edit', eAdmin, (req, res) => {
            // criar sistema de validação
        const erros = []

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({texto: 'Nome inválido'})
        }

        if(!req.body.slug || typeof req.body.slug == undefined || req.body.nome == null) {
            erros.push({texto: 'Slug inválido'})
        }

        if(req.body.nome.length < 2) {
            erros.push({texto:'Nome da categoria muito pequeno'})
        }

        if(erros.length > 0) {
            req.flash('error_msg', erros[0].texto)
            res.redirect(`edit/${req.body.id}`)
        } else {

            Categoria.findOne({_id: req.body.id})
            .then((categoria) => {    
                categoria.nome = req.body.nome
                categoria.slug = req.body.slug
                categoria.save().then(() => {
                    req.flash('success_msg', 'Categoria editada com sucesso');
                    res.redirect('/admin/categorias')    
                }).catch((err) => {
                    console.log(err)
                    req.flash('error_msg', 'Houve um erro ao salvar edição')
                    res.redirect('/admin/categorias')
                });
            }).catch((err) => {
                console.log(err)
                req.flash('error_msg', 'Erro ao editar categoria')
                res.redirect('/admin/categorias')
            });
        }
    });


    // Delete
    router.post('/categorias/deletar', eAdmin, (req, res) => {
        Categoria.deleteOne({_id:req.body.id}).then(() => {
            req.flash('success_msg', 'Categoria deletada com sucesso')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', 'Erro ao deletar')
            res.redirect('/admin/categorias')
        });
    });


// POSTAGENS

    // Create
    router.get('/postagens/add', eAdmin, (req,res) => {
        Categoria.find().then((categorias) => {
            res.render('admin/addpostagem', {categorias: categorias})
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', 'Houve um erro ao carregar categorias')
            res.redirect('/admin')
        })
    })

    router.post('/postagens/nova', eAdmin, (req, res) => {    
        var erros = []

        // criar restante da validação

        if (req.body.categoria == '0') {
            erros.push({texto: 'Categoria inválida. Cadastre uma categoria.'})
        }

        if (erros.length > 0) {
            res.render('admin/addpostagem', {erros: erros})
        } else {
            const novaPostagem = {
                titulo: req.body.titulo,
                slug: req.body.slug,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria
            }

            new Postagem(novaPostagem).save().then(() => {
                req.flash('success_msg', 'Postagem criada com sucesso')
                res.redirect('/admin/postagens')
            }).catch((err) => {
                console.log(err)
                req.flash('error_msg', 'Houve um erro ao salvar categoria. Tente novamente.')
                res.redirect('/admin/postagens')
            })
        }
    })

    
    // Read
    router.get('/postagens', eAdmin, (req, res) => {
        Postagem.find().populate('categoria').sort({data:'desc'}). then((postagens) => {
            res.render('admin/postagens', {postagens: postagens})
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', "Erro ao listar as postagens")
            res.redirect('/admin')
        })
    })


    // Update
    router.get('/postagens/edit/:id', eAdmin, (req, res) => {
        Postagem.findOne({_id:req.params.id}).then((postagem) => {
            Categoria.find().then((categorias) => {
                res.render('admin/editpostagens', {categorias: categorias, postagem: postagem});
            })
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', 'Esta postagem não existe');
            res.redirect('/admin/postagens');
        });
    })

    router.post('/postagens/edit', eAdmin, (req, res) => {

        // criar sistema de validação
        
        Postagem.findOne({_id: req.body.id})
        .then((postagem) => {    
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria
            
            postagem.save().then(() => {
                req.flash('success_msg', 'Postagem editada com sucesso');
                res.redirect('/admin/postagens')    
            }).catch((err) => {
                console.log(err)
                req.flash('error_msg', 'Houve um erro ao salvar edição')
                res.redirect('/admin/postagens')
            });
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', 'Erro ao editar postagem')
            res.redirect('/admin/postagens')
        });
    });

    
    // Delete
    router.post('/postagens/deletar', eAdmin, (req, res) => {
        Postagem.deleteOne({_id:req.body.id}).then(() => {
            req.flash('success_msg', "Postagem deletada")
            res.redirect('/admin/postagens')
        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', "Houve um erro ao deletar postagem")
            res.redirect('/admin/postagens')
        })
    })


module.exports = router; 