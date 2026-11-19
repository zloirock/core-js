// The retained store runs before the static read and keeps its prefix once.
let held;
export const { fromEntries: read } = (held = (effect(), globalThis)).Object;
export { held };
