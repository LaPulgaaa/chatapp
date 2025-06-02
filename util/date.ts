export function create_timestamp(createdAt: string) {
    const time = new Date(createdAt)
      .toTimeString()
      .split(" ")[0]
      .split(":")
      .slice(0, -1);
    return `${time[0]}:${time[1]}`;
}
