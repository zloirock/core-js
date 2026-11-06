// `undefined` shadowed by a real constructor is a classifiable receiver, so the call-arg (the
// shadow) overrides the parameter default - `from` resolves to the shadow static, not the default
const undefined = Int8Array;
(function ({ from } = Array) {
  from([1, 2, 3]);
})(undefined);
