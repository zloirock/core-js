import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// the controls that keep the fold alive - nothing can short-circuit, so the operand IS the type its
// hint names and the constant answer is the polyfilled world's answer
export const literalReceiver = 'flat' in [1, [2]];