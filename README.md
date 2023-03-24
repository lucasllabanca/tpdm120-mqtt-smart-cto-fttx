# TP DM120 - Smart CTO FTTx com MQTT

## Trabalho Prático da Disciplina DM120 - Introdução e Desenvolvimento para IoT

**Servidor MQTT usado**
1. **test.mosquitto.org`**
***

**Tópicos de Telemetria das CTOs**
1. **smart/cto/fttx/clientes/{codigo-unico-cto}**
***Tópico onde as CTOs publicam as telemetrias dos clientes finais configurados nelas***
2. **smart/cto/fttx/telemetria/{codigo-unico-cto}** 
***Tópico onde as CTOs publicam as informações de telemetria dos sensores e de operação atuais delas***
3. **smart/cto/fttx/subscriptions/{codigo-unico-cto}**
***Tópico onde as CTOs registram uma única vez ao ligar, seu código único, quantidade de clientes, tópicos usados para envio de telemetria e tópico de controle usado para receber comandos***

## Comandos possíveis que podem ser enviados às CTOs pelo tópico de controle 'smart/cto/fttx/controle/{codigo-unico-cto}'

**Alterar plano de dados de qualquer cliente da CTO, passando o código único do cliente e o plano de internet como valor inteiro entre 1 e 4**
1. **codigo: 1, plano: '300MB', taxaDownloadMin: 30, taxaDownloadMax: 300, taxaUploadMin: 15, taxaUploadMax: 150**
2. **codigo: 2, plano: '400MB', taxaDownloadMin: 40, taxaDownloadMax: 400, taxaUploadMin: 20, taxaUploadMax: 200**
3. **codigo: 3, plano: '500MB', taxaDownloadMin: 50, taxaDownloadMax: 500, taxaUploadMin: 25, taxaUploadMax: 250**
4. **codigo: 4, plano: '1GB', taxaDownloadMin: 100, taxaDownloadMax: 1000, taxaUploadMin: 50, taxaUploadMax: 500**
```json
{
  "comando": "configurarCliente",
  "valor": {
        "codigo": "f091a160850d",
        "codigoPlano": 2
  }
}
```

*Desligar CTO informando um motivo qualquer* 
*Ex.:*
```json
{
  "comando": "desligarCto",
  "valor": "DESATIVADA PELA CENTRAL POR MOTIVOS DE SEGURANCA"
}
```

*Alterar o status do sensor de ruptura para ativado (true) ou desativado (false)*
*Ex.:*
```json
{
  "comando": "alterarSensorRuptura",
  "valor": true
}
```

*Alterar a temperatura em Cº atual de operação da CTO para qualquer valor inteiro*
*Ex.:*
```json
{
  "comando": "alterarTemperatura",
  "valor": 45
}
```

*Alterar a umidade relativa do ar dentro da CTO para qualquer valor inteiro entre 0 e 100*
*Ex.:*
```json
{
  "comando": "alterarUmidade",
  "valor": 80
}
```
