import "core-js/modules/es.string.at";
declare function getConfig(): unknown;
const config: {
  name: string;
} = getConfig();
config.name.at(0);