// The receiver prefix and folded computed-key effect retain native order inside one declaration:
// the receiver's effect runs first, the key expression next, then the pure static binds.
const e = [];
const { [(e.push('k'), 'fr') + 'om']: from } = (e.push('r'), Array);
export const r = [from, e];
