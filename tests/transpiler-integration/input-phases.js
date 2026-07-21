// pre+post CONTRACT probe: the PRE pass must see this mutation spelling before the sibling
// mangler (registered in the runner without enforce - the "normal" slot between our stages)
// rewrites it into a computed key no pass can read. with correct ordering the sibling never
// fires (pre already rewrote the spelling); with broken ordering it mangles the raw source
// first, the mutation goes unrecorded, and the runtime observes a pristine ponyfill instead
// of the user patch. the restore key is unreadable by construction (reassigned let) so the
// restore itself never records the mutation
const OriginalMap = Map;
globalThis.Map = class PatchedMap extends OriginalMap {
  static groupBy() { return 'patched'; }
};
export const results = {
  patched: Map.groupBy([1], x => x),
  control: [1, 2, 3, 4].filterReject(x => x % 2),
};
let restoreKey = 'Ma';
restoreKey += 'p';
globalThis[restoreKey] = OriginalMap;
