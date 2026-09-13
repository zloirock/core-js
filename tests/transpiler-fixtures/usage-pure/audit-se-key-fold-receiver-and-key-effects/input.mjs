// The receiver prefix and folded computed-key effect retain native order inside one declaration:
// capture the receiver first, evaluate the key expression next, then bind the pure static.
const e = [];
const { [(e.push('k'), 'fr') + 'om']: from } = (e.push('r'), Array);
export const r = [from, e];
