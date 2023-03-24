const mqtt = require("mqtt");
const configuracao = require('config');

//Configuracao
const servidorMqtt = configuracao.get('servidorMqtt');
const topicosTelemetria = configuracao.get('topicosTelemetria');
const topicoControle = configuracao.get('topicoControle');
const temperaturaMaxima = configuracao.get('temperaturaMaxima');
const temperaturaMinima = configuracao.get('temperaturaMinima');
const umidadeMaxima = configuracao.get('umidadeMaxima');
const umidadeMinima = configuracao.get('umidadeMinima');

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

function processarMensagensCtos(mensagem) {

    const codigoCto = mensagem.codigoCto;
    const temperatura = parseInt(mensagem.temperatura.replace('Cº', ''));
    const umidade = parseInt(mensagem.umidade.replace('%', ''));
    const statusSensorRuptura = mensagem.statusSensorRuptura;
    
    var temperaturaOk = true;
    var umidadeOk = true;

    temperaturaOk = verificarTemperatura(codigoCto, temperatura);

    if (temperaturaOk)
        umidadeOk = verificarUmidade(codigoCto, umidade);
}

function verificarTemperatura(codigoCto, temperatura) {
    if (temperatura < temperaturaMinima || temperatura > temperaturaMaxima) {
        publicarMensagem(topicoControle + codigoCto, {
            comando: "desligarCto",
            valor: `DESATIVADA PELA CENTRAL POR MOTIVO DE TEMPERATURA:  ${temperatura}Cº`
        });
        return false;
    }
    
    return true;
}

function verificarUmidade(codigoCto, umidade) {
    if (umidade < umidadeMinima || umidade > umidadeMaxima) {
        publicarMensagem(topicoControle + codigoCto, {
            comando: "desligarCto",
            valor: `DESATIVADA PELA CENTRAL POR MOTIVO DE UMIDADE:  ${umidade}%`
        });
        return false;
    }
    
    return true;
}

function publicarMensagem(topico, mensagem) {
    if (clienteMqtt.connected == true) {
        console.log('\n', mensagem);
        clienteMqtt.publish(topico, JSON.stringify(mensagem));
    }
    else {
        console.log('\n', `Cliente '${clienteId}' não conectado para publicar mensagem no tópico: ${topico}`);
    }
}
