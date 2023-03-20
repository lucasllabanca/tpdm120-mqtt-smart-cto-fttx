var mqtt = require('mqtt');

const servidorMqtt = "demo.thingsboard.io";
const token = "tXZOmZfuot3NZzF1Keln";

console.log('Conectando dispositivo ao servidor MQTT');
var clienteMqtt  = mqtt.connect('mqtt://'+ servidorMqtt, { username: token });

clienteMqtt.on('connect', function () {
    console.log('Cliente conectado ao servidor MQTT!');

    //publicar dados dos clientes a cada 10 segundos
    setInterval(publicarDadosClientes, 10000);
});

function publicarDadosClientes() {
    var dadosClientes = obterDadosClientes();
    clienteMqtt.publish('smart/cto/fttx/v1/telemetria/clientes', JSON.stringify(dadosClientes));
}

function obterDadosClientes() {
    
    const dados = [
        {
            codigo: 1,
            cliente: "João da Silva",
            plano: "450MB",
            download: 425.52,
            upload: 175.25,
            status: "Conectado"
        }
    ];

    return dados;
}
