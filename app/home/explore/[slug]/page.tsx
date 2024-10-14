export default function Explorer({ params }:{ params: {slug: string}}){
    return(
        <div>{params.slug}'s Profile</div>
    )
}