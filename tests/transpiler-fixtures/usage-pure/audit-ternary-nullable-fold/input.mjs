// a ternary's statically-nullable branch folds away, so the survivor narrows the
// receiver - in an expression body, a block-body return, and any value position alike
const arr: number[] = [1];
const exprBody = (c: boolean) => c ? arr : null;
exprBody(true).at(0);
const blockBody = (c: boolean) => { return c ? arr : null; };
blockBody(true).flat();
// conflicting non-nullable branches still bail to the generic dispatcher
const conflict = (c: boolean) => c ? arr : 's';
// @ts-expect-error a call on a union receiver tsc cannot type is the shape under test
conflict(true).includes(1);
