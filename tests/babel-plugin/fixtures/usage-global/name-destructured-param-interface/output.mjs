import "core-js/modules/es.string.at";
interface Config {
  name: string;
  count: number;
}
function process({
  name
}: Config) {
  name.at(0);
}