//importando os models
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Categoria")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")

router.get("/", eAdmin, (req, res) => {
  res.render("admin/index");
});

router.get("/posts", eAdmin, (req, res) => {
  res.render("Página de posts");
});

router.get("/categorias", eAdmin, (req, res) => {
  Categoria.find()
    .sort({ date: "desc" })
    .lean()
    .then((categorias) => {
      res.render("admin/categorias", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "aconteceu um erro ao adicionar categorias");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("admin/addcategorias");
});

//ROTA DE VALIDAÇÃO

router.post("/categorias/nova", eAdmin, (req, res) => {
  var erros = [];

  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido" });
  }

  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: "slug inválido" });
  }

  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categoria é muito pequeno!" });
  }

  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros: erros });
  } else {
    const novaCategoria = {
      name: req.body.nome,
      slug: req.body.slug,
    };

    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash("success_msg", "Categoria criada com Sucesso!");
        res.redirect("/admin/categorias");
      })
      .catch((err) => {
        req.flash(
          "error_msg",
          "Houve um erro ao salvar a categoria, tente novamente!"
        );
        res.redirect("/admin");
      });
  }
});

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .lean()
    .then((categoria) => {
      res.render("admin/editcategorias", { categoria: categoria });
    })
    .catch((err) => {
      req.flash("error_msg", "Essa categoria não existe");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit", eAdmin, (req, res) => {
  // Logar o ID para verificação
  console.log("ID da Categoria:", req.body.id);

  // Verificar se o ID é válido
  if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
    req.flash("error_msg", "ID da categoria inválido!");
    return res.redirect("/admin/categorias");
  }

  Categoria.findOne({ _id: req.body.id })
    .then((categoria) => {
      if (!categoria) {
        req.flash("error_msg", "Categoria não encontrada!");
        return res.redirect("/admin/categorias");
      }
      categoria.nome = req.body.nome;
      categoria.slug = req.body.slug;

      categoria
        .save()
        .then(() => {
          req.flash("success_msg", "Categoria editada com sucesso!");
          res.redirect("/admin/categorias");
        })
        .catch((err) => {
          req.flash(
            "error_msg",
            "Houve um erro interno ao salvar a edição da categoria"
          );
          res.redirect("/admin/categorias");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao editar a categoria!");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/deletar", eAdmin, (req, res) => {
  Categoria.deleteOne({ _id: req.body.id })
    .then((categoria) => {
      req.flash("success_msg", "Categoria deletada com sucesso !");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar categoria");
      res.redirect("/admin/categorias");
    });
});


router.get("/postagens", eAdmin, (req, res) => {

  Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
    res.render("admin/postagens", {postagens: postagens});
  }).catch((err) => {
    req.flash("error_msg" , "Houve um erro ao listar postagens")
    res.redirect("/admin")
  })
})



router.get("/postagens/add", eAdmin, (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render("admin/addpostagens", {categorias: categorias});
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário")
      res.redirect("/admin")
    });
});


router.post("/postagens/nova", eAdmin, (req,res) => {
  var erros = [];
console.log(req.body)
  if(req.body.categoria == "0") {
    erros.push({texto: "Categoria inválida! Registre uma Categoria!"});
  }

  if(erros.length > 0){
   return res.render("admin/addpostagens", {erros: erros});
  } else {
    const novaPostagem = { 
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      slug: req.body.slug,
      categoria: req.body.categoria
    };

    new Postagem(novaPostagem).save().then(() => { 
      req.flash("success_msg", "Postagem criada com sucesso");
      res.redirect("/admin/postagens");
    }).catch((err) => {
      req.flash("error_msg", "Erro ao criar a postagem");
      console.log("Erro ao cadastrar postagem: ", err)
      res.redirect("/admin/postagens");
    });
  }
});

router.get("/postagens/edit/:id", eAdmin, (req, res) => {

      Postagem.findOne({_id: req.params.id}).lean().then((postagens) => {
        
      Categoria.find().lean().then((categorias) => {
        res.render("admin/editpostagens", {categorias, postagens})
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin/postagens")
      })
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
      })


})

router.post("/postagens/deletar/", eAdmin, (req, res) => {
  Postagem.deleteOne({ _id: req.body.id })
    .then((postagens) => {
      req.flash("success_msg", "Postagem deletada com sucesso !");
      res.redirect("/admin/postagens");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar Postagem");
      res.redirect("/admin/postagens");
    });
});
   
module.exports = router;

