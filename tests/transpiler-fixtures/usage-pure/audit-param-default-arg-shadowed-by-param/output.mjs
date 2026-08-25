import _Array$from from "@core-js/pure/actual/array/from";
// the IIFE call-arg is evaluated AT THE CALL SITE, so the choice between it and the param default
// has to be RESOLVED there too. resolving the arg inside the invoked function's frame let a
// same-named parameter shadow it into unresolvable, and the runtime-DEAD default (`Object` has no
// `from`) won instead - the polyfill disappeared on a param rename alone
function mk() {
  return Array;
}
const shadowed = function ({
  from
} = Object, mk) {
  return from;
}({
  from: _Array$from
});
export { shadowed };

// control: the same call with the parameter renamed - it always resolved, and still does
const plain = function ({
  from
} = Object, zz) {
  return from;
}({
  from: _Array$from
});
export { plain };

// a proxy-global member arg under the same shadowing name resolves at the call site too
const viaProxy = function ({
  from
} = Object, globalThis) {
  return from;
}({
  from: _Array$from
});
export { viaProxy };

// NEGATIVE: an `undefined` arg makes the runtime apply the default, so the DEFAULT is what gets
// polyfilled - the call-site resolution must not flip that
const defaulted = function ({
  from
} = {
  from: _Array$from
}, x) {
  return from;
}(undefined);
export { defaulted };