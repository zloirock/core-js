import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// An unwritten array alias preserves the family of each literal element.
// Distinct methods expose Array and String inference without sharing injected modules.
const arrays = [[1, 2]];
const arrayAlias = arrays;
use(arrayAlias[0].at);
const strings = ['12'];
const stringAlias = strings;
use(stringAlias[0].includes);