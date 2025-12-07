import { JsonObject } from "@prisma/client/runtime/library";
import { Kafka } from "kafkajs";
import { parse } from "./parser.js";
import { sendEmail } from "./email.js";
import dotenv from 'dotenv';
import { sendSol } from "./solana.js";
import { db } from "@repo/db/dist";

const TOPIC_NAME = process.env.TOPIC_NAME;
const GROUP_ID = process.env.GROUP_ID;

const kafka = new Kafka({
  clientId: process.env.CLIENT_ID,
  brokers: process.env.KAFKA_BROKERS.split(",")
})
dotenv.config();
async function main() {
    const consumer = kafka.consumer({ groupId: GROUP_ID });
    await consumer.connect();
    const producer =  kafka.producer();
    await producer.connect();

    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true })

    await consumer.run({
        autoCommit: false,
        eachMessage: async ({ topic, partition, message }) => {
          console.log({
            partition,
            offset: message.offset,
            value: message.value?.toString(),
          })
          if (!message.value?.toString()) {
            return;
          }

          const parsedValue = JSON.parse(message.value?.toString());
          const zapRunId = parsedValue.zapRunId;
          const stage = parsedValue.stage;

          const zapRunDetails = await db.zapRun.findFirst({
            where: {
              id: zapRunId
            },
            include: {
              zap: {
                include: {
                  actions: {
                    include: {
                      type: true
                    }
                  }
                }
              },
            }
          });
          const currentAction = zapRunDetails?.zap.actions.find(x => x.sortingOrder === stage);

          if (!currentAction) {
            console.log("Current action not found?");
            return;
          }

          const zapRunMetadata = zapRunDetails?.metaData;

          if (currentAction.type.id === "email") {
            const body = parse((currentAction.metaData as JsonObject)?.body as string, zapRunMetadata);
            const to = parse((currentAction.metaData as JsonObject)?.email as string, zapRunMetadata);
            console.log(`Sending out email to ${to} body is ${body}`)
            await sendEmail(to, body);
          }

          if (currentAction.type.id === "send-sol") {

            const amount = parse((currentAction.metaData as JsonObject)?.amount as string, zapRunMetadata);
            const address = parse((currentAction.metaData as JsonObject)?.address as string, zapRunMetadata);
            console.log(`Sending out SOL of ${amount} to address ${address}`);
            await sendSol(address, amount);
          }
          
          // 
          await new Promise(r => setTimeout(r, 500));

          const lastStage = (zapRunDetails?.zap.actions?.length || 1) - 1; // 1
          console.log(lastStage);
          console.log(stage);
          if (lastStage !== stage) {
            console.log("pushing back to the queue")
            await producer.send({
              topic: TOPIC_NAME,
              messages: [{
                partition: partition,
                value: JSON.stringify({
                  stage: stage + 1,
                  zapRunId
                })
              }]
            })  
          }

          console.log("processing done");
          
          await consumer.commitOffsets([{
            topic: TOPIC_NAME,
            partition: partition,
            offset: (parseInt(message.offset) + 1).toString() 
          }])
        },
      })

}

main()
