import _Array$from from "@core-js/pure/actual/array/from";
// the inner key is a COMPUTED reference to a const string (`k = "from"`), statically resolvable
// exactly as detection resolves it. so the diverging ternary mirrors per branch: the global-proxy
// consequent becomes the synth literal carrying the RESOLVED static key, while the user-object
// alternate stays native (its legitimate `undefined` is preserved). the pattern keeps `[k]`, which
// reads the synth's `from` on the proxy branch. only a side-effecting / unresolvable computed key bails
const k = "from";
const userObj = {
  Array: {}
};
let useGlobal = false;
const {
  Array: {
    [k]: f
  }
} = useGlobal ? {
  Array: {
    from: _Array$from
  }
} : userObj;
typeof f;