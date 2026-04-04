import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
function fn(x) {
  if (!(x instanceof Array)) return;
  setTimeout(() => {
    x = {
      length: 1
    };
  });
  if (typeof x !== 'object') return;
  x.at(0);
}