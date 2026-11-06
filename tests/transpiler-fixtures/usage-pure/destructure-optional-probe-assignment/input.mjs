// A consumed assignment keeps its key below the optional test.
const log = [];
let of;
({ of } = globalThis.window?.[(log.push([7].at(0)), 'Array')]);
export const result = [of(3), log];
