import _Array$from from "@core-js/pure/actual/array/from";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// A computed key under an array wrapper observes its binding before initialization.
// The static method is polyfilled after that key; the second element stays paired.
let seen;
function observe() {
  try {
    seen = typeof from;
  } catch (error) {
    seen = _nameMaybeFunction(error);
  }
}
const [{
  [(observe(), 'from')]: from
}, other] = [{
  from: _Array$from
}, {}];
export const result = [seen, from([7]), other];