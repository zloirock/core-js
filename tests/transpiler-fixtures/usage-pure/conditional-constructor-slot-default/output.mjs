import _Symbol from "@core-js/pure/actual/symbol";
// A well-known symbol must be present before the user's leaf default is considered.
let S;
if (true) S = _Symbol;
const {
  iterator: value = 'fallback'
} = S;
export const result = typeof value;