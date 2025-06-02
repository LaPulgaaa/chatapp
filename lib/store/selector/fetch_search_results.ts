import { selectorFamily } from "recoil";
import * as v from "valibot";

import type { SearchApiDataSchema } from "@/packages/valibot";
import { search_api_data_schema } from "@/packages/valibot";


export const fetch_search_results = selectorFamily<SearchApiDataSchema,{query: string}>({
    key: "search_result_selector",
    get: 
        ({query}:{query: string}) => 
            async () => {
                try{
                    const resp = await fetch(`/api/search/?query=${query}`);

                    const raw_data = await resp.json();
                    const data = v.parse(search_api_data_schema, raw_data.data);

                    return data;
                }catch(err){
                    console.log(err);
                    return {
                        chat: [],
                        dm: [],
                        profile: []
                    }
                }
            }
})