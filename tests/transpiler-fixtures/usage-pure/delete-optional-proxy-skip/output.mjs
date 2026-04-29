import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// `.foo` / `.bar` are not known polyfillable members, so the member-side polyfill is
// skipped. The receivers `globalThis` / `self` still resolve to their own polyfills.
delete _globalThis.foo;
delete _self.bar;