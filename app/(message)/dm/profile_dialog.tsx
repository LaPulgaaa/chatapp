import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import type { DmProfileInfo } from "@/packages/valibot";

export default function ProfileDialog({
  profile_info,
}: {
  profile_info: DmProfileInfo & { username: string };
}) {
  return (
    <DialogContent className="flex flex-col space-y-3">
      <DialogHeader className="flex items-center">
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
          {profile_info.name ?? profile_info.username}
        </h4>
        <div className="space-x-2">
          {profile_info.favorite.map((fav, _index) => {
            return <Badge key={_index}>{fav}</Badge>;
          })}
        </div>
      </DialogHeader>

      <div className="w-full flex justify-center">
        <Avatar className="h-[148px] w-[148px]">
          <AvatarImage
            loading="lazy"
            src={profile_info.avatarurl ?? `${process.env.NEXT_PUBLIC_STORE_URL!}/avatar/avatar.svg`}
          />
        </Avatar>
      </div>
      <div>
        <h4 className="scroll-m-20 text-lg font-semibold tracking-tight">
          About
        </h4>
        <p>
          {(profile_info.about ?? "").length > 0
            ? profile_info.about
            : "Hey there! I am not using whattsapp."}
        </p>
      </div>
      <div>
        <h4 className="scroll-m-20 text-lg font-semibold tracking-tight">
          Status
        </h4>
        <p>
          {(profile_info.status ?? "").length > 0 ? profile_info.status : ""}
        </p>
      </div>
    </DialogContent>
  );
}
