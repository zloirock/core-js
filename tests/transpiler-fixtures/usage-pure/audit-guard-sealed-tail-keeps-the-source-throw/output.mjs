import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
// a SEALED probe read - parens closing the chain - keeps the source's throw: what follows the seal
// reads the short-circuited value instead of riding the guard, so assignment, update and destructure
// targets and a sealed callee stay outside the ternary. an unsealed parenthesized callee or tag keeps a
// `?.` there instead, so a present member call keeps its receiver and an absent one still throws.
const ut = () => _globalThis;
export const sealedUnplannedTail = (null == ut().window ? void 0 : _self).chrome;
_globalThis.slotHost = {
  n: 1
};
const aw = () => _globalThis;
export function assignThroughGuard() {
  (null == aw().window ? void 0 : _self).slotHost.n = 10;
}
export function updateThroughGuard() {
  (null == aw().window ? void 0 : _self).slotHost.n++;
}
export function destructureThroughGuard() {
  [(null == aw().window ? void 0 : _self).slotHost.n] = [7];
}
_globalThis.parenHost = {
  fn(x) {
    return x;
  },
  Ctor: _Map
};
const pc = () => _globalThis;
export const parenCalleeStaysOutside = ((null == pc().window ? void 0 : _self)?.parenHost.fn)(2);
export const parenCalleeSealed = (null == pc().window ? void 0 : _self).parenHost.fn(3);
export function newOverPulledTail() {
  return new (null == pc().window ? void 0 : _self.parenHost.Ctor)();
}
_globalThis.tagHost = {
  tag(strings) {
    return strings[0];
  }
};
const tg = () => _globalThis;
export const taggedTemplateTail = ((null == tg().window ? void 0 : _self)?.tagHost.tag)`x`;