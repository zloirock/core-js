// for-init partial-consume + NON-PURE receiver + SE prefix. receiver `userGlobal` isn't a
// proxy-global, so the init is taken from the original-source tail slice instead of an injected
// pure import. the SE re-embed must still produce `{...} = (SE, userGlobal)`, exercising the
// for-init SE-sink against a user identifier rather than an injected polyfill name.
declare const log: () => void;
const userGlobal = { Array };
for (const { Array: { from }, ...rest } = (log(), userGlobal); false; ) {
  console.log(from, rest);
}
