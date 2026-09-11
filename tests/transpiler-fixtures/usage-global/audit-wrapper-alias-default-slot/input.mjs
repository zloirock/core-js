// the inject-if-might twin of the pure lone-default decline: the default's value is a POSSIBLE
// slot value, and a wrong guess over-injects - the safe direction - so the leaf claim through
// the defaulted wrapper alias still pulls its module
const src = { wrapper: [{ Object: { fromEntries: () => "user" } }] };
const { wrapper = [globalThis] } = { ...src };
export const [{ Object: { fromEntries: viaDefault } }] = wrapper;
export const defaultResolved = viaDefault([["k", 1]]);
