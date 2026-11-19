// a SEALED probe read - parens closing the chain - keeps the source's throw: what follows the seal
// reads the short-circuited value instead of riding the guard, so assignment, update and destructure
// targets and a sealed callee stay outside the ternary. an unsealed parenthesized callee or tag keeps a
// `?.` there instead, so a present member call keeps its receiver and an absent one still throws.
const ut = () => globalThis;
export const sealedUnplannedTail = (ut()?.window?.self).chrome;
globalThis.slotHost = { n: 1 };
const aw = () => globalThis;
export function assignThroughGuard() { (aw()?.window?.self).slotHost.n = 10; }
export function updateThroughGuard() { (aw()?.window?.self).slotHost.n++; }
export function destructureThroughGuard() { [(aw()?.window?.self).slotHost.n] = [7]; }
globalThis.parenHost = { fn(x) { return x; }, Ctor: Map };
const pc = () => globalThis;
export const parenCalleeStaysOutside = (pc()?.window?.self.parenHost.fn)(2);
export const parenCalleeSealed = ((pc()?.window?.self).parenHost.fn)(3);
export function newOverPulledTail() { return new (pc()?.window?.self.parenHost.Ctor)(); }
globalThis.tagHost = { tag(strings) { return strings[0]; } };
const tg = () => globalThis;
export const taggedTemplateTail = (tg()?.window?.self.tagHost.tag)`x`;
