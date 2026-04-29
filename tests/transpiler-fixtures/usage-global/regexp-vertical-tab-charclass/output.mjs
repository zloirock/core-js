import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.regexp.test";
// regex literals must pass through verbatim; a vertical tab inside a character class must
// never be confused with a polyfill anchor.
const re = /[\v\t]/;
re.test('x');