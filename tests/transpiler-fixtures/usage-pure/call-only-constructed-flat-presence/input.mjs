// A call-only declaration cannot prove the constructed instance; retain the original flat claim.
type CallOnly = { (): number[] };
declare const callOnly: CallOnly;
// @ts-expect-error a function called with new is the shape under test
export const c = new callOnly().flat();
