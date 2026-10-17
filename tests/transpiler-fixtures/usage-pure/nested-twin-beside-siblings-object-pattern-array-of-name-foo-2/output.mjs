import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
const {
  Array: {
    of: {
      name: viaProxyTwoLevels,
      foo: f9
    },
    junk: j7
  },
  more: m1
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    },
    junk: _globalThis.Array.junk
  },
  more: _globalThis.more
};
export { viaProxyTwoLevels };
export { f9 };
export { j7 };
export { m1 };