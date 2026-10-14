import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An anonymous function default of an assignment leaf the dispatch may replace keeps the name the
// binding gives it natively (`fallback`): the guard that falls back to it still names it after the
// binding, as the declaration host does, over a receiver no type is known for.
let fallback;
function pickFallback(foreign) {
  ({
    y: {
      at: fallback = () => -1
    }
  } = foreign);
}
export { fallback, pickFallback };