// TS twin of the mid-chain wrapper collapse: a cast around the proxy-hop segment of a
// chain-assignment-rooted navigation (`((a = globalThis).self as any).Array`) is a transparent
// wrapper both collapse walks must step through; the wrapper tokens drop with the hop.
let a: any;
export const { flat } = ((a = globalThis).self as any).Array.prototype;
export const at = ((a = globalThis).self as any).Array.prototype.at;
