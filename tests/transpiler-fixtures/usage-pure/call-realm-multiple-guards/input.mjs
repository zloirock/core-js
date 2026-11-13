// A call-returned realm keeps its environment probe while serving the static.
export const r = (() => globalThis)().window?.self?.Promise.race;
