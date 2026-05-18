// for-init partial-consume + MULTIPLE SE prefix elements. all leading expressions
// re-embed at the receiver slot of the preserved declarator's init so native
// `(a(), b(), receiver)` eval order survives: emit shape `{...} = (a(), b(), _globalThis)`
declare const a: () => void;
declare const b: () => void;
for (const { Array: { from }, ...rest } = (a(), b(), globalThis); false; ) {
  console.log(from, rest);
}
