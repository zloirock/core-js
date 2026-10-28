// A setter target receives the source realm before the static extraction.
const source = { set realm(value) { mark(value); } };
export const { of: read } = (source.realm = globalThis).Array;
