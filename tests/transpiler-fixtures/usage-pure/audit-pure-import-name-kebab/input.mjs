// pure-import binding name for instance methods: kebab-case method names from the entry
// path are converted to camelCase with a `Maybe<Type>` suffix derived from the entry's
// type segment. `array/instance/to-reversed` produces `toReversedMaybeArray`, matching
// the naming used by type-guard-aware resolution
[].toReversed();
