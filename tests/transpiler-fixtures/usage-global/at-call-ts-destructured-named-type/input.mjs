interface Config {
  name: string;
  count: number;
}

declare function getConfig(): Config;
const { name }: Config = getConfig();
name.at(0);
