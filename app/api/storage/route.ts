import { randomUUID } from "crypto";

import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { get_base_url } from "./util";

import { get_s3_upload_url } from "@/lib/storage/util";

export async function POST(req: NextRequest){
    const body = await req.json();

    const token = await getToken({req});

    if(token === null){
        return Response.json({
            msg: "UNAUTHORISED_REQUEST"
        },{ status: 401});
    }

    try{
        const {type, name, slug, ext, access = "public", variant} = body;

        const file_ext = name.split(".").slice(-1)[0];
        const file_name_wo_ext = name.split(".").slice(0,-1).join(".");

        if(ext && ext.length > 0 && !ext.includes(file_ext))
            return Response.json({
                msg: 'UNSUPPORTED_FORMAT'
        },{status: 501});

        const uuid = randomUUID();
    
        const uploaded_name = `${file_name_wo_ext}--${uuid}--${slug}.${file_ext}`;

        const base_url = get_base_url();

        const {upload_url,fields} = await get_s3_upload_url(uploaded_name,slug,type,variant,access);

        const file_url_str = variant === "avatar" ? 
        `${base_url}/uploads/${variant}/${slug}/${uuid}` : 
        `${base_url}/uploads/${variant}/${slug}/${access}/${uploaded_name}`;

        return Response.json({
            msg: 'UPLOAD_URL_GENERATED',
            data: {
                presigned_url: upload_url,
                fields: fields,
                file_url: new URL(file_url_str).href
            }
        });

    }catch(err){
        console.log(err);
        return Response.json({
            msg: 'SERVER_ERROR',
            err
        },{status: 500});
    }
}