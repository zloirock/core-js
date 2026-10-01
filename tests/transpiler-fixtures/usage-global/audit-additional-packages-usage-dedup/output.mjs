import "core-js/modules/es.array.at";
// User aliases core-js as `my-core-js` and lists the alias in `additionalPackages`.
// A pre-existing `my-core-js/modules/es.array.at` import is recognised as a polyfill
// entry and deduped against the canonical emission, so only ONE polyfill import survives.

[1, 2].at(-1);