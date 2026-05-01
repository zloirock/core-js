// User-declared `class _ref` reserves the bare slot. Plugin must shift
// to `_ref2` when allocating its own ref. Distinct from var/let path
// because class binding lives in lexical scope (kind: 'let')
class _ref {
  static fromList(xs) {
    return xs.findLastIndex(x => x > 0);
  }
}
const arr = [1, 2, 3];
arr.at(0);
arr.flatMap(x => [x]);
_ref.fromList(arr);
