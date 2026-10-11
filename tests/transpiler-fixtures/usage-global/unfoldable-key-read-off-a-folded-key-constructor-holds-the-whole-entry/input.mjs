// a read by a key no fold names, off a constructor taken through a computed key the claim folds - an effect ahead
// of the name, a const binding, a concat - may read any of its statics and loads the whole family, as off the
// plainly keyed constructor. a named static read off such a constructor loads that static alone
let k = 0;
const K = 'Map';
const { [(k++, 'Iterator')]: ViaEffect } = globalThis;
export const fromEffect = ViaEffect[['fr', 'om'].join('')]([1].values()).toArray();
const ViaBound = globalThis[K];
export const fromBound = ViaBound[['group', 'By'].join('')]([1], x => x).get(1);
const { ['U' + 'RL']: ViaConcat } = self;
export const fromConcat = ViaConcat[['can', 'Parse'].join('')]('a:b');
const { [(k++, 'Promise')]: Named } = globalThis;
export const settled = Named.allSettled([]);
