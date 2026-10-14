import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// An iterator claim and a plain slot, each keyed by an effect, in a loop head over a realm selection: both
// legs run the keys in source order around the claim's binding, babel reading the realm again for each part
// while unplugin's drain memoizes it (the sidecar).
let done;
for (const {
    [(k(), _Symbol$iterator)]: _unused
  } = _globalThis, it5 = _getIteratorMethod(_globalThis), {
    [(k2(), 'x')]: x5
  } = _globalThis; !done;) done = 1;