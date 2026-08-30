// when the split receiver keeps a PROVEN chain above its memo, the chain's first key may still name
// a polyfilled constructor - it must be spelled from the pure import, not read off the memo. read
// raw (`_ref.Promise[k]`) it asks the ponyfill root for a slot no host without the built-in has,
// and the entry that would have supplied it never gets imported. the plain static below keeps no
// chain and is the negative half
let v, g, out, k;
function eff() {}
out = (g = globalThis, v = g[(eff(), 'window')]?.self)?.Promise[k].at.name;
export const read = out;
export const race = (g = globalThis, v = g[(eff(), 'window')]?.self)?.Promise.race([]);
