import _Array$from from "@core-js/pure/actual/array/from";
// for-init partial-consume + NON-PURE receiver + SE prefix. receiver `userGlobal` isn't a
// proxy-global, so the init is taken from the original-source tail slice instead of an injected
// pure import. the SE re-embed must still produce `{...} = (SE, userGlobal)`, exercising the
// for-init SE-sink against a user identifier rather than an injected polyfill name.
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