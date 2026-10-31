// a BLOCK-scoped shadow declared AFTER the alias captured its value must not retype it: the
// alias resolves in its own declaration scope, where the shadow is not yet in scope
const blockRoot = Array;
export function viaBlockShadow() {
  const blockLink = blockRoot;
  {
    const blockRoot = {};
    const { from } = blockLink;
    return from([1]);
  }
}
