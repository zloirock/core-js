// A cast-sealed receiver keeps its optional guard. Only a non-null receiver evaluates
// the computed key and selects the pure static.
let c3 = 0;
export const { [(c3++, 'freeze')]: castSealSeKeyResidual } = ((globalThis.window?.self) as any).Object;
export { c3 };
