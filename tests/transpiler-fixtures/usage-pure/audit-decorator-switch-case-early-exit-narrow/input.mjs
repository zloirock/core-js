// decorator argument arrow with a switch-case that has an early-return for non-string
// branch. the guard narrows `x: number | string` to `string` within the remaining code
// path, so `.at(0)` on it routes to the String-specific instance polyfill rather than the
// generic fallback. switch-case consequent positioning must be treated the same way as
// block-body positioning for the guard-walk
function dec(fn: (x: number | string, k: 'a' | 'b') => void) { return (_: any) => _; }

@dec((x, k) => {
  switch (k) {
    case 'a':
      if (typeof x !== 'string') return;
      x.at(0);
      break;
  }
})
class A {}
