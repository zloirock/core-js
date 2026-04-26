// `function f({from} = (Array))` - oxc preserves the ParenthesizedExpression around the
// default while babel strips it. parens are peeled before the bare-Identifier check so
// both parsers route the receiver through the same rewrite (`{from: _Array$from}`)
// instead of falling back to inline-default emission
function f({ from } = (Array)) { return from; }
function g({ groupBy } = ((Map))) { return groupBy; }
export { f, g };
