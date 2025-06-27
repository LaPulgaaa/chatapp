export function get_base_url(){
    const env = process.env.NODE_ENV;
    if(env === "development"){
        return `http://localhost:3000`
    }
    else if(env === "test"){
        return `https://chat.staging.varuncodes.com`
    }

    return `https://chat.varuncodes.com`
}