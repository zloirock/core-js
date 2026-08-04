// `in` folds to a constant only while its right operand cannot be the undefined that `in` THROWS
// on. the receiver hint here comes from the CALL's return type, which knows nothing of the optional
// link above it: folding there answers `true` where native throws, and erases the receiver's own
// evaluation with it. the parens make no difference - sealing an optional chain keeps the value
// undefined, it only stops the short-circuit from reaching what follows.
// the receiver must be TYPED for the fold to be reachable at all: a untyped host resolves to no
// hint and the row would pass whatever the gate says
const src = [3, [1, 2]];
const words = ['ab', 'cd'];
export function probes(absent) {
  const arr = absent ? null : src;
  const list = absent ? null : words;
  return [
    'flat' in (arr?.slice()),
    'at' in arr?.slice(),
    'includes' in (list?.concat([])),
    'entries' in arr?.slice().slice(),
  ];
}
// the controls that keep the fold alive - nothing can short-circuit, so the operand IS the type its
// hint names and the constant answer is the polyfilled world's answer
export const literalReceiver = 'flat' in [1, [2]];
export const plainCallReceiver = 'at' in src.slice();
export const chainedPlainCall = 'includes' in words.concat([]).slice();

// the STATIC host asks the same nullish question: a proxy hop that can short-circuit hands `in` the
// undefined it throws on, so the constant cannot simply replace the test there either. the controls
// below keep the static fold reachable - a bare global host is never nullish
export const staticBehindProxyHop = 'from' in globalThis.window?.Array;
export const staticBehindPlainHop = 'of' in globalThis.Array;
export const staticBareHost = 'fromAsync' in Array;

// the logical operators are NOT symmetric for this question. `&&` yields its LEFT whenever that is
// falsy, and every falsy value is one `in` throws on - so it can hand `in` a bad operand even when
// both sides look like arrays. `||` and `??` yield the left only when it is usable, so only their
// right operand can carry a bad value through. an always-truthy object literal on the left of `&&`
// is the one shape that keeps the fold
export function logicalReceivers(absent) {
  const arr = absent ? null : src;
  return [
    'flat' in (arr && src.slice()),
    'at' in (arr || src.slice()),
    'includes' in (arr ?? src.slice()),
    'entries' in ([1] && src.slice()),
  ];
}

// composition: the fold DISCARDS its operands, replaying only calls and structural effects - so an
// operand carrying an `in` of its own must not be erased, or the inner test's throw goes with it.
// the rows walk the wrap meeting other transforms: a nav inside it, a chained dispatch (whose ref
// memo makes a sibling wrap the arrow body), two wraps in one expression, and a wrap in the TEST
// of another one
export function composedWraps(absent) {
  const arr = absent ? null : src;
  return [
    'flat' in (arr?.slice(globalThis.window?.self.Math.trunc(0.5))),
    (() => 'at' in (arr?.slice().concat([4])))(),
    ['flat' in (arr?.slice()), 'at' in (arr?.slice())],
    'flat' in (('at' in (arr?.slice())) ? src.slice() : src),
  ];
}
