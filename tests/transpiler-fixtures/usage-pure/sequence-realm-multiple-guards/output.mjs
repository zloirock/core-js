import _globalThis from "@core-js/pure/actual/global-this";
// A declined static claim retains both the sequence effect and its realm root.
export const r = (effect(), _globalThis).window?.self?.Object.groupBy;