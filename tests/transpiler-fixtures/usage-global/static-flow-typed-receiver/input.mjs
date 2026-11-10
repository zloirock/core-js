// Type assertions do not remove reachable values or the source receiver check.
const { allSettled: { name } } = ((globalThis.window?.self) as typeof globalThis).Promise; use(name);
export {};
