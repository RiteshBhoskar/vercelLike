"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const generate_1 = require("./generate");
const simple_git_1 = __importDefault(require("simple-git"));
const path_1 = __importDefault(require("path"));
const file_1 = require("./file");
const aws_1 = require("./aws");
const client_sqs_1 = require("@aws-sdk/client-sqs");
const sqs = new client_sqs_1.SQSClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    }
});
const queueUrl = process.env.SQS_ENDPOINT;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/deploy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoUrl = req.body.repoUrl;
    const id = (0, generate_1.generate)();
    yield (0, simple_git_1.default)().clone(repoUrl, path_1.default.join(__dirname, `output/${id}`));
    const files = (0, file_1.getAllFiles)(path_1.default.join(__dirname, `output/${id}`));
    files.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, aws_1.uploadFile)(file.slice(path_1.default.dirname.length + 1), file);
    }));
    yield new Promise((resolve) => setTimeout(resolve, 5000));
    yield sqs.send(new client_sqs_1.SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: id,
    }));
    res.json({
        id: id,
    });
}));
app.listen(3000);
