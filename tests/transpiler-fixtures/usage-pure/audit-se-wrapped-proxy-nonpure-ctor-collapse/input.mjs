// A SE-wrapped proxy-global chain whose ctor is NOT pure-polyfilled (web-API `Headers` / `Element` / `Range`,
// no `_Headers`): the ctor can't swap to a pure binding, but the proxy-global root must still rewrite to the
// pure `_globalThis` - a bare `globalThis` is a ReferenceError in ie:11. The `.self` / `.window` hop resolves
// to the global in browsers (the target); the buried call effect is preserved. Distinct ctors / member forms
// per line: terminal ctor read, prototype-method read, optional prototype chain through a `.window` hop.
let log = [];
function eff(tag) {
  log.push(tag);
  return tag;
}
const ctorRead = (eff('a'), globalThis.self).Headers;
const protoMethod = (eff('b'), globalThis.self).Element.prototype.remove;
const optionalProto = (eff('c'), globalThis.window).Range?.prototype?.cloneRange;
export { ctorRead, protoMethod, optionalProto, log };
