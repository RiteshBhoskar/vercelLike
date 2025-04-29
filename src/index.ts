import express from "express"
import cors from "cors"
import { generate } from "./generate";
import simpleGit from "simple-git";
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"

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

    files.forEach(async file => {
        await uploadFile(file.slice(path.dirname.length + 1), file)
    })

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await sqs.send(new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: id,
    }))

    res.json({
        id: id,
    })
})

app.listen(3000);