import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set";
// A receiver mirror carries resolved string keys as literal names, including bracket-shaped keys.
// Native passthroughs use ordinary data slots. A declined rest keeps native leaves.
let ctor, dash, bracket, empty, prototype, of, rest;
[{
  Set: ctor,
  'with-dash': dash,
  '[key]': bracket,
  '': empty,
  __proto__: prototype,
  Array: {
    of
  }
} = {
  Set: _Set,
  "with-dash": _globalThis["with-dash"],
  "[key]": _globalThis["[key]"],
  "": _globalThis[""],
  ["__proto__"]: _globalThis.__proto__,
  Array: {
    of: _Array$of
  }
}] = [];
[{
  Set: ctor,
  Array: {
    of
  },
  ...rest
} = _globalThis] = [];
export function read(source) {
  const [{
    Array: {
      from = 1
    },
    'with-dash': raw = 2
  } = {
    Array: {
      from: _Array$from
    },
    "with-dash": _globalThis["with-dash"]
  }] = source;
  return [from, raw];
}
export const result = [ctor, dash, bracket, empty, prototype, of, rest];

// Repeated keys keep separate native reads beside quoted and identifier siblings.
export function readRepeated(source) {
  const [{
    Array: {
      of
    },
    'with-dash': dash,
    late: first,
    late: second
  } = _globalThis] = source;
  return [of, dash, first, second];
}