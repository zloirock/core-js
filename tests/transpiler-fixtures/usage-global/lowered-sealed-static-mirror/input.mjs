// A method read after a lowered sealed realm keeps its own value.
// The remaining method key cannot resolve back to the constructor.
let memo;
const ref = (source(), ((memo = globalThis.window) == null ? void 0 : memo.self).self.Map);
export const length = ref[(key(), 'groupBy')].length;
