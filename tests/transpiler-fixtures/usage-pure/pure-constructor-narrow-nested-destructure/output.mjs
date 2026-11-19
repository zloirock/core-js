// An explicitly imported narrow Promise constructor keeps its native nested all read.
// Literal-wrapper analysis does not silently widen or replace that user import.
import P from "@core-js/pure/actual/promise/constructor.js";
export const {
  P: {
    all
  }
} = {
  P
};