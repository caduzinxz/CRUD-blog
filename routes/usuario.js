const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")

router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req, res) => {
    var erros = []
    if (
        !req.body.nome ||
        typeof req.body.nome == undefined ||
        req.body.nome == null
      ) {
        erros.push({ texto: "Nome inválido" });
      }
    
      if (
        !req.body.email ||
        typeof req.body.email == undefined ||
        req.body.email == null
      ) {
        erros.push({ texto: "email inválido" });
      }

      if (
        !req.body.senha ||
        typeof req.body.senha == undefined ||
        req.body.senha == null
      ) {
        erros.push({ texto: "senha inválida" });
      }

      if(req.body.senha.length < 4) {
        erros.push({texto: "A senha é muito curta !"})
      }

      if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas precisam ser iguais, tente novamente !"})
      }

      if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
      } else {
        Usuario.findOne.lean()({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Já existe uma conta registrada com este email em nosso sistema!")
                res.redirect("/registro")
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                new Usuario(usuario).save().then(() => {
                    req.flash("success_msg", "Usuario criado com sucesso!")
                    res.redirect("")
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao criar um Usuario!")
                    res.redirect("")
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
      }

      

});

module.exports = router