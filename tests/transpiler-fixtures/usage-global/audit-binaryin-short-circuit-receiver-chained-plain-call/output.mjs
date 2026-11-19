import "core-js/modules/es.array.concat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.slice";
import "core-js/modules/es.array.species";
const words = ['ab', 'cd'];
export const chainedPlainCall = 'includes' in words.concat([]).slice();