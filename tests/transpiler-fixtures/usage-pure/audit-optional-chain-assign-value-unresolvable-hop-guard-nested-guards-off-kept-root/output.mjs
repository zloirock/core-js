import _globalThis from "@core-js/pure/actual/global-this";
// several `?.` down the same kept root. rebuilding the surviving hops over the collapsed binding
// may force the connector sitting DIRECTLY on it non-optional - sound for a substituted root,
// which is always defined, but a kept root is not: that connector is live and must be re-emitted
let ng;
export const nestedGuardsOffKeptRoot = (ng = _globalThis.window)?.Array?.prototype.some?.call([1], x => x);