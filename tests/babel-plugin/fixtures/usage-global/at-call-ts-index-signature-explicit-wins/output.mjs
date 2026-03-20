import "core-js/modules/es.function.name";
import "core-js/modules/es.string.at";
const config: {
  name: string;
  [key: string]: string | number;
} = getConfig();
config.name.at(0);