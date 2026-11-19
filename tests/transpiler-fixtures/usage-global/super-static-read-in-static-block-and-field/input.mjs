// a static block and a static field initializer read `super` off the class's heritage as a static
// method does, so the static is injected for the constructor the heritage alias may hold
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
