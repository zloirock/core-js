import "core-js/modules/es.string.at";
interface Config {
  name: string;
  count: number;
}
declare function getConfig(): Config;
const {
  name
}: Config = getConfig();
name.at(0);