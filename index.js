(async () => {
    const fs = require('fs')
    const axios = require('axios')
    const dotenv = require('dotenv')
    const moment = require('moment')
    const Telegraf = require('telegraf')
    dotenv.config();

    const bot = new Telegraf(process.env.TELEGRAM_API_KEY)
    console.log('Started at ' + moment().format('HH:mm:SS DD.MM.YYYY'))

    // Array for unresolved incidents
    const unresolvedIncidents = []
    let testCounter = 0

    setInterval(async () => {
        bot.start((ctx) => {
            console.log(ctx.chat.id)
        })
        await bot.launch()

        let services = {}

        try {

            // If TEST mode activated then get data from test datafiles
            if (process.env.TEST) {
                testCounter++
                console.log('Test data', testCounter)
                services = JSON.parse(fs.readFileSync('./test/testData' + testCounter + '.json', 'utf8'))
                testCounter = testCounter === 5 ? 0 : testCounter
            } else {
                services = (await axios.get('https://status.cloud.yandex.ru/api/services')).data
            }

            for (const service of services) {
                for (const incident of service.incidents) {

                    // Try to find incident in unresolved incidents list
                    const foundIncident = unresolvedIncidents.find(
                        _incident => (_incident.id === incident.id) && (_incident.serviceId === service.id)
                    )

                    // If incident found and him statuses updated send message
                    if (foundIncident) {
                        if (foundIncident.status !== incident.status) {
                            await bot.telegram.sendMessage(
                                process.env.CHAT_ID,
                                "Service " + service.name + "\n" +
                                incident.title + "\n" +
                                "Status: " + incident.status + "\n" +
                                "Level: " + incident.level + "\n" +
                                "Start Date: " + incident.startDate + "\n" +
                                "End Date: " + incident.endDate + "\n" +
                                "status.cloud.yandex.ru"
                            )
                        }

                        // If incident status updated to 'resolved' delete it from unresolved incidents list
                        if (incident.status === 'resolved') {
                            const foundIncidentIdx = unresolvedIncidents.find(
                                _incident => (_incident.id === incident.id) && (_incident.serviceId === service.id)
                            )
                            unresolvedIncidents.splice(foundIncidentIdx, 1)
                        }
                    } else {

                        // If incident NOT found in unresolved incidents list and him status is not "resolved"
                        // add it to unresolved incidents list and send message
                        if (incident.status !== 'resolved') {
                            unresolvedIncidents.push({...incident, serviceName: service.name, serviceId: service.id})
                            console.log("New incident:\n", incident)

                            await bot.telegram.sendMessage(
                                process.env.CHAT_ID,
                                "Service " + service.name + "\n" +
                                incident.title + "\n" +
                                "Status: " + incident.status + "\n" +
                                "Level: " + incident.level + "\n" +
                                "Start Date: " + incident.startDate + "\n" +
                                "End Date: " + incident.endDate + "\n" +
                                "status.cloud.yandex.ru"
                            )
                        }
                    }

                }
            }
        } catch (e) {

            // Send message if can't connect to status.cloud.yandex.ru
            if (e.message.indexOf('status.cloud.yandex.ru') > -1) {
                console.log("status.cloud.yandex.ru is not available", moment().format('HH:mm:SS DD.MM.YYYY'))

                await bot.telegram.sendMessage(
                    process.env.CHAT_ID,
                    "status.cloud.yandex.ru is not available"
                )
            } else {
                throw e.message
            }
        }
    }, process.env.YANDEX_API_REQUEST_INTERVAL)


})()
