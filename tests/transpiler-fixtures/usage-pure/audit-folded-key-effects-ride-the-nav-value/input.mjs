// a navigation whose collapsed hop carries a COMPUTED key with effects still spells as a VALUE: the
// key effects replay ahead of the ponyfill leaf, in the order native evaluates them. turned away from
// the value form, the same navigation every other spelling folds earned an environment probe instead
let v, g, out;
function eff() {}
out = (g = globalThis, v = g[(eff(), 'window')].self).Promise.race.zzz.name;
export const read = out;
