const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const PAGE_ACCESS_TOKEN = 'EAAUMTIdYPQgBAIp5keHC0wwUDaEX5EpI4IyMmEeFsHk3H8ZCTRh5C8SvHBvozrAREfH1ZAZANdm0LISZC467R7XBCYc9uAFPtwbnAugnfKnYwr7G0hAuSMMBKOGv3QFPRtvwO2q2vgOL14a4WLBx5S75iLPFZBBRSez1iCSXRlgZDZD'

var app=express()
app.use(bodyParser.json())

app.listen(process.env.PORT || 3000,null,()=>{
    console.log("Escuchando en el puerto 80")
})

app.get('/',(req,res)=>{
    res.status(200).send('Servidor para chat de facebook, autor, Esteban G')
})

app.get('/webhook',(req,res)=>{
    console.log(req.query['hub.challenge'])
    res.status(200).send(req.query['hub.challenge'])
})
app.post('/webhook',(req,res)=>{
    let data = req.body
    data.entry.forEach(function(entrada) {
        
        entrada.messaging.forEach((event)=>{
            if(event.message){
                mensajeRecibido(event);
            }
        },this)

    }, this);
    res.status(200).send(req.query['hub.challenge'])
})

function mensajeRecibido(event){
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:", 
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText) {

        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
        switch (messageText) {
        case 'generic':
            sendGenericMessage(senderID);
            break;

        default:
            sendTextMessage(senderID, messageText);
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}

function invertir(cadena) {
  var x = cadena.length;
  var cadenaInvertida = "";
 
  while (x>=0) {
    cadenaInvertida = cadenaInvertida + cadena.charAt(x);
    x--;
  }
  return cadenaInvertida;
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: ":p "+invertir(messageText)
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
     /* console.error("Unable to send message.");
      console.error(response);
      console.error(error);*/
    }
  });  
}