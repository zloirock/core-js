// the `expr<T>` instantiation slot takes a LeftHandSideExpression, so every looser shape carries
// source parens, and pure REWRITES what sits under them - the restoration reads the slot while the
// ponyfill substitution is still landing in it. dropped, the call re-associates into the arrow body
// / the ternary alternate / the optional chain; the tail lines are negatives and must stay bare
const g: any = (x: number) => x;
const o: any = { m: g };
let q: any;
const viaArrow = ((() => Array.from)<any>)()([1]);
const viaConditional = ((g ? Array.of : g)<any>)(1);
const viaAssign = ((q = Promise.allSettled)<any>)([]);
const viaBinary = ((g + Iterator.zip)<any>)([[1]]);
const viaLogical = ((g || Object.groupBy)<any>)([], g);
const viaUnary = ((void Array.from)<any>)([1]);
const viaPostfix = ((q++)<any>)(1);
const viaPrefix = ((++q)<any>)(1);
const viaOptionalMember = ((o?.m)<any>)(1);
const viaOptionalCall = ((o?.())<any>)(1);
const viaOptionalStatic = ((Array?.from)<any>)([1]);
const viaCast = ((Array.from as any)<any>)([1]);
const viaAssertion = ((<any>Array.of)<any>)(1);
const viaBare = ((Array.of)<any>)(1);
const viaMember = ((Map.groupBy)<any>)([], g);
const viaNonNull = ((Promise.try!)<any>)(g);
const viaSequence = ((q++, Array.from)<any>)([1]);
// the rest of the domain: shapes already binding tighter than the type-argument list stay bare,
// and `satisfies` is the fusing cast the lines above do not spell
const viaBigInt = ((1n)<any>)(1);
const viaBoolean = ((true)<any>)(1);
const viaNull = ((null)<any>)(1);
const viaRegExp = ((/re/)<any>)(1);
const viaTemplate = ((`t`)<any>)(1);
const viaImport = ((import('m'))<any>)(1);
const viaMetaProperty = ((import.meta)<any>)(1);
const viaNestedInstantiation = ((Array.of<number>)<any>)(1);
const viaSatisfies = ((Array.from satisfies any)<any>)([1]);
export const r = [viaBigInt, viaBoolean, viaNull, viaRegExp, viaTemplate, viaImport,
  viaMetaProperty, viaNestedInstantiation, viaSatisfies, viaArrow, viaConditional, viaAssign, viaBinary, viaLogical, viaUnary, viaPostfix,
  viaPrefix, viaOptionalMember, viaOptionalCall, viaOptionalStatic, viaCast, viaAssertion, viaBare,
  viaMember, viaNonNull, viaSequence];
