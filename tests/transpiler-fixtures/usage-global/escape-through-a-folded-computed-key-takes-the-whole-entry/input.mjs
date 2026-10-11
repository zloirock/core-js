// an escape through a computed key the claim folds loads the whole family however the key folds - an effect
// ahead of the name, a const binding, a concat, a template - and whatever hands the value out: an export, a
// call, an alias. a folded read that stays home loads the narrow set
let k = 0;
const K = 'Iterator';
var { [(k++, 'Map')]: ViaEffect } = globalThis;
export default [ViaEffect];
const { [K]: ViaBound } = self;
use(ViaBound);
const { ['U' + 'RL']: ViaConcat } = globalThis;
const ViaAlias = ViaConcat;
export { ViaAlias };
export const viaTemplate = [globalThis[`Prom${ 'ise' }`]];
const { [(k++, 'AggregateError')]: Home } = globalThis;
export const home = new Home([], 'm').message;
