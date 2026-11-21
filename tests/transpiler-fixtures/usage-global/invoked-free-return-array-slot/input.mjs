// The global method keeps its normal presence injection beside a user-installed mutation.
// A literal return container retains the scope of its free value.
const patched = () => 'abc';
function pick() { return [Array]; }
pick.apply(null, [])[0].from = patched;
export const result = Array.from([1]).at(0);
