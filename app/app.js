import mqtt from "mqtt";

const servidorMqtt = "test.mosquitto.org";
const clienteId = 'SmartCTOFTTx-Client';
const topicos = ["smart/cto/fttx/clients/data/#", "smart/cto/fttx/temperatura/#", "smart/cto/fttx/umidade/#"];

console.log('Iniciando aplicação MQTT');

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
topicos.forEach((topico, indice) => console.log(`\t`, `${indice} - Tópico: ${topico}`));
clienteMqtt.subscribe(topicos);

setInterval(publicarDadosClientes, 10000);
   
function publicarDadosClientes() {
    var dadosClientes = obterDadosClientes();
    publicarMensagem('smart/cto/fttx/clients/data/1', JSON.stringify(dadosClientes));
}

function publicarMensagem(topico, mensagem) {
    if (clienteMqtt.connected == true) {
        console.log(`Publicando mensagem no tópico: ${topico}`);
        console.log('\t', `Mensagem: ${mensagem}`);
        clienteMqtt.publish(topico, mensagem);
    }
    else {
        console.log(`Cliente '${clienteId}' não conectado para publicar mensagem no tópico: ${topico}`);
    }
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
