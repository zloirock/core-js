import "core-js/modules/es.array.fill";
// Every reachable computed-key value contributes its method import. Dominating writes replace dead candidates; prototype and
// string-spelled symbol keys add no method.
const arr = [1, 2];
let symbolBranch = 'fill';
if (c) symbolBranch = 'Symbol.iterator';
export const viaSymbolString = arr[symbolBranch];