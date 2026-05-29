// `void 0` evaluates to undefined, so the runtime applies the parameter default - emission
// enumerates the default branches, same as a literal `undefined` arg
const cond = Math.random() > 0.5;
(function ({ from } = cond ? Array : Int8Array) {
  from([1, 2, 3]);
})(void 0);
