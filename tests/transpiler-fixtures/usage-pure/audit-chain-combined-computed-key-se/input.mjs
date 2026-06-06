// computed-key SequenceExpression on an optional polyfilled inner call: the key side effect must
// run exactly ONCE. the combine folds it into the single memo slot `_ref = (eff(), _flatMaybeArray(
// arr))`, then the trailing `.map` reuses `_ref.call(arr)` (binding `this`). both plugins agree -
// the computed-key inner resolves through the combined-chain path with the key SE folded in front
declare const arr: { flat?: () => number[] };
declare const eff: () => 'flat';
arr[(eff(), 'flat')]?.().map((x: number) => x);
