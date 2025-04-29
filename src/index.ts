import express from "express"
import cors from "cors"
import { generate } from "./generate";
import simpleGit from "simple-git";
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"
import { Redis } from "@upstash/redis"

const redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN
})

const sqs = new SQSClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.ACCESS_KEY!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    }
})

const queueUrl = process.env.SQS_ENDPOINT!;

const app = express();
app.use(cors())
app.use(express.json())

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate();
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    for (const file of files) {
        const key = file.slice(path.join(__dirname, `output/${id}`).length + 1);
        await uploadFile(`output/${id}/${key}`, file);
    }

    await sqs.send(new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: id,
    }))

    redis.hset("status", { [id]: "Getting your files from Github..."})

    res.json({
        id: id,
    })
})

app.get("/status", async (req, res) => {
    const id = req.query.id;
    const response = await redis.hget("status", id as string);
    res.json({
        status: response
    })
})

app.listen(3000);