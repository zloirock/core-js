// an escape through a computed key the claim folds takes the whole entry however the key folds - an effect ahead
// of the name, a const binding, a concat, a template - and whatever hands the value out: an export, a call, an
// alias. a folded read that stays home keeps the narrow entry
let k = 0;
const K = 'Set';
var { [(k++, 'Map')]: ViaEffect } = globalThis;
export default [ViaEffect];
const { [K]: ViaBound } = self;
use(ViaBound);
const { ['Weak' + 'Map']: ViaConcat } = globalThis;
const ViaAlias = ViaConcat;
export { ViaAlias };
export const viaTemplate = [globalThis[`Prom${ 'ise' }`]];
const { [(k++, 'WeakSet')]: Home } = globalThis;
export const home = new Home().has(viaTemplate);
