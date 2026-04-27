// `obj?.k in target` - optional chain on LHS of `in`. parser accepts the syntax (`?.k`
// evaluates to undefined when obj is nullish). plugin doesn't fold the in-expression -
// LHS isn't a static string-literal key (it's an OptionalMemberExpression result), no
// inject. covers the optional-chain-as-LHS case
obj?.k in target;