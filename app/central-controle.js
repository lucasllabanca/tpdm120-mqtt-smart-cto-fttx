const mqtt = require("mqtt");
const configuracao = require('config');

//Configuracao
const servidorMqtt = configuracao.get('servidorMqtt');
const topicosTelemetria = configuracao.get('topicosTelemetria');
const topicoControle = configuracao.get('topicoControle');

//Código único dispositivo e cliente MQTT
const codigoCentralControle = Math.random().toString(16).slice(3);
const clienteId = 'CentralControleClient_' + codigoCentralControle;

console.log('Iniciando Central de Controle MQTT');

var clienteMqtt = mqtt.connect('mqtt://' + servidorMqtt, { clientId: clienteId });

clienteMqtt.on('message', function(topico, mensagem) {
    console.log(`Mensagem recebida do tópico: ${topico}`);
    console.log('\t', `Mensagem: ${mensagem}`);
});
  
clienteMqtt.on('connect', function () {
    console.log(`Cliente '${clienteId}' conectado ao servidor MQTT: ${servidorMqtt}`, '\n');
});
    
clienteMqtt.on('error', function(erro) {
    console.log(`Não foi possível conectar o cliente '${clienteId}' ao servidor MQTT: ${servidorMqtt}. Erro: ${erro}`, '\n');
    process.exit(1);
});

console.log(`Inscrevendo cliente '${clienteId}' ao(s) tópico(s):`);
topicosTelemetria.forEach((topico, indice) => {
    console.log(`\t`, `${indice} - Tópico: ${topico}/#`);
    clienteMqtt.subscribe(topico + '/#');
});
