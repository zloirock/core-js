import "core-js/modules/es.string.at";
function process(x: string | number[]) {
  return typeof x !== 'string' || x.at(-1);
}