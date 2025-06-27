import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import type {PresignedPostOptions} from "@aws-sdk/s3-presigned-post"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { AwsCredentialIdentity } from "@aws-sdk/types";


let s3_client: S3Client | undefined;
const s3_region = process.env.S3_REGION;

function get_s3_client(){
    if(!s3_client){
        const credentials: AwsCredentialIdentity | undefined = process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY ? 
        {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY
        } : 
        undefined;
        s3_client = new S3Client({
            region: s3_region,
            credentials,
            ...(process.env.S3_ENDPOINT_URL && {endpoint: process.env.S3_ENDPOINT_URL}),
            forcePathStyle: !!process.env.S3_FORCE_PATH_STYLE
        })
    }

    return s3_client;
}

export async function get_s3_upload_url(name: string, slug: string, file_type: string,variant: string, access_type = "private"){
    const client = get_s3_client();

    const bucket = process.env.S3_BUCKET_NAME!;
    const post_conditions:PresignedPostOptions["Conditions"] = [["content-length-range",0,10485760]]

    const key = variant === "avatar" ? `${variant}/${slug}` : `${variant}/${slug}/${access_type}/${name}`;

    const {url, fields} = await createPresignedPost(client,{
        Bucket: bucket,
        Key: key,
        Fields: {
            'Content-Type': file_type,
            'Content-Encoding': "base64"
        },
        Conditions: post_conditions
    });

    return {
        upload_url: url,
        fields
    }
}

export async function get_s3_signed_url(key: string){
    const bucket = process.env.S3_BUCKET_NAME!;
    const client = get_s3_client();
    const command = new GetObjectCommand({
        Key: key,
        Bucket: bucket
    });

    const url = await getSignedUrl(client,command,{
        expiresIn: 60*5
    });

    return url;
}