import "core-js/modules/es.array.at";
function process(x: string | number[]) {
  if (typeof x === 'string') {
    if (x.length > 5) {
      return;
    } else {
      throw new Error('too short');
    }
  }
  x.at(-1);
}