// the `in` operator yields a boolean - a known non-string suppresses the injection
declare const obj: object;
const cmpIn = 'k' in obj;
use(cmpIn.codePointAt(0));
