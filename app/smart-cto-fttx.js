const mqtt = require("mqtt");

//Configuracao
const configuracao = require('config');
const servidorMqtt = configuracao.get('servidorMqtt');
const prefixoClienteMqtt = configuracao.get('prefixoClienteIdMqtt');
const topicosTelemetria = configuracao.get('topicosTelemetria');
const topicoControle = configuracao.get('topicoControle');

//Código único dispositivo e cliente MQTT
const codigoCto = obterCodigoAleatorio();
const clienteId = prefixoClienteMqtt + codigoCto;

//Tópicos únicos para envio de telemetria de cada dispositivo
const topicoDadosClientes = topicosTelemetria[0] + '/' + codigoCto;
const topicoTemperatura = topicosTelemetria[1] + '/' + codigoCto;
const topicoUmidade = topicosTelemetria[2] + '/' + codigoCto;
const topicoSubscriptions = topicosTelemetria[3] + '/' + codigoCto;

//Tópico para receber mensagens de comando da central de controle
const topicoCentralControle = topicoControle + '/' + codigoCto;

const quantidadeClientes = obterInteiroAleatorio(1, 16);

const clienteMqtt = mqtt.connect('mqtt://' + servidorMqtt, { clientId: clienteId });

initCto();
criarPlanos();
criarClientesCto();

function initCto() {
    console.log('\n', `Iniciando dispositivo SmartCTOFTTx_${codigoCto}`);
    
    clienteMqtt.on('message', function(topico, mensagem) {
        console.log('\n', `Mensagem recebida do tópico: ${topico}`);
        console.log('\t', `Mensagem: ${mensagem}`);
    });
    
    clienteMqtt.on('connect', function () {
        console.log('\n', `Cliente '${clienteId}' conectado ao servidor MQTT: ${servidorMqtt}`, '\n');

        inscreverCtoCentralControle();

        setInterval(publicarTelemetriaClientes, 10000);

    });
        
    clienteMqtt.on('error', function(erro) {
        console.log('\n', `Não foi possível conectar o cliente '${clienteId}' ao servidor MQTT: ${servidorMqtt}. Erro: ${erro}`, '\n');
        process.exit(1);
    });
    
    console.log('\n', `Inscrevendo cliente '${clienteId}' ao tópico de controle: ${topicoCentralControle}`);
    clienteMqtt.subscribe(topicoCentralControle);

}

function inscreverCtoCentralControle() {
    console.log('\n', `Inscrevendo SmartCTOFTTx_${codigoCto} na Central de Controle`)
    publicarMensagem(topicoSubscriptions, obterDadosCto())
}
   
function publicarTelemetriaClientes() {
    console.log('\n', `Publicando telemetria dos clientes da SmartCTOFTTx_${codigoCto} para a Central de Controle`)
    publicarMensagem(topicoDadosClientes, obterTelemetriaClientes());
}

function publicarMensagem(topico, mensagem) {
    if (clienteMqtt.connected == true) {
        console.log('\n', `Publicando mensagem no tópico: ${topico}`);
        console.log('\n', `Mensagem:`);
        console.log('\t', mensagem);
        clienteMqtt.publish(topico, mensagem);
    }
    else {
        console.log('\n', `Cliente '${clienteId}' não conectado para publicar mensagem no tópico: ${topico}`);
    }
}

function obterDadosCto() {
    const dados = {
        codigoCto: codigoCto,
        quantidadeClientes: quantidadeClientes,
        topicoDadosClientes: topicoDadosClientes,
        topicoTemperatura: topicoTemperatura,
        topicoUmidade: topicoUmidade
    }

    return JSON.stringify(dados);
}

function obterTelemetriaClientes() {
    var telemetriaClientes = [];

    clientes.forEach(cliente => {
        const conectado = obterInteiroAleatorio(0, 1) === 0;
        const dados = preencherDadosNovoCliente(cliente.codigo, cliente.plano, conectado);
        dados.download = obterInteiroAleatorio(cliente.plano.taxaDownloadMin, cliente.plano.taxaDownloadMax);
        dados.upload = obterInteiroAleatorio(cliente.plano.taxaUploadMin, cliente.plano.taxaUploadMax);
        telemetriaClientes.push(dados);
    });

    return JSON.stringify(telemetriaClientes); 
}

var clientes = [];
var planos = [];

function criarClientesCto() {
    for (i = 0; i < quantidadeClientes; i++) {
        const cliente = obterNovoCliente();
        clientes.push(cliente);
    }
}

function criarPlanos() {
    planos.push({ codigo: 1, plano: '300MB', taxaDownloadMin: 30, taxaDownloadMax: 300, taxaUploadMin: 15, taxaUploadMax: 150 });
    planos.push({ codigo: 2, plano: '400MB', taxaDownloadMin: 40, taxaDownloadMax: 400, taxaUploadMin: 20, taxaUploadMax: 200 });
    planos.push({ codigo: 3, plano: '500MB', taxaDownloadMin: 50, taxaDownloadMax: 500, taxaUploadMin: 25, taxaUploadMax: 250 });
    planos.push({ codigo: 4, plano: '1GB', taxaDownloadMin: 100, taxaDownloadMax: 1000, taxaUploadMin: 50, taxaUploadMax: 500 });
}

function obterNovoCliente() {

    const codigo = obterCodigoAleatorio();
    const codigoPlano = obterInteiroAleatorio(1, 4);
    const plano = planos.find(plano => plano.codigo = codigoPlano);
    const conectado = obterInteiroAleatorio(0, 1) === 0;
    const dados = preencherDadosNovoCliente(codigo, plano, conectado);
    return dados;
}

function preencherDadosNovoCliente(codigo, plano, conectado) {
    return [
        {
            codigo: codigo,
            codigoCto: codigoCto,
            cliente: `Cliente ${codigo}`,
            plano: plano.plano,
            download: plano.taxaDownloadMax,
            upload: plano.taxaUploadMax,
            status: conectado ? "CONECTADO" : "NÃO CONECTADO"
        }
    ];
}

function obterInteiroAleatorio(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function obterCodigoAleatorio() {
    Math.random().toString(16).slice(3);
}
