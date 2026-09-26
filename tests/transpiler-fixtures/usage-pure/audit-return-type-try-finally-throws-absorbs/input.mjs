// a finalizer that unconditionally throws absorbs try/catch returns: the try's
// `return [1,2,3]` is shadowed by the throw and never observed. always-exits covers
// throw/break/continue too, so this is an unconditional override despite no finalizer
// return; the try branch contributes nothing and `return 'fallback'` types the fn as
// string. without the gate the resolver merges Array + string, disagrees, and bails.
declare const cond: boolean;
function probe() {
  if (cond) {
    try {
      return [1, 2, 3];
    } finally {
      throw new Error('always');
    }
  }
  return 'fallback';
}
probe().at(0);
