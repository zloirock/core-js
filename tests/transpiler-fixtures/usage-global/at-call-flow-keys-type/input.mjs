type Config = { host: string, port: number };
function getKey(k: $Keys<Config>) {
  k.at(-1);
}
