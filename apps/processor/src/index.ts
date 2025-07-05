import { db } from "@repo/db/dist";
import { Kafka } from "kafkajs";

const TOPIC_NAME = process.env.TOPIC_NAME || "zap-events";

const brokers = process.env.KAFKA_BROKERS?.split(",") || ['localhost:9092'];

const kafka = new Kafka({
  clientId: 'outbox-processor',
  brokers,
});

async function main() {
  const producer = kafka.producer();
  await producer.connect();

  while (true) {
    const pendings = await db.zapRunOutBox.findMany({
      where: {},
      take: 10,
    });

    if (!pendings.length) {
      console.log("[]");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    console.log("Processing pending zap run:", pendings);

    await producer.send({
      topic: TOPIC_NAME,
      messages: pendings.map((pending) => ({
        value: JSON.stringify({ zapRunId: pending.zapRunId, stage: 0 }),
      })),
    });

    await db.zapRunOutBox.deleteMany({
      where: {
        id: {
          in: pendings.map((pending) => pending.id),
        },
      },
    });

    console.log("Deleted pending zap run:", pendings);
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}

main().catch(console.error);