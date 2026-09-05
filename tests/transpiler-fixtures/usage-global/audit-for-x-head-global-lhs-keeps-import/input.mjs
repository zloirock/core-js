// usage-global: a for-of / for-in head reads the bound global before the per-iteration write, so
// the side-effect polyfill IS still injected (else IE11 ReferenceError); the identifier stays a bare
// global (global mode never rewrites it to an import binding), so there is no const-write hazard
for (Map of [1]) {}
for (Set in {}) {}
