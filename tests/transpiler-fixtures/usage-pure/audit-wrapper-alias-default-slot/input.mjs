// a wrapper alias whose slot union is a LONE DEFAULT: the pairing is an over-approximation - the
// object spread hides the key the runtime actually pairs - so the default is not certain to fire
// and the pure follow declines; the destructure stays native, only the proxy-global rewrites
const src = { wrapper: [{ Object: { fromEntries: () => "user" } }] };
const { wrapper = [globalThis] } = { ...src };
export const [{ Object: { fromEntries: viaDefault } }] = wrapper;
export const defaultResolved = viaDefault([["k", 1]]);
