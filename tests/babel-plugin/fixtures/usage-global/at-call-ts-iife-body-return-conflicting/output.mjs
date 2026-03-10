import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
(x => {
  if (x) return [1, 2, 3];
  return 'hello';
})(true).at(-1);