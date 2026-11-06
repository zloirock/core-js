// computed key with optional access on `Symbol?.iterator`: the well-known symbol must
// still be recognised through the optional access form.
const obj = {};
obj[Symbol?.iterator];
obj[Symbol?.iterator]();
