// `function f({from} = (Array))` - oxc preserves ParenthesizedExpression around the default;
// babel parser strips it. synth-swap detection peels parens before the Identifier check so
// both parsers route the bare-receiver case through synth-swap (`{from: _Array$from}`)
// instead of inline-default fallback
function f({ from } = (Array)) { return from; }
function g({ groupBy } = ((Map))) { return groupBy; }
export { f, g };
