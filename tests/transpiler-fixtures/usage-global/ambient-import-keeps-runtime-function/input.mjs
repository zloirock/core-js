// An inline type import does not replace the local function with a polyfill.
import { type default as structuredClone } from "@core-js/pure/actual/structured-clone";
function structuredClone() { return "user"; }
export const result = structuredClone();
