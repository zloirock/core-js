// a destructure HOST over the stored value: the lift replays the kept assignment through the
// same canon instead of freezing raw hops into what the binding stores
let k12;
export const viaDestructureLift = (() => { const { Map: M } = (k12 = globalThis.self.window); return typeof M; })();
