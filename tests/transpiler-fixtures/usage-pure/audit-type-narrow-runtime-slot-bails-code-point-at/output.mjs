// the `in` operator yields a boolean - a known non-string suppresses the injection
declare const obj: object;
const cmpIn = 'k' in obj;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
use(cmpIn.codePointAt(0));