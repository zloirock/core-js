import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.splice";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// usage-global twin of the method-extraction bail: a registry method read outside a call
// position may be called later as any mutator, so the read injects BOTH families
const extracted = [[1], [2]];
const m = extracted.splice;
export const viaMutatorExtraction = extracted[0].includes(5);