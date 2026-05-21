// nested IIFE: outer IIFE returns inner IIFE call, inner returns proxy-global.
// `isProxyGlobalIifeReturn` recurses through the inner call via the IIFE branch, validating
// that `peelIIFEReturn` + the recursive `isGlobalProxy` walk bottom out correctly
const out = (() => (() => globalThis)())().Array.from([1, 2, 3]);
out.at(0);
