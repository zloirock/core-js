import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
// The optional constructor read keeps the environment probe's nullish branch.
// Array.of is polyfilled on the defined continuation; this is the only static claim in the file.
const probe = globalThis.window;
export const constructor = probe?.Array?.of(2);