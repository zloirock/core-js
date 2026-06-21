// Same misclassification risk with NewExpression as the outer call: `new Klass(Array,
// function({from}) {...})`. the callback is an arg, not an IIFE - the callee-identity
// guard must reject NewExpression too. callback args bind to Klass's constructor params,
// not to the callback's own params, so `{from}` must not be rewritten to `Array.from`.
declare class Klass {
  constructor(...args: any[]);
}
const x = new Klass(Array, function ({ from }) {
  return from([1, 2, 3]);
});
