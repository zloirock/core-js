// user's project aliases core-js modules through `my-core-js`. with the same alias
// listed in `additionalPackages`, `scanExistingCoreJSImports` recognises the user's
// `my-core-js/modules/es.array.at` import as a core-js polyfill entry and dedups it
// against the canonical emission - only ONE polyfill import survives in the output.
// without `additionalPackages` the user's alias import stays in source and a SECOND
// canonical `core-js/modules/es.array.at` would be added, causing double-load
import 'my-core-js/modules/es.array.at';

[1, 2].at(-1);
