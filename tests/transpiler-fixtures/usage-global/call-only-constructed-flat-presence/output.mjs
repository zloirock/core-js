import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// A call-only declaration cannot prove the constructed instance; retain the original flat claim.
type CallOnly = {
  (): number[];
};
declare const callOnly: CallOnly;
// @ts-expect-error a function called with new is the shape under test
export const c = new callOnly().flat();