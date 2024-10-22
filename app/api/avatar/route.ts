import { NextRequest } from "next/server";
import aws from "aws-sdk";


export async function POST(req: NextRequest){
    const { key, content_type } = await req.json();
    const s3 = new aws.S3({
        region: "ap-south-1",
    });

    try{
        const params = {
            Bucket: "chatapp-bucket",
            Key: key,
            Expires: 300,
            ContentType: content_type,
            ACL: 'private'
        }
    
        const url = await s3.getSignedUrlPromise('putObject',params);
    
        return Response.json({
            message: "SUCCESS",
            raw_data: {
                presigned_url: url,
            }
        },{ status: 201 });
    }catch(err){
        console.log(err);
        return Response.json({
            message: 'SERVER ERROR',
        },{ status: 500 })
    }


}