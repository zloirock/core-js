import _Array$from from "@core-js/pure/actual/array/from";
// for-init partial-consume + NON-PURE receiver + SE prefix. receiver `userGlobal` isn't
// a proxy-global, so `rewriteDeclarator` resolves `initSrc` via `nodeSrc(tail)` instead
// of `injectPureImport`. SE re-embed must still produce `{...} = (SE, userGlobal)` -
// exercises the structural slice in `injectForInitSESinks` against an `initSrc` that
// is a user identifier rather than an injected polyfill name
declare const log: () => void;
const userGlobal = {
  Array
};
for (const from = _Array$from, {
    Array: _unused,
    ...rest
  } = (log(), userGlobal); false;) {
  console.log(from, rest);
}