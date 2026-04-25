import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// `function f({from} = (Array))` - oxc preserves ParenthesizedExpression around the default;
// babel parser strips it. synth-swap detection peels parens before the Identifier check so
// both parsers route the bare-receiver case through synth-swap (`{from: _Array$from}`)
// instead of inline-default fallback
function f({ from } = ({ from: _Array$from })) { return from; }
function g({ groupBy } = (({ groupBy: _Map$groupBy }))) { return groupBy; }
export { f, g };