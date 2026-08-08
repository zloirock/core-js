import _Array$from from "@core-js/pure/actual/array/from";
// a string-LITERAL inner key resolves to a static name (unlike a COMPUTED key), so it IS mirrored:
// the proxy branch becomes the synth literal binding the polyfill, the user-object branch verbatim.
// distinguishes string-literal keys (mirrorable) from computed keys (which bail to a per-branch default)
const userObj = {
  Array: {
    from: () => "U"
  }
};
const {
  Array: {
    "from": f
  }
} = c ? {
  Array: {
    from: _Array$from
  }
} : userObj;
f([1]);