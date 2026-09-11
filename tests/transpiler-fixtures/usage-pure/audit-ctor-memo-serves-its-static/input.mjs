// the guard memo holds a CONSTRUCTOR read off the realm, and the static claim rebuilt onto the ref
// has to resolve through it. two halves were missing: the memo was never tagged with the ctor it
// holds, and a minted blind alias read as UNBOUND, so the resolver took the would-be-global branch
// where `_ref` names nothing - the static then read raw off the ponyfill with no import at all.
// a memo holding the SURFACE keeps the unbound reading: this leg's own surface routes resolve it
let v, out, storeProbe, storeKey;
storeProbe = (v = globalThis).window?.self.Number?.MAX_SAFE_INTEGER.name;
storeKey = (v = globalThis)[(0, 'window')]?.self.Number?.MAX_SAFE_INTEGER.name;
out = [storeProbe, storeKey];
export const read = out;
