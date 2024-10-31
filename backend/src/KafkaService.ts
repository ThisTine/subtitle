import {Kafka, Producer} from "kafkajs";

export class KafkaService{
    private static instance: Kafka;
    private static producer: Producer;

    constructor() {
        const kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID,
            brokers: (process.env.KAFKA_BROKERS ?? "").split(","),
            ssl: false,
            sasl:{
                mechanism: 'plain',
                username: process.env.KAFKA_USERNAME??'',
                password: process.env.KAFKA_PASSWORD??''
            }
        });
        KafkaService.instance = kafka;
        KafkaService.producer = kafka.producer();
    }

    public static async init(){
        await KafkaService.producer.connect().catch(console.error);
    }

    public static sendMessage = async (topic: string, key:string, message: string) => {
        await KafkaService.producer.send({
            topic: topic,
            messages: [
                {
                    key: key,
                    value: message
                },
            ],
        }).catch(console.error);
    }

    public static sendTranslatedMessage = async (message: {
        text: string,
        textConfidence: number,
        translatedText: string,
        token: number
    }) => {
        await KafkaService.sendMessage(process.env.KAFKA_TOPIC??"", Date.now().toString() , JSON.stringify(message));
    }

}