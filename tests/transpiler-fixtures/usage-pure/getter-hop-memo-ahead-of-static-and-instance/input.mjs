// a nested level read through a user GETTER (`{ M: KE.I }`) by a static and an instance member
// memoizes the getter's value once, AHEAD of the static's binding - the getter runs before the
// pattern binds anything - as a `const` whatever the host's kind, and the replay of the flattened
// level does not read the getter a second time
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
