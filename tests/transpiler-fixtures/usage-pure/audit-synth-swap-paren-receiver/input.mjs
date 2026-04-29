// `function f({from} = (Array))` - some parsers keep the paren wrapper around the default
// as an AST node while others strip it. Parens are peeled before the bare-Identifier check
// so both forms route the receiver through the same rewrite (`{from: _Array$from}`)
// instead of falling back to a per-key destructure-default
function f({ from } = (Array)) { return from; }
function g({ groupBy } = ((Map))) { return groupBy; }
export { f, g };
