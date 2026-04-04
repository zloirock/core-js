import "core-js/modules/es.array.at";
function process(x: string | number[]) {
  return x instanceof Array ? x.at(-1) : null;
}