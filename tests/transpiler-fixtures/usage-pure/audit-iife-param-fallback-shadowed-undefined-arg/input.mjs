// pure synth-swap: a shadowed `undefined` (here = Array) is a real receiver, so the call-arg
// wins over the default and `from` rewrites to the shadow static pure helper
const undefined = Array;
(function ({ from } = Int8Array) {
  from([1, 2, 3]);
})(undefined);
