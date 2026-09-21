import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A loop initializer resolves a realm alias and preserves its sequence prefix once.
// The alias declaration keeps its own global rewrite.
declare const logCall: () => any;
const obj = _globalThis;
for (const {
  Array: {
    from
  }
} = (logCall(), {
  Array: {
    from: _Array$from
  }
}); false;) {
  console.log(from);
}