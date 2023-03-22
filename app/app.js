var mqtt = require('mqtt');

const servidorMqtt = "test.mosquitto.org";
const clienteCentralControle = 'SmartCTOFTTx-Client';

var topicos = ["smart/cto/fttx/#/clients/data", "smart/cto/fttx/#/temperature", "smart/cto/fttx/#/clients/umidade"];

console.log('Iniciando aplicação MQTT');

InserirSeparadorLogs();

console.log(`Conectando dispositivo ao servidor MQTT: ${servidorMqtt}`);
var clienteMqtt = mqtt.connect(`mqtt://${servidorMqtt}`, { clientId: clienteCentralControle });

InserirSeparadorLogs();

clienteMqtt.on('connect', function () {
    console.log(`Cliente conectado ao servidor MQTT: ${servidorMqtt}`);
});

clienteMqtt.on('error', function(error) {
    console.log(`Não foi possível conectar ao servidor MQTT: ${servidorMqtt}. Erro: ${error}`);
    process.exit(1);
});

InserirSeparadorLogs();

console.log(`Inscrevendo cliente '${clienteCentralControle}' da central de controle no tópicos:`);
topicos.forEach((topico, indice) => console.log(`    ${indice} - Tópico: ${topico}`));
clienteMqtt.subscribe(topicos);

InserirSeparadorLogs();

clienteMqtt.on('message', function(topic, message) {
    console.log("message is: " + message);
    console.log("topic is: " + topic);
});

function InserirSeparadorLogs() {
    console.log();
    console.log('------------------------------------------------------------------------------------------------------');
    console.log();
}
