// `Promise?.Pending` where `Promise` is shadowed by a local TS-runtime binding (enum) in the
// same function. the shadow check (`adapter.hasBinding`) must anchor at the reference path so it
// walks TS-runtime declarations (`enum`, `namespace`, `import X = require`) at the use site;
// without the path anchor the enum shadow is missed and the rewrite retargets the local access.
function probe() {
  enum Promise {
    Pending,
    Fulfilled,
    Rejected
  }
  return Promise?.Pending;
}
export { probe };