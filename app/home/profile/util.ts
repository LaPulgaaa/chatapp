
export async function handle_file_upload(file: File,slug: string,variant: string,allowed_extension?: string[]){
    if(!(file instanceof File)){
        return {
            url: "",
            error: "Upload not of type file"
        }
    }

    console.log(file.type)
    if(!file.type.startsWith("image/")){
        return {
            url: "",
            error: "Upload file not of type image"
        }
    }

    const file_buffer = await file.arrayBuffer();
    const bsize = file_buffer.byteLength;
    const kbsize = bsize / 1024;

    if(kbsize > 10240){
        return {
            url: "",
            error: "Upload size more than max limit ie.1mb"
        }
    }

    const payload = {
        name: file.name,
        type: file.type,
        ext: allowed_extension,
        slug: slug,
        access: "public",
        variant,
    }

    try{
        const resp = await fetch(`/api/storage`,{
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify(payload),
            credentials: "include"
        });

        const json = await resp.json();

        if(resp.status === 200){
            const {file_url,presigned_url,fields}:{file_url: string,presigned_url: string, fields: Record<string,string>} = json.data;

            const s3_form_data = new FormData();

            console.log(presigned_url);

            Object.entries(fields).forEach(([key,value]) => {
                s3_form_data.append(key,value);
            })

            const blob = new Blob([new Uint8Array(file_buffer)]);

            s3_form_data.append("file",blob);

            const resp = await fetch(presigned_url,{
                method: 'POST',
                body: s3_form_data
            });

            if(resp.ok){
                return {
                    url: file_url,
                }
            }
        }

        return {
            url: "",
            error: "ERROR_UPLOADING_TO_S3"
        }
    }catch(err){
        console.log(err);
        return {
            url: "",
            error: "COULD_NOT_UPLOAD_IMAGE"
        }
    }
}