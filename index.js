

(async () => {
    const axios = require('axios')
    const dotenv = require('dotenv')
    const moment = require('moment')
    const Telegraf = require('telegraf')
    dotenv.config();

    const bot = new Telegraf(process.env.TELEGRAM_API_KEY)
    console.log('Started at ' + moment().format('HH:mm:SS DD.MM.YYYY'))
    const unresolvedIncidents = []

    setInterval(async () => {
        try {
            const services = (await axios.get('https://status.cloud.yandex.ru/api/services')).data

            for (const service of services) {
                for (const incident of service.incidents) {

                        const foundIncident = unresolvedIncidents.find(_incident => _incident.id === incident.id)

                    if (foundIncident && (foundIncident.status !== incident.status)) {
                            await bot.telegram.sendMessage(
                                '@YandexCloudStatus',
                                "Service " + service.name + "\n" +
                                incident.title + "\n" +
                                "Status: " + incident.status + "\n" +
                                "Level: " + incident.level + "\n" +
                                "Start Date: " + incident.startDate + "\n" +
                                "End Date: " + incident.endDate + "\n" +
                                "status.cloud.yandex.ru"
                            )
                        } else {
                            if (incident.status !== 'resolved') {
                                unresolvedIncidents.push(incident)
                                console.log("New incident:\n", incident)

                                await bot.telegram.sendMessage(
                                    '@YandexCloudStatus',
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
            if (e.message.indexOf('status.cloud.yandex.ru') > -1) {
                console.log("status.cloud.yandex.ru is not available", moment().format('HH:mm:SS DD.MM.YYYY'))

                await bot.telegram.sendMessage(
                    '@YandexCloudStatus',
                    "status.cloud.yandex.ru is not available"
                )
            } else {
                throw e.message
            }
        }
    }, process.env.YANDEX_API_REQUEST_INTERVAL)


})()
