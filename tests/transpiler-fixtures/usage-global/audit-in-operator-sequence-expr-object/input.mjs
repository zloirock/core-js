// the `in`-expression right operand is a SequenceExpression that evaluates to `Object`
// (`(fn(), Object)`); the leading side effect must be looked through so the static probe
// resolves to `Object` and `values` is injected, exactly like the bare-`Object` operand above
function fn() {}
const a = 'assign' in Object;
const b = 'values' in (fn(), Object);
