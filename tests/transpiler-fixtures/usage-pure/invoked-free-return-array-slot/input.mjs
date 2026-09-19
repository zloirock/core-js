// A literal return container retains the scope of its free value.
function pick() { return [Array]; }
pick.apply(null, [])[0].from = patched;
export const result = Array.from([1]);
