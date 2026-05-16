// Same misclassification risk but with NewExpression as the outer call: `new Klass(Array,
// function({from}) {...})`. the inline peel previously accepted both CallExpression and
// NewExpression as IIFE shape; shared `findIifeCallSite` correctly applies the callee-
// identity guard to NewExpression too. callback args bind to Klass's constructor's params,
// not to the callback's own params.
declare class Klass {
  constructor(...args: any[]);
}
const x = new Klass(Array, function ({
  from
}) {
  return from([1, 2, 3]);
});