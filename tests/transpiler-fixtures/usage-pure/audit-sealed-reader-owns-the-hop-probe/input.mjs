// the `?.` READING an unbacked realm hop owns that hop's probe: the hop is the environment read the
// source wrote, and a drop that eats it answers the branch native short-circuits past. that reader
// stands behind whatever the source put between them - a paren, a stack of them - so the negatives
// pin the boundary: a PLAIN reader behind the same seal tests nothing and the run folds to the root
globalThis.deleteBox = { slot: 1 };
export const bareReader = delete globalThis.window?.deleteBox;
export const sealedReader = delete (globalThis.window)?.deleteBox;
export const doubleSealedReader = delete ((globalThis.window))?.deleteBox;
export const plainReaderBehindTheSeal = delete (globalThis.window).deleteBox;
