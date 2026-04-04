import "core-js/modules/es.array.at";
import "core-js/modules/es.string.link";
interface Config {
  items: string[];
}
declare const cfg: Config;
const {
  items
} = cfg;
items.at(0).link('x');