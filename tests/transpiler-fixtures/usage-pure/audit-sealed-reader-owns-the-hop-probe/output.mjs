import _globalThis from "@core-js/pure/actual/global-this";
// the `?.` READING an unbacked realm hop owns that hop's probe: the hop is the environment read the
// source wrote, and a drop that eats it answers the branch native short-circuits past. that reader
// stands behind whatever the source put between them - a paren, a stack of them - so the negatives
// pin the boundary: a PLAIN reader behind the same seal tests nothing and the run folds to the root
_globalThis.deleteBox = {
  slot: 1
};
export const bareReader = delete _globalThis.window?.deleteBox;
export const sealedReader = delete _globalThis.window?.deleteBox;
export const doubleSealedReader = delete _globalThis.window?.deleteBox;
export const plainReaderBehindTheSeal = delete _globalThis.deleteBox;