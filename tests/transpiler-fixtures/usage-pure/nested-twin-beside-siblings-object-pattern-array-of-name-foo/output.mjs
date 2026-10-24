import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
const {
  Array: {
    of: {
      name: viaProxyInner,
      foo: f7
    },
    junk: j5
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    },
    junk: _globalThis.Array.junk
  }
};
export { viaProxyInner };
export { f7 };
export { j5 };