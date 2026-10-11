// a static block and a static field initializer read `super` off the class's heritage as a static
// method does: over an alias the file may reassign, pure leaves the read as written and the
// constructor the alias may hold takes its whole entry
class ShimMap {}
let MaybeMap = Map;
if (globalThis.needsShim) MaybeMap = ShimMap;
export let grouped;
class InBlock extends MaybeMap {
  static {
    grouped = super.groupBy([1, 2], item => item % 2);
  }
}

class ShimPromise {}
let MaybePromise = Promise;
if (globalThis.needsShim) MaybePromise = ShimPromise;
class InField extends MaybePromise {
  static settled = super.allSettled([]);
}
export const { settled } = InField;
