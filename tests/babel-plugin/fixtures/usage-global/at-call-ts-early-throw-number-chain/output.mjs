import "core-js/modules/es.string.at";
function process(x: string | number) {
  if (typeof x === 'number') throw new Error();
  x.at(-1);
}