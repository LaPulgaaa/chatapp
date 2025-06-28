import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { verify_permission } from "./util";

import { get_s3_signed_url } from "@/lib/storage/util";

export async function GET(_req: NextRequest, {params}:{params: { slug: string[] }}){
    const segments = params.slug;
    
    const session = await getServerSession();

    if(session === null){
        return Response.json({
            msg: "UNAUTHORISED"
        },{ status: 401 });
    }

    const username = session.username;

    try{

        const [variant, slug, access_type, encoded_name] = segments;

        if(!["room","direct","avatar"].includes(variant))
            return Response.json({
                msg: "UNAUTHORISED"
            },{ status: 401});

        if(variant === 'avatar'){
            const key = `${variant}/${slug}`;

            const signed_url = await get_s3_signed_url(key);

            return new Response(null,{
                status: 302,
                headers: {
                    Location: signed_url,
                }
            })
        }

        const name = decodeURIComponent(encoded_name);

        const key = `${variant}/${slug}/${access_type}/${name}`;

        if(access_type === "public"){
            const signed_url = await get_s3_signed_url(key);

            return new Response(null,{
                status: 302,
                headers: {
                    Location: signed_url,
                }
            })
        }

        // @ts-expect-error todo: make typescript happy
        const is_authorised = await verify_permission(username,variant,slug);

        if(is_authorised === false){
            return Response.json({
                msg: "NOT_ENOUGH_PERMISSION"
            });
        }

        const signed_url = await get_s3_signed_url(key);

        return new Response(null,{
            status: 302,
            headers: {
                Location: signed_url,
            }
        })
        
    }catch(err){
        console.log(err);
    }
}