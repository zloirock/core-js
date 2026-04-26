// `.foo` / `.bar` are not known polyfillable members, so the member-side polyfill is
// skipped. The receivers `globalThis` / `self` still resolve to their own polyfills.
delete globalThis?.foo;
delete self?.bar;
