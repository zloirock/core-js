import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
// A decided caller argument runs its prefix before its sole instance read.
// With no later parameter or argument work, that read needs no deferred wrapper.
let effects = 0;
export const method = (({
  at
}) => at)(typeof Symbol !== 'undefined' ? (effects++, []) : null);
export { effects };