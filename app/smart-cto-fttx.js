const mqtt = require("mqtt");

//Configuracao
const configuracao = require('config');
const servidorMqtt = configuracao.get('servidorMqtt');
const prefixoClienteMqtt = configuracao.get('prefixoClienteIdMqtt');
const topicosTelemetria = configuracao.get('topicosTelemetria');
const topicoControle = configuracao.get('topicoControle');

//Código único dispositivo e cliente MQTT
const codigoCto = Math.random().toString(16).slice(3);
const clienteId = prefixoClienteMqtt + codigoCto;

//Tópicos únicos para envio de telemetria de cada dispositivo
const topicoDadosClientes = topicosTelemetria[0] + '/' + codigoCto;
const topicoTemperatura = topicosTelemetria[1] + '/' + codigoCto;
const topicoUmidade = topicosTelemetria[2] + '/' + codigoCto;
const topicoSubscriptions = topicosTelemetria[3] + '/' + codigoCto;

//Tópico para receber mensagens de comando da central de controle
const topicoCentralControle = topicoControle + '/' + codigoCto;

console.log('\n', `Iniciando dispositivo SmartCTOFTTx: ${codigoCto}`);

var clienteMqtt = mqtt.connect('mqtt://' + servidorMqtt, { clientId: clienteId });

clienteMqtt.on('message', function(topico, mensagem) {
    console.log('\n', `Mensagem recebida do tópico: ${topico}`);
    console.log('\t', `Mensagem: ${mensagem}`);
});
  
clienteMqtt.on('connect', function () {
    console.log('\n', `Cliente '${clienteId}' conectado ao servidor MQTT: ${servidorMqtt}`, '\n');
});
    
clienteMqtt.on('error', function(erro) {
    console.log('\n', `Não foi possível conectar o cliente '${clienteId}' ao servidor MQTT: ${servidorMqtt}. Erro: ${erro}`, '\n');
    process.exit(1);
});

console.log('\n', `Inscrevendo cliente '${clienteId}' ao tópico de controle: ${topicoCentralControle}`);
clienteMqtt.subscribe(topicoCentralControle);

setInterval(publicarDadosClientes, 10000);
   
function publicarDadosClientes() {
    var dadosClientes = obterDadosClientes();
    publicarMensagem(topicoDadosClientes, JSON.stringify(dadosClientes));
}

function publicarMensagem(topico, mensagem) {
    if (clienteMqtt.connected == true) {
        console.log('\n', `Publicando mensagem no tópico: ${topico}`);
        console.log('\t', `Mensagem: ${mensagem}`);
        clienteMqtt.publish(topico, mensagem);
    }
    else {
        console.log('\n', `Cliente '${clienteId}' não conectado para publicar mensagem no tópico: ${topico}`);
    }
}

function obterDadosClientes() {

    const dados = [
        {
            codigo: codigoCto,
            cliente: "João da Silva",
            plano: "450MB",
            download: 425.52,
            upload: 175.25,
            status: "Conectado"
        }
    ];

    return dados;
}
