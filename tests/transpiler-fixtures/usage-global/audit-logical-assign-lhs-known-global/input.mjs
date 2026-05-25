// `Map ||= 1` in usage-global mode: side-effect polyfill imports populate the global before
// module body runs, so `||=` reads Map (truthy) and no-ops. plugin doesn't rewrite write-
// context globals -> no polyfill emission at this site, no warning (only pure mode warns
// because the rewrite substitutes a read-only import binding and write would TypeError)
Map ||= 1;
