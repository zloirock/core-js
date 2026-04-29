// Map.counter++ - the member is the target of an increment/decrement operator. Should NOT
// mark as usage of Map.counter (read-only polyfill semantics), but the Map constructor itself
// is still a live reference - need its constructor polyfill.
Map.counter++;
