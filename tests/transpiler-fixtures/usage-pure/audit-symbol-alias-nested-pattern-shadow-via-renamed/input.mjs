// the renamed top-level form still folds; an assignment-form top-level folds too
const { iterator: renamed } = Symbol;
export const viaRenamed = [5, 6][renamed];
