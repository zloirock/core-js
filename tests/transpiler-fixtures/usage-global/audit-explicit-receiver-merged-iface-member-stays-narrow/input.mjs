// Negative counterpart to the via-`this` shadow bail: an EXPLICIT receiver access
// (`b.items`, not `this.items`) reads the named type's own merged-interface slot, so a
// subclass override is irrelevant. `b: Base` has `items: number[]`, so `b.items.at(-1)`
// stays narrowed to the array .at only - the bail must not fire for non-`this` reads.
class Base {}
interface Base { items: number[]; }
class Sub extends Base {
  items: any = 'x';
}
declare const b: Base;
b.items.at(-1);
