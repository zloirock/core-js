// regex literals must pass through verbatim; a vertical tab inside a character class must
// never be confused with a polyfill anchor.
const re = /[\v\t]/;
re.test('x');
