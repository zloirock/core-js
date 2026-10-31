// a call on a tail pulled into the guard's alternate comes along with it, or its receiver is lost:
// invoked off the ternary the callee reads as a bare value and `this` binds to undefined where the
// source binds the member it was read from. an optional call keeps its `?.(` inside the alternate,
// and a `new` callee, which binds no receiver, pulls like a plain tail.
const ut = () => globalThis;
export const unplannedCallTail = ut()?.window?.self?.chrome.foo(1);
export const unplannedOptionalCall = ut()?.window?.self?.chrome?.foo(2);
export const unplannedCallThenMember = ut()?.window?.self.foo().bar;
export const unplannedDeepCallChain = ut()?.window?.self.foo(1).bar.baz(2);
export function unplannedNewCallee() { return new (ut()?.window?.self?.CustomCtor)(1); }
const oc2 = () => globalThis;
export const pulledOptionalCall = oc2()?.window?.self.chrome.foo?.(1);
export const pulledOptionalCallThenMember = oc2()?.window?.self.chrome.foo?.(2).bar;
export const pulledSpreadCall = oc2()?.window?.self.chrome.foo(...[3]);
export function pulledNewCallee() { return new (oc2()?.window?.self.chrome.Ctor)(4); }
