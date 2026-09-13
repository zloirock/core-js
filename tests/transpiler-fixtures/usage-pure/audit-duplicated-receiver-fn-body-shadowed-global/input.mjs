// The function body inside a single captured receiver is polyfilled in its own scope. Its local Map
// remains unchanged, while the free Set is substituted. The instance method and outer sibling read
// that same captured object.
const { y: { at: a }, k } = { y: [() => { const Map = 1; return [Map, Set]; }], k: 1 };
export const r = [a, k];
