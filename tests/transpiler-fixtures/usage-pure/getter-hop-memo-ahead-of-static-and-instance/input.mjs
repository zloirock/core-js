// A constructor-valued getter runs once before both static and instance sibling bindings.
// The capture serves each static while the name helper reads that same constructor value.
class KE { static get I() { log(); return Iterator; } static get A() { log(); return Array; } }
const { M: { from: fromConst, name: constName } } = { M: KE.I };
let { M: { concat: concatLet, name: letName } } = { M: KE.I };
var { M: { zip: zipVar, name: varName } } = { M: KE.I };
export const { M: { zipKeyed: zipKeyedExport, name: exportName } } = { M: KE.I };
const run = () => {
  const { M: { of: ofArrow, name: arrowName } } = { M: KE.A };
  return [ofArrow, arrowName];
};
use(fromConst, constName, concatLet, letName, varName, zipVar, run);
