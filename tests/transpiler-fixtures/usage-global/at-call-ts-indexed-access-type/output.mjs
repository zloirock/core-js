import "core-js/modules/es.array.at";
type Config = {
  items: string[];
};
type Item = Config["items"];
const x: Item = [];
x.at(0);