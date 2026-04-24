// `Map ||= X` and friends on a bare global Identifier. the LHS read of an unbound global
// gets its polyfill attempt short-circuited: the import binding the plugin would substitute
// is read-only, so assigning to it throws. plugin emits a warning and leaves the statement
// raw; the runtime engine must already provide Map for this code to work
Map ||= {};
Map &&= {};
Map ??= {};
