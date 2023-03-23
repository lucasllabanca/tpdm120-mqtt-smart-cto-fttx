const mqtt = require("mqtt");
const configuracao = require('config');

//Configuracao
const servidorMqtt = configuracao.get('servidorMqtt');
const topicosTelemetria = configuracao.get('topicosTelemetria');
const topicoControle = configuracao.get('topicoControle');

//Código único dispositivo e cliente MQTT
const codigoCentralControle = Math.random().toString(16).slice(3);
const clienteId = 'CentralControleClient_' + codigoCentralControle;

console.log('\n', 'Iniciando Central de Controle MQTT');

const clienteMqtt = mqtt.connect('mqtt://' + servidorMqtt, { clientId: clienteId });

clienteMqtt.on('message', function(topico, mensagem) {

    if (!mensagem)
        return;

    console.log('\n', '-------------------------------------------------------------------------------------------------------------');
    console.log('\n', `Mensagem recebida do tópico: ${topico}`);
    const objetoMensagem = JSON.parse(mensagem.toString());
    console.log('\n', objetoMensagem);
});
  
clienteMqtt.on('connect', function () {
    console.log('\n', `Cliente '${clienteId}' conectado ao servidor MQTT: ${servidorMqtt}`, '\n');
});
    
clienteMqtt.on('error', function(erro) {
    console.log('\n', `Não foi possível conectar o cliente '${clienteId}' ao servidor MQTT: ${servidorMqtt}. Erro: ${erro}`);
    process.exit(1);
});

console.log('\n', `Inscrevendo cliente '${clienteId}' ao(s) tópico(s):`);
topicosTelemetria.forEach((topico, indice) => {
    console.log(`\t`, `${indice} - Tópico: ${topico}/#`);
    clienteMqtt.subscribe(topico + '/#');
});
