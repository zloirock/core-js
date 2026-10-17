import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
const {
  of: {
    name: hopFirst,
    foo: f1
  },
  junk: j1
} = {
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  },
  junk: Array.junk
};
export { hopFirst };
export { f1 };
export { j1 };