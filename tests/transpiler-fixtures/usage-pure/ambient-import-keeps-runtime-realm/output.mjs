// A type-only import must not turn a local object into the realm global.
import type { default as globalThis } from "@core-js/pure/actual/global-this";
const globalThis = {
  Array: {
    from: () => 19
  }
};
export const result = globalThis.Array.from();