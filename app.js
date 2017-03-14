const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const APP_TOKEN = ''

var app = express()

app.use(bodyParser.json())

var PORT = process.env.PORT || 3000;

app.listen(PORT,function(){
	console.log('Server listen localhost:3000')
})

app.get('/',function(req, res){
	res.send('Corriendo con http://ngrok.com')
})


//Get para verificacion de token 

app.get('/webhook',function(req, res){

	if(req.query['hub.verify_token'] === 'holamundo123'){
		res.send(req.query['hub.challenge'])
	}else{
		console.error("Failed validation. Make sure the validation tokens match.");
    	res.sendStatus(403);  
	}
})

//Aqui se reciben los mensajes desde messenger

app.post('/webhook',function(req, res){

	var data = req.body

	if(data.object == 'page'){

		data.entry.forEach(function(entry){

			entry.messaging.forEach(function(event){

				if(event.message){

					//enviamos el mensaje a la funcion
					getMessage(event)

				} else{
					console.log("Webhook received unknown event: ", event);
				}
			})
		})
	}
	res.sendStatus(200)
})

//Obtenemos el mensaje
function getMessage(event){

	var senderID = event.sender.id;
	var messageText = event.message.text;

	evaluarMensaje(senderID, messageText)
	
	console.log(messageText);
}

function evaluarMensaje(senderID, messageText){


/*****EXPRESIONES REGULARES PARA MENSAJES RECIBIDOS******/
	var mensaje = '';

	var saludo = /^[H|h]+ola|ola/;

	var animo = /^[Q|q]+uien eres??/;

	var queHacer = /^[Q|q]+ue haces?/;

	var dondeVives = /^[D|d]+onde vives?/;

	var likeMusica = /^[Q|q]+ue tipo de musica te gusta?/;

	var cancionFav = /^[C|c]+ual es tu cancion favorita?/;

	var recomienda = /^[R|r]+ecomiendame una canción/;

	var instrumento = /^[Q|q]+ue instrumento te gusta?/;

	var recoPelicula =/^[R|r]+ecomiendame una pelicula/;

	var enviarMeme = /^[E|e]+nviame un meme/;

/*****FIN EXPRESIONES REGULARES*****/

	if(saludo.test(messageText)){

		mensaje = randomSaludo();
	}
	else if(animo.test(messageText)){

		mensaje = randomQuienSoy();
	}
	else if(queHacer.test(messageText)){
		mensaje = 'Escuchando musica';
	}
	else if(dondeVives.test(messageText)){
		mensaje = 'Estoy en la nube';
	}
	else if(likeMusica.test(messageText)){
		mensaje = 'El rock en español es bueno';
	}
	else if(cancionFav.test(messageText)){
		mensaje = 'Todas son buenas';
	}
	else if(recomienda.test(messageText)){
		mensaje = 'Esta esta buena: \nhttps://www.youtube.com/watch?v=M6eYKMn6gnA';
	}
	else if(instrumento.test(messageText)){
		mensaje = 'La guitarra esta bien';
	}
	else if(recoPelicula.test(messageText)){
		mensaje = 'Aún no has visto Logan? \nhttps://www.youtube.com/watch?v=DekuSxJgpbY';
	}
	else if(enviarMeme.test(messageText)){

		enviarMemeImg(senderID);
	}
	else{
		mensaje = RandomNoEntiendo();
	}

	enviarMensajeTexto(senderID, mensaje)
}

/*****************RESPUESTAS RANDOM FUNCIONES********************/

function randomSaludo(){

	var arraySaludo = ["Hola ", "Que onda ", 'Hey!'];

	return arraySaludo[Math.floor(Math.random() * 2)];
}

function randomQuienSoy(){

	var arrayYoSoy = [	'Soy un alien', 
						'Soy un bot', 
						'No tengo idea'];

	return arrayYoSoy[Math.floor(Math.random()*3)];
}

function randomQueHaces(){
	var arrayQueHaces = [	'Escuchando musica',
							'Tocando Guitarra |m|',
							'Leyendo',
							'Aqui respondiendote :)'];
	return arrayQueHaces[Math.floor(Math.random()*4)];
}

function RandomNoEntiendo(){

	var arrayNoEntiendo = [	'Aun no estoy programado para responder eso :(', 
							'Disculpa, no te entiendo', 
							'vuelve a intentarlo', 
							'¿Que?',
							'Se mas especifico, no soy perfecto, aun no.'];

	return arrayNoEntiendo[Math.floor(Math.random() * 5)]
}


/*****************************************************************/

/************Busca nombre de usuario ****************************/

function buscarPerfil(senderID){
	var nombre;
	var idPerfil = senderID;
	var url = 'https://graph.facebook.com/v2.6/'+idPerfil+'?fields=first_name&access_token='+APP_TOKEN;

	request({
    url: url,
    json: true
		}, function (error, response, body) {

		    if (!error && response.statusCode === 200) {
		        //console.log(body) // Print the json response
		        nombre = body.first_name;
		        //randomSaludo(nombre);
		    }

		})


}

/***************************************************************/

//enviar meme

function enviarMemeImg(senderID){
	var messageData = {
		recipient : {
			id: senderID
		},
		message:{
			attachment:{
				type: "image",
				payload: {
					url: 'https://scontent-dft4-1.xx.fbcdn.net/v/t1.0-0/s480x480/16939494_10210909086675857_8053477805458907118_n.jpg?oh=daf7b7af78bf4bd6adfc3e0bf683988b&oe=59385CFC'
				}

			}
		}
	}

	callSendAPI(messageData)
}
//Se envia mensaje a api messenger

function callSendAPI(messageData){
	//api de facebook
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token: APP_TOKEN},
		method: 'POST',
		json: messageData
	},function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	      var recipientId = body.recipient_id;
	      var messageId = body.message_id;

	      //console.log("Successfully sent generic message with id %s to recipient %s", 
	        //messageId, recipientId);
	    } else {
	     /* console.error("Unable to send message.");
	      console.error(response);
	      console.error(error);*/
	    }
	  });  
}
