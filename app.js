//carregando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require('./routes/admin')
    const path = require("path")
    const mongoose = require('mongoose')
    const session = require("express-session")
    const flash = require("connect-flash")
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
// Configurações 
    //sessão
        app.use(session({
            secret: "curso de node",
            resave: true,
            saveUninitialized: true,
            cookie: {
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60000
            }
            
        }))
        app.use(flash())
        
    //Middlewares
    app.use((req,res,next) =>  {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        next()
    })

    //body parser
        app.use(express.urlencoded({extended: true}))
        app.use(express.json())

    //handlebars
        app.engine('handlebars', handlebars.engine({defaultlayout: 'main',
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true,
            }
        }))
        app.set('view engine', 'handlebars');

    //Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp").then(() => {
            console.log("Conectado ao Mongo!")
        }).catch((err) => {
            console.log("Erro ao se conectar "+err)
        })

    // Public
        app.use(express.static(path.join(__dirname,"public")))

    //Rotas
        
        app.get('/', (req,res) => {
            Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens) => {
                res.render("index", {postagens: postagens})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/404")
            })
        })

        app.get('/postagem/:slug', (req,res) => {
            Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
                if(postagem) {
                    res.render("postagem/index", {postagem: postagem})
                }else{
                    req.flash("error_msg", "Esta postagem não existe")
                    res.redirect("/")
                }
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/")
            })
        })

       app.get('/categorias', (req,res) => {
        Categoria.find().lean().then((categorias) => {
            console
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro Interno ao listar as categorias !")
            res.redirect("/")
        })
       })


       app.get("/categorias/:slug", (req,res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                   Postagem.find({categoria: categoria._id}).then((postagens) => {
                        res.render("categorias/postagens", {postagens: postagens, categoria: categoria})

                   }).catch((err) => {
                    req.flash("Houve um erro ao listar os posts!")
                    res.redirect("/")
                   })     

            }else{
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect("/")
            }

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao acessar os Posts!")
            res.redirect("/")
        })
       })


        app.get("/404", (req,res) => {
            res.send("Erro 404!!!")
        })
        app.use('/admin', admin)
        app.use('/usuarios', usuarios)
//Porta Principal
const PORT = 3000
app.listen(PORT,() => {
    console.log("Servidor Rodando!")
})
