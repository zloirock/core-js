import "core-js/modules/es.array.at";
function process(x: string | number[]) {
  if (typeof x !== 'object') return;
  x.at(-1);
}