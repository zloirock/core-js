import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function process(x: string | number[]) {
  if (typeof x === 'string') {
    if (x.length > 5) {
      return;
    }
  }
  x.at(-1);
}