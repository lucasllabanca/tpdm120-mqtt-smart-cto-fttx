# Smart CTO FTTx com MQTT

## Trabalho Prático DM120 - Introdução e Desenvolvimento para IoT

**Servidor MQTT usado**
1. **test.mosquitto.org**

**Tópicos de Telemetria das CTOs**
1. **smart/cto/fttx/clientes/{codigo-unico-cto}**
* `Tópico onde as CTOs publicam as telemetrias dos clientes finais configurados nelas`
2. **smart/cto/fttx/telemetria/{codigo-unico-cto}** 
* `Tópico onde as CTOs publicam as informações de telemetria dos sensores e de operação atuais delas`
3. **smart/cto/fttx/subscriptions/{codigo-unico-cto}**
* `Tópico onde as CTOs registram uma única vez ao ligar, seu código único, quantidade de clientes, tópicos usados para envio de telemetria e tópico de controle usado para receber comandos`

## Comandos possíveis que podem ser enviados às CTOs pelo tópico de controle 'smart/cto/fttx/controle/{codigo-unico-cto}'

**Alterar plano de dados de qualquer cliente da CTO, passando o código único do cliente (codigo) e o plano de internet (codigoPlano) como valor inteiro entre 1 e 4**
1. **Plano: 300MB, Download Min.: 30, Download Max.: 300, Upload Min.: 15, Upload Max.: 150**
2. **Plano: 400MB, Download Min.: 40, Download Max.: 400, Upload Min.: 20, Upload Max.: 200**
3. **Plano: 500MB, Download Min.: 50, Download Max.: 500, Upload Min.: 25, Upload Max.: 250**
4. **Plano: 1GB, Download Min.: 100, Download Max.: 1000, Upload Min.: 50, Upload Max.: 500**
```json
{
  "comando": "configurarCliente",
  "valor": {
        "codigo": "f091a160850d",
        "codigoPlano": 2
  }
}
```

**Desligar CTO informando um motivo qualquer** 
```json
{
  "comando": "desligarCto",
  "valor": "DESLIGADA PELA CENTRAL POR MOTIVOS DE SEGURANÇA"
}
```

**Alterar o status do sensor de ruptura para ativado (true) ou desativado (false)**
```json
{
  "comando": "alterarSensorRuptura",
  "valor": true
}
```

**Alterar a temperatura em Cº atual de operação da CTO para qualquer valor inteiro**
```json
{
  "comando": "alterarTemperatura",
  "valor": 45
}
```

**Alterar a umidade relativa do ar dentro da CTO para qualquer valor inteiro entre 0 e 100**
```json
{
  "comando": "alterarUmidade",
  "valor": 80
}
```

**Alterar o status da rede elétrica que chega na CTO para disponível (true) ou indisponível (false)**
```json
{
  "comando": "alterarStatusRedeEletrica",
  "valor": false
}
```

**Alterar o status da conexão de fibra óptica que chega na CTO para disponível (true) ou indisponível (false)**
```json
{
  "comando": "alterarStatusFibraOtica",
  "valor": true
}
```

***Os comandos anteriores tem por motivo simular alterações no funcionamentos das CTOs para verificar seu comportamento diante do cenário por meio das telemetrias dos seus sensores e clientes sendos publicadas nos tópicos***

**Exemplo de telemetria enviada uma única vez pela CTO quando é ativada - Topic: smart/cto/fttx/subscriptions/e90a3e382912**
```json
{
  "codigoCto": "e90a3e382912",
  "quantidadeClientes": 4,
  "topicoTelemetriaClientes": "smart/cto/fttx/clientes/e90a3e382912",
  "topicoTelemetriaCto": "smart/cto/fttx/telemetria/e90a3e382912",
  "topicoControleCto": "smart/cto/fttx/controle/e90a3e382912"
}
```
***Essa telemetria no tópico de subscriptions tem como finalidade a identificação das CTOs ativadas e seus respectivos tópicos, para gerenciamento da central de controle***

**Exemplo de telemetria de Clientes de uma CTO - Topic: smart/cto/fttx/clientes/91947e271b24**
```json
 [
  {
    "codigo": "b2b8ec92943c",
    "codigoCto": "91947e271b24",
    "cliente": "Cliente b2b8ec92943c",
    "codigoPlano": 4,
    "plano": "300MB",
    "download": 111,
    "upload": 21,
    "conectado": true,
    "status": "CONECTADO"
  },
  {
    "codigo": "521c7785aad4",
    "codigoCto": "91947e271b24",
    "cliente": "Cliente 521c7785aad4",
    "codigoPlano": 3,
    "plano": "300MB",
    "download": 0,
    "upload": 0,
    "conectado": false,
    "status": "NÃO CONECTADO"
  }
]
```

**Exemplo de telemetria de uma CTO - Topic: smart/cto/fttx/telemetria/91947e271b24**
```json
{
  "codigoCto": "91947e271b24",
  "quantidadeClientes": 2,
  "quantidadeClientesConectados": 1,
  "temperatura": 17,
  "umidade": "48%",
  "statusSensorRuptura": false,
  "cargaBateria": 100,
  "statusRedeEletrica": true,
  "statusFibraOtica": true,
  "statusConexaoMovel": false,
  "conexaoRede": "FIBRA ÓPTICA",
  "statusCto": "CTO LIGADA COM PORTA FECHADA"
}
```
