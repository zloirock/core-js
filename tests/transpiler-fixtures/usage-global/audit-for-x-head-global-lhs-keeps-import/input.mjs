// A nonempty assignment head writes the global on each iteration. In a module, a missing
// binding throws at the write. An empty loop never assigns. Global mode emits side-effect imports for both targets.
for (Map of [1]) {}
for (Set in {}) {}
