import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// The method default stays between its preceding and following native reads.
// A nested sibling is retained at this level, not mistaken for the method's receiver.
function read(source) {
  const {
    y: {
      u: {
        x
      } = fallback(),
      at = defaultAt(typeof x),
      after = at
    }
  } = {
    y: source
  };
  return [x, at, after];
}