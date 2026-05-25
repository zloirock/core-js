// for-init partial-consume + NON-PURE receiver + SE prefix. receiver `userGlobal` isn't
// a proxy-global, so `rewriteDeclarator` resolves `initSrc` via `original-source slice(tail)` instead
// of `pure import injection`. SE re-embed must still produce `{...} = (SE, userGlobal)` -
// exercises the structural slice in `for-init SE-sink injection` against an `initSrc` that
// is a user identifier rather than an injected polyfill name
declare const log: () => void;
const userGlobal = { Array };
for (const { Array: { from }, ...rest } = (log(), userGlobal); false; ) {
  console.log(from, rest);
}
