# TP DM120 - Smart CTO FTTx com MQTT

## Trabalho Prático da Disciplina DM120 - Introdução e Desenvolvimento para IoT

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

**Alterar plano de dados de qualquer cliente da CTO, passando o código único do cliente e o plano de internet como valor inteiro entre 1 e 4**
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
  "valor": "DESATIVADA PELA CENTRAL POR MOTIVOS DE SEGURANCA"
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
