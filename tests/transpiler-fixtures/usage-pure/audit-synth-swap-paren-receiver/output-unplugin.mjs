import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// `function f({from} = (Array))` - oxc preserves the ParenthesizedExpression around the
// default while babel strips it. parens are peeled before the bare-Identifier check so
// both parsers route the receiver through the same rewrite (`{from: _Array$from}`)
// instead of falling back to inline-default emission
function f({ from } = ({ from: _Array$from })) { return from; }
function g({ groupBy } = (({ groupBy: _Map$groupBy }))) { return groupBy; }
export { f, g };