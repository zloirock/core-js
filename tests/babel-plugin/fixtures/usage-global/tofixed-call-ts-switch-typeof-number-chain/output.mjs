import "core-js/modules/es.string.repeat";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.at";
function format(x: string | number) {
  switch (typeof x) {
    case 'number':
      return x.toFixed(2);
    case 'string':
      return x.at(-1);
  }
}