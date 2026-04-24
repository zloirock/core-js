// `console.log(_ref)` reads an undeclared name - sloppy global at runtime (or ReferenceError
// in strict module code). plugin's ref allocator must count this read as a reservation so
// its generated ref names don't collide: if the plugin allocated `_ref` for its own use,
// the user's phantom read would bind to the plugin's variable at runtime, turning a
// ReferenceError into an accidental success with unexpected value
console.log(_ref);
[1, 2, 3].at(0);
