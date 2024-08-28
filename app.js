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

//Porta Principal
const PORT = 3000
app.listen(PORT,() => {
    console.log("Servidor Rodando!")
})
