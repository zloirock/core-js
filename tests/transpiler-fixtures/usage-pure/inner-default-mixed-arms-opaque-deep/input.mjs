function viaOpaqueKey(o) { const { p: { Set: S, Array: { of } } = globalThis } = o; return [S, of(7)]; }
function viaOpaqueTwoLevels(o) { const [{ k: { Set: S, Array: { of } } = globalThis } = {}] = o; return [S, of(7)]; }
export const opaqueDeep = [viaOpaqueKey({}), viaOpaqueTwoLevels([])];
