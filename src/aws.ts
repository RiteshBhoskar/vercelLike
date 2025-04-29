import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import fs from "fs"
import dotenv from "dotenv"

dotenv.config();

const s3 = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.ACCESS_KEY!,
        secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
})

const BUCKET_NAME  = process.env.BUCKET_NAME!;

export const uploadFile = async (fileName: string, localFilePath: string ) => {
    console.log("Uploading file to S3...")

    const fileContent = fs.readFileSync(localFilePath);

    const command  = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
    })

    try {
        const respone = await s3.send(command);
        console.log("Upload Successful", respone);
    } catch (error) {
        console.error("Upload Failed", error);
    }

}