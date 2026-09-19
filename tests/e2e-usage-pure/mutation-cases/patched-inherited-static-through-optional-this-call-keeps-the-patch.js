import { restoreProperty } from '../../helpers/restore-property.cjs';

// a PATCHED inherited static reached via `this.X?.()` in a static method with two trailing
// instance polyfills: the optional must dispatch to the patch (no deopt to the pure static),
// while the trailing methods still polyfill against the patch's result. live oracle for the
// chain-combine keeping ownership of a mutated inherited static (bailing it stranded the
// trailing polys as overlapping rewrites - a composition crash at transform time)
QUnit.test('mutated-statics: patched inherited static through optional this-call keeps the patch', assert => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(Array, 'from');

  Array.from = function patched() {
    return [8, [9]];
  };
  try {
    class C extends Array {
      static make() {
        return this.from?.([1, 2]).flat().at(-1);
      }
    }
    assert.same(C.make(), 9);
  } finally {
    restoreProperty(Array, 'from', originalDescriptor);
  }
});
