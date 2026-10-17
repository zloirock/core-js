// A prefixed parameter default runs once before extracting its nested instance method.
// Caller-supplied objects retain their own properties and bypass the prefix.
let prefixes = 0;
function read({ m: { at } } = (prefixes++, { m: [1, [2]] })) { return at; }
console.log(read(), prefixes);
