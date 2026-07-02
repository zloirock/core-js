// `additionalPackages` may repeat the main `package` or itself - resolver uses a `Set` over
// lowercased entries to dedup. hot-loop `stripPkgPrefix` hits main pkg first
Array.from(x);
