var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var Request = require("request");
var app = express();
var ObjectId = require('mongodb').ObjectID;

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://admin:a1234a@ds211096.mlab.com:11096/starwars";

InserePlaneta = function(NOME, CLIMA, TERRENO){
    try
    {
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
            if (err){
                throw err;
            }
            var dbo = db.db("starwars");
            var myobj = { nome: NOME, clima: CLIMA, terreno: TERRENO};

            dbo.collection("planetas").insertOne(myobj, function(err, res) {
                if (err) {
                    throw err;
                }

                db.close();
                return true;
            });
        });
        return true;
    }
    catch(e)
    {
        return false;        
    }
}

app.use(bodyParser.json());
//app.use(cors());

app.post('/InserirPlaneta', function(request, response){

    try{
        console.log(request.body);      // your JSON

        var nome = request.body.NOME;
        var clima = request.body.CLIMA;
        var terreno = request.body.TERRENO;

        console.log("REQ: " + request);
        console.log("nome: " + nome);
        console.log("clima: " + clima);
        console.log("terreno: " + terreno);

        PlanetaJaExiste(nome, function(result) {

            if(!result)
            {
                if(InserePlaneta(nome, clima, terreno))
                {
                    console.log("INSERIU");
                    response.sendStatus(200);
                }
                else
                {
                    console.log("NÃO INSERIU");
                    response.sendStatus(400);        
                }
            }
            else
            {
                console.log("PLANETA JÁ EXISTE");
                response.sendStatus(400);    
            }
         });
    }
    catch(e)
    {
        console.log(e);
        response.sendStatus(400);
    }
});

function PlanetaJaExiste(NOME, callback)
{
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                   
        if (err){
            throw err;
        }
        var dbo = db.db("starwars");

        dbo.collection('planetas').find({ "nome": NOME }).toArray(function(e, d) {
            if(!d)
            {
                throw new Error('No record found.');
            }

            if(parseInt(d.length) > 0)
            {
                console.log("PLANETA JÁ CADASTRADO");
                callback(true);
            }
            else
            {
                console.log("PLANETA NÃO CADASTRADO");
                callback(false);
            }
        });
    });
}

app.post('/ListarPlanetas', function(request, response){
    try
    {
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        
            if (err){
                throw err;
            }
            var dbo = db.db("starwars");

            dbo.collection('planetas').find().toArray(function(e, d) {
                console.log(d.length);
                console.log(d);
                response.send(d);
                db.close();
            });
        });
    }
    catch(e)
    {
        return "erro";        
    }
});

app.post('/ListarPlanetaPorNome', function(request, response){
    try
    {
        var nome = request.body.NOME;
        console.log("nome: " + nome);

        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        
            if (err){
                throw err;
            }
            var dbo = db.db("starwars");

            dbo.collection('planetas').findOne({'nome': nome})
            .then(function(doc) {
                   if(!doc)
                       throw new Error('No record found.');
                 console.log(doc);//else case
                 response.send(doc);
             });
        });
    }
    catch(e)
    {
        return "erro";        
    }
});

app.post('/ListarPlanetaPorID', function(request, response){
    try
    {
        var id = request.body.ID;
        console.log("id: " + id);

        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        
            if (err){
                throw err;
            }
            var dbo = db.db("starwars");

            dbo.collection('planetas').findOne({"_id": new ObjectId(id)})
            .then(function(doc) {
                   if(!doc)
                       throw new Error('No record found.');

                 console.log(doc);//else case
                 response.send(doc);
             });
        });
    }
    catch(e)
    {
        return "erro";        
    }
});

app.post('/ListaQtdFilmPorNome', function(request, res){

    try{
        var returnAPI = "";
        console.log(request.body);      // your JSON

        var nome = request.body.NOME;

        console.log("REQ: " + request);
        console.log("nome: " + nome);

        Request.get("https://swapi.co/api/planets/?search="+ nome +"", (error, response, body) => {
            if(error) {
                return console.dir(error);
            }
            returnAPI = JSON.parse(body);
            console.dir(returnAPI.results[0].films.length);
            res.send(returnAPI.results[0].films.length.toString());
        });
    }
    catch(e)
    {
        console.log(e);
        res.sendStatus(400);
    }
});

app.post('/RemoverPlaneta', function(request, response){
    try
    {
        var id = request.body.ID;
        console.log("id: " + id);

        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        
            if (err){
                throw err;
            }
            var dbo = db.db("starwars");

            dbo.collection('planetas').deleteOne({"_id": new ObjectId(id)})
            .then(function(doc) {
                if (err) throw err;
                console.log(doc.result.n + " document(s) deleted");
                db.close();
                response.send(true);
             });
        });
        return false;
    }
    catch(e)
    {
        return false;        
    }
});

app.listen(3000);


console.log('Servidor iniciado!');