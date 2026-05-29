// a real (classifiable) call-arg overrides the parameter default, so only the arg branch is
// emitted: the default ternary is dead code at runtime and must not contribute its polyfills
const cond = Math.random() > 0.5;
(function ({ from } = cond ? Array : Set) {
  from([1, 2, 3]);
})(Int8Array);
