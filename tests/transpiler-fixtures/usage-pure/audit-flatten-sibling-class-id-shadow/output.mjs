import _Array$from from "@core-js/pure/actual/array/from";
// Single declaration with two declarators: outer flattens `{Array:{from}} = globalThis`,
// sibling is a class expression named `globalThis`. The class id shadows the global
// inside its body, so the method's `globalThis` reference stays as the class self
// (no polyfill substitution); only the outer `Array.from` becomes a polyfill.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  klass = class globalThis {
    method() {
      return globalThis;
    }
  };
console.log(from, klass);