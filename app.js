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
        app.engine('handlebars', handlebars.engine({defaultlayout: 'main'}))
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
        app.use('/admin', admin)
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

        app.get("/admin/login/", (req,res) => {
            res.send('aqui ficará o Login')
        })

        app.get("/admin/Registro/", (req,res) => {
            res.send('aqui ficará o Cadastro')
        })


        app.get("/404", (req,res) => {
            res.send("Erro 404!!!")
        })
        
//Porta Principal
const PORT = 3000
app.listen(PORT,() => {
    console.log("Servidor Rodando!")
})
