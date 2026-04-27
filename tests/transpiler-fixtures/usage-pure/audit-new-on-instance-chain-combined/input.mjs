// `new (chain.method)(args)` must preserve the `new` keyword. the chain-combined emit
// path collapses inner+outer into `binding(...).call(receiver, args)` - correct for
// CallExpression parent, silent semantic break (regular call instead of constructor)
// for NewExpression. gate: chain-combined applies only when parent is CallExpression;
// NewExpression falls through to the per-method emit which preserves `new`
var X = new (arr.flat?.().at)(1, 2);
