import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise$try from "@core-js/pure/actual/promise/try";
// the `expr<T>` instantiation slot takes a LeftHandSideExpression, so every looser shape carries
// source parens, and pure REWRITES what sits under them - the restoration reads the slot while the
// ponyfill substitution is still landing in it. dropped, the call re-associates into the arrow body
// / the ternary alternate / the optional chain; the tail lines are negatives and must stay bare
const g: any = (x: number) => x;
const o: any = { m: g };
let q: any;
const viaArrow = ((() => _Array$from)<any>)()([1]);
const viaConditional = ((g ? _Array$of : g)<any>)(1);
const viaAssign = ((q = _Promise$allSettled)<any>)([]);
const viaBinary = ((g + _Iterator$zip)<any>)([[1]]);
const viaLogical = ((g || _Object$groupBy)<any>)([], g);
const viaUnary = ((void _Array$from)<any>)([1]);
const viaPostfix = ((q++)<any>)(1);
const viaPrefix = ((++q)<any>)(1);
const viaOptionalMember = ((o?.m)<any>)(1);
const viaOptionalCall = ((o?.())<any>)(1);
const viaOptionalStatic = ((_Array$from)<any>)([1]);
const viaCast = (_Array$from<any>)([1]);
const viaAssertion = (_Array$of<any>)(1);
const viaBare = (_Array$of<any>)(1);
const viaMember = (_Map$groupBy<any>)([], g);
const viaNonNull = (_Promise$try<any>)(g);
const viaSequence = ((q++, _Array$from)<any>)([1]);
// the rest of the domain: shapes already binding tighter than the type-argument list stay bare,
// and `satisfies` is the fusing cast the lines above do not spell
const viaBigInt = ((1n)<any>)(1);
const viaBoolean = ((true)<any>)(1);
const viaNull = ((null)<any>)(1);
const viaRegExp = ((/re/)<any>)(1);
const viaTemplate = ((`t`)<any>)(1);
const viaImport = ((import('m'))<any>)(1);
const viaMetaProperty = ((import.meta)<any>)(1);
const viaNestedInstantiation = ((_Array$of<number>)<any>)(1);
const viaSatisfies = (_Array$from<any>)([1]);
export const r = [viaBigInt, viaBoolean, viaNull, viaRegExp, viaTemplate, viaImport,
  viaMetaProperty, viaNestedInstantiation, viaSatisfies, viaArrow, viaConditional, viaAssign, viaBinary, viaLogical, viaUnary, viaPostfix,
  viaPrefix, viaOptionalMember, viaOptionalCall, viaOptionalStatic, viaCast, viaAssertion, viaBare,
  viaMember, viaNonNull, viaSequence];