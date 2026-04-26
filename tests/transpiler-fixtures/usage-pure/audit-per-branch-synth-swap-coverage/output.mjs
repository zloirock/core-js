import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// destructure receiver is a ConditionalExpression / LogicalExpression: each viable branch
// becomes its own `{key: _Branch$key}` literal independently; non-viable branches (unknown
// identifiers or no matching static method) are left raw
//
// VariableDeclarator init: ternary, both viable
const {
  from: a1
} = cond ? {
  from: _Array$from
} : _Map;
// VariableDeclarator init: ||, mixed viable (Array.from yes, userObj unknown)
const {
  from: a2
} = userObj || {
  from: _Array$from
};
// VariableDeclarator init: ??, member-call left (not Identifier - left stays raw)
const {
  from: a3
} = pickConstructor() ?? {
  from: _Array$from
};
// AssignmentExpression: ternary, multi-key destructure
let b1, b2;
({
  from: b1,
  of: b2
} = cond ? {
  from: _Array$from,
  of: _Array$of
} : _Map);
// AssignmentPattern (function param default): && reversed
function f({
  groupBy
} = _Promise && {
  groupBy: _Map$groupBy
}) {
  return groupBy;
}
// AssignmentPattern: nested conditional - outer ?? wraps inner ?
function g({
  try: t
} = (cond1 ? _Promise : null) ?? {
  try: _Promise$try
}) {
  return t;
}
export { a1, a2, a3, b1, b2, f, g };