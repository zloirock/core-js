import _Array$from from "@core-js/pure/actual/array/from";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// An effectful computed key observes its static binding before initialization.
// The capture serves from only after that key and preserves the second element.
let seen;
function observe() {
  try {
    seen = typeof from;
  } catch (error) {
    seen = _nameMaybeFunction(error);
  }
}
const [{}, _ref] = [Array, {}],
  from = (observe(), _Array$from),
  other = _ref;
export const result = [seen, from([7]), other];