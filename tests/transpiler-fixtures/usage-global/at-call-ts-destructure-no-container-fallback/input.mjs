interface Config {
  items: string[];
}
declare const cfg: Config;
const { items } = cfg;
items.at(0).link('x');
