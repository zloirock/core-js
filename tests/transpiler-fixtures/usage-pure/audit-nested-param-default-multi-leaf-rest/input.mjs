// multi-leaf nested param default WITH a rest sibling stays VERBATIM: rest collects the
// receiver's remaining enumerable keys, and an app-extended constructor (`Array.myHelper = x`)
// legitimately feeds it - a synthesized default literal cannot mirror unknown keys, so
// replacing the receiver would break rest. the leaves stay native too (caller-soundness:
// no body / pattern mutation on a declared function); usage-global injection covers targets
export function f({ Array: { from = null, of, ...rest } } = globalThis) {
  return [from([1]), of(2), rest];
}
