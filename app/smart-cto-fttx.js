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
const topicoTelemetriaClientes = topicosTelemetria[0] + '/' + codigoCto;
const topicoTelemetriaCto = topicosTelemetria[1] + '/' + codigoCto;
const topicoSubscriptions = topicosTelemetria[2] + '/' + codigoCto;

//Tópico para receber mensagens de comando da central de controle
const topicoCentralControle = topicoControle + '/' + codigoCto;

//Propriedades Operação CTO
var clientes = [];
var statusRedeEletrica = true;
var statusFibraOtica = true;
var descricaoStatusCto = 'CTO LIGADA COM PORTA FECHADA';
var ctoLigada = true;
var temperatura = 20;
var umidade = 45;
var cargaBateria = 100;
var sensorRupturaAtivado = false;
const quantidadeClientes = obterInteiroAleatorio(1, 4);

const planos = [
    { codigo: 1, plano: '300MB', taxaDownloadMin: 30, taxaDownloadMax: 300, taxaUploadMin: 15, taxaUploadMax: 150 },
    { codigo: 2, plano: '400MB', taxaDownloadMin: 40, taxaDownloadMax: 400, taxaUploadMin: 20, taxaUploadMax: 200 },
    { codigo: 3, plano: '500MB', taxaDownloadMin: 50, taxaDownloadMax: 500, taxaUploadMin: 25, taxaUploadMax: 250 },
    { codigo: 4, plano: '1GB', taxaDownloadMin: 100, taxaDownloadMax: 1000, taxaUploadMin: 50, taxaUploadMax: 500 }
];

const clienteMqtt = mqtt.connect('mqtt://' + servidorMqtt, { clientId: clienteId });

initCto();
criarClientesCto(quantidadeClientes);

function initCto() {

    console.log('\n', `Iniciando dispositivo SmartCTOFTTx_${codigoCto}`);
    
    clienteMqtt.on('message', function(topico, mensagem) {

        if (!ctoLigada || !mensagem)
            return;

        console.log('\n', '--------------------------------------------------------------------------------------------------------------------------------------------------------------------');
        console.log('\n', `Mensagem recebida do tópico: ${topico}`);
        const objetoMensagem = JSON.parse(mensagem.toString());
        console.log('\n', objetoMensagem);

        processarMensagemRecebida(objetoMensagem);
    });
    
    clienteMqtt.on('connect', function () {
        console.log('\n', `Cliente '${clienteId}' conectado ao servidor MQTT: ${servidorMqtt}`);

        inscreverCtoCentralControle();
        setInterval(publicarTelemetriaCto, 10000);
        setInterval(publicarTelemetriaClientes, 10000);
    });
        
    clienteMqtt.on('error', function(erro) {
        console.log('\n', `Não foi possível conectar o cliente '${clienteId}' ao servidor MQTT: ${servidorMqtt}. Erro: ${erro}`);
        process.exit(1);
    });
    
    console.log('\n', `Inscrevendo cliente '${clienteId}' ao tópico de controle: ${topicoCentralControle}`);
    clienteMqtt.subscribe(topicoCentralControle);

}

function inscreverCtoCentralControle() {
    if (!ctoLigada)
        return;

    console.log('\n', '--------------------------------------------------------------------------------------------------------------------------------------------------------------------');
    console.log('\n', `Publicando subscrição da SmartCTOFTTx_${codigoCto} na Central de Controle pelo tópico: ${topicoSubscriptions}`)
    publicarMensagem(topicoSubscriptions, obterDadosCto())
}

function publicarTelemetriaCto(desligamento = false) {
    if (!ctoLigada)
        return;

    console.log('\n', '--------------------------------------------------------------------------------------------------------------------------------------------------------------------');
    console.log('\n', `Publicando telemetria da SmartCTOFTTx_${codigoCto} para a Central de Controle pelo tópico: ${topicoTelemetriaCto}`)
    publicarMensagem(topicoTelemetriaCto, obterTelemetriaCto(desligamento));
}
   
function publicarTelemetriaClientes() {
    if (!ctoLigada)
        return;

    console.log('\n', '--------------------------------------------------------------------------------------------------------------------------------------------------------------------');
    console.log('\n', `Publicando telemetria dos clientes da SmartCTOFTTx_${codigoCto} para a Central de Controle pelo tópico: ${topicoTelemetriaClientes}`)
    publicarMensagem(topicoTelemetriaClientes, obterTelemetriaClientes());
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

function processarMensagemRecebida(mensagem) {

    switch (mensagem.comando) {
        case "configurarCliente":
            configurarCliente(mensagem.valor);
            break;

        case "desligarCto":
            desligarCto(mensagem.valor);
            break;

        case "alterarSensorRuptura":
            if (typeof mensagem.valor == 'boolean') {
                sensorRupturaAtivado = mensagem.valor;
                desligarCto('DESLIGADA POR SENSOR DE RUPTURA ATIVADO, PROVÁVEL VANDALISMO OU ROUBO');
            }

            break;

        case "alterarTemperatura":
            if (typeof mensagem.valor == 'number')
                temperatura = mensagem.valor;
            break;

        case "alterarUmidade":
            if (typeof mensagem.valor == 'number') {
                if (mensagem.valor >= 0 && mensagem.valor <= 100)
                    umidade = mensagem.valor;
            }

            break;

        case "alterarStatusRedeEletrica":
            if (typeof mensagem.valor == 'boolean')
                statusRedeEletrica = mensagem.valor;

            break;

        case "alterarStatusFibraOtica":
            if (typeof mensagem.valor == 'boolean')
                statusFibraOtica = mensagem.valor;

            break;

        default:
            return;
    }
}

function configurarCliente(configuracao) {
    var plano = obterPlano(configuracao.codigoPlano);

    if (!plano)
        return;

    var cliente = clientes.find(cliente => cliente.codigo == configuracao.codigo);
    
    if (cliente) {
        console.log('Cliente encontrado');
        cliente.codigoPlano = plano.codigo;
        cliente.plano = plano.plano;
    }
}

function desligarCto(motivo) {
    descricaoStatusCto = motivo;
    publicarTelemetriaCto(desligamento = true);

    ctoLigada = false;
    
    setTimeout(() => {
        process.exit(1);
    }, 5000);
    
}

function obterDadosCto() {
    const dados = {
        codigoCto: codigoCto,
        quantidadeClientes: quantidadeClientes,
        topicoTelemetriaClientes: topicoTelemetriaClientes,
        topicoTelemetriaCto: topicoTelemetriaCto,
        topicoControleCto: topicoCentralControle
    }

    return dados;
}

function obterTelemetriaCto(desligamento) {

    if (!desligamento) {
        temperatura += obterInteiroAleatorio(-1, 1);
        umidade += obterInteiroAleatorio(-1, 1);
    
        if (!statusRedeEletrica) {
            
            cargaBateria -= 1;

            if (cargaBateria <= 0) {
                desligarCto('DESLIGADA POR FALTA DE REDE ELÉTRICA E BATERIA INTERNA ESGOTADA');
                return;
            }
        }
    }

    var telemetriaCto = {
        codigoCto: codigoCto,
        quantidadeClientes: quantidadeClientes,
        quantidadeClientesConectados: clientes.filter(cliente => cliente.conectado).length,
        temperatura: temperatura + 'Cº',
        umidade: umidade + '%',
        statusSensorRuptura: sensorRupturaAtivado,
        cargaBateria: cargaBateria,
        statusRedeEletrica: statusRedeEletrica,
        statusFibraOtica: statusFibraOtica,
        statusConexaoMovel: statusFibraOtica ? false : true,
        conexaoRede: statusFibraOtica ? 'FIBRA ÓPTICA' : 'CHIP SIM 5G TIM',
        statusCto: descricaoStatusCto
    }

    return telemetriaCto;
}

function obterTelemetriaClientes() {
    var telemetriaClientes = [];
    
    clientes.forEach(cliente => {
        const conectado = obterInteiroAleatorio(0, 1) === 0;
        const plano = obterPlano(cliente.codigoPlano);
        const dados = preencherDadosNovoCliente(cliente.codigo, plano, conectado);
        dados.download = conectado ? obterInteiroAleatorio(plano.taxaDownloadMin, plano.taxaDownloadMax) : 0;
        dados.upload = conectado ? obterInteiroAleatorio(plano.taxaUploadMin, plano.taxaUploadMax) : 0;
        telemetriaClientes.push(dados);
    });

    clientes = telemetriaClientes;

    return telemetriaClientes; 
}

function criarClientesCto(quantidade) {
    for (i = 0; i < quantidade; i++) {
        const cliente = obterNovoCliente();
        clientes.push(cliente);
    }
}

function obterPlano(codigo) {
    return planos.find(plano => plano.codigo == codigo);
}

function obterNovoCliente() {

    const codigo = obterCodigoAleatorio();
    const codigoPlano = obterInteiroAleatorio(1, 4);
    const plano = obterPlano(codigoPlano);
    const conectado = obterInteiroAleatorio(0, 1) === 1;
    const dados = preencherDadosNovoCliente(codigo, plano, conectado);
    return dados;
}

function preencherDadosNovoCliente(codigo, plano, conectado) {
    return {
        codigo: codigo,
        codigoCto: codigoCto,
        cliente: `Cliente ${codigo}`,
        codigoPlano: plano.codigo,
        plano: plano.plano,
        download: plano.taxaDownloadMax,
        upload: plano.taxaUploadMax,
        conectado: conectado,
        status: conectado ? "CONECTADO" : "NÃO CONECTADO"
    };
}

function obterInteiroAleatorio(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function obterCodigoAleatorio() {
    return Math.random().toString(16).slice(3);
}
