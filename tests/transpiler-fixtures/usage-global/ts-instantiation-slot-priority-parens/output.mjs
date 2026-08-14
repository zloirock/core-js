import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// the `expr<T>` instantiation slot takes a LeftHandSideExpression, so every looser shape carries
// source parens. the reprint has no paren rule of its own there: dropped, the call re-associates
// into the arrow body / the ternary alternate / the optional chain, or stops parsing altogether.
// the tail lines are the negatives - the shapes the slot accepts bare must STAY bare
const f: any = (x: number) => x;
const g: any = (x: number) => x;
const o: any = {
  m: f
};
let q: any;
const viaArrow = (() => f)<string>(1);
const viaConditional = (g ? f : g)<string>(1);
const viaAssign = (q = f)<string>(1);
const viaBinary = (f + g)<string>(1);
const viaLogical = (f || g)<string>(1);
const viaUnary = (void f)<string>(1);
const viaPostfix = (q++)<string>(1);
const viaPrefix = (++q)<string>(1);
const viaOptionalMember = (o?.m)<string>(1);
const viaOptionalCall = (o?.())<string>(1);
const viaCast = (f as any)<string>(1);
const viaAssertion = (<any> f)<string>(1);
const viaBare = f<string>(1);
const viaMember = o.m<string>(1);
const viaCall = g()<string>(1);
const viaNonNull = f!<string>(1);
const viaSequence = (q++, f)<string>(1);
// the rest of the domain: shapes already binding tighter than the type-argument list stay bare,
// and `satisfies` is the fusing cast the lines above do not spell
const viaBigInt = 1n<string>(1);
const viaBoolean = true<string>(1);
const viaNull = null<string>(1);
const viaRegExp = /re/<string>(1);
const viaTemplate = `t`<string>(1);
const viaImport = import('m')<string>(1);
const viaMetaProperty = import.meta<string>(1);
const viaNestedInstantiation = (f<number>)<string>(1);
const viaSatisfies = (f satisfies any)<string>(1);
function viaNewTarget() {
  return new.target<string>(1);
}
class ViaSuper extends Object {
  m() {
    return super.valueOf<string>(1);
  }
}
export const r = [1, [2]].flat();