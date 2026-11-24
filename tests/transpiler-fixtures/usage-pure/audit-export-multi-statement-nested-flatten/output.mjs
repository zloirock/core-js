import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A mirror serves Array.from and reads the remaining property while the original pattern
// exports both bindings in one declaration.
export const {
  Array: {
    from
  },
  includes: arrIncludes
} = {
  Array: {
    from: _Array$from
  },
  get includes() {
    return _globalThis.includes;
  }
};
[from, arrIncludes];