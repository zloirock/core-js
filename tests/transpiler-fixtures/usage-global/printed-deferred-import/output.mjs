import "core-js/modules/es.array.at";
// A deferred namespace must not evaluate eagerly after an unrelated injection.
import defer * as ns from "printer-lazy";
export const read = () => ns.read([7].at(0));