import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a call on a tail pulled into the guard's alternate comes along with it, or its receiver is lost:
// invoked off the ternary the callee reads as a bare value and `this` binds to undefined where the
// source binds the member it was read from. an optional call keeps its `?.(` inside the alternate,
// and a `new` callee, which binds no receiver, pulls like a plain tail.
const ut = () => _globalThis;
export const unplannedCallTail = null == ut().window ? void 0 : _self.chrome.foo(1);
export const unplannedOptionalCall = (null == ut().window ? void 0 : _self.chrome)?.foo(2);
export const unplannedCallThenMember = null == ut().window ? void 0 : _self.foo().bar;
export const unplannedDeepCallChain = null == ut().window ? void 0 : _self.foo(1).bar.baz(2);
export function unplannedNewCallee() {
  return new (null == ut().window ? void 0 : _self.CustomCtor)(1);
}
const oc2 = () => _globalThis;
export const pulledOptionalCall = null == oc2().window ? void 0 : _self.chrome.foo?.(1);
export const pulledOptionalCallThenMember = null == oc2().window ? void 0 : _self.chrome.foo?.(2).bar;
export const pulledSpreadCall = null == oc2().window ? void 0 : _self.chrome.foo(...[3]);
export function pulledNewCallee() {
  return new (null == oc2().window ? void 0 : _self.chrome.Ctor)(4);
}