// `console.log(_ref)` reads an undeclared `_ref` (sloppy global / ReferenceError in ESM).
// babel's isNameTaken checks `program.references[name]` - this read is counted, so `_ref`
// is reserved and the allocation shifts to `_ref2`. unplugin's `collectAllBindingNames`
// only tracks DECLARATIONS / AssignmentExpression LHS - an undeclared read isn't reserved,
// so unplugin allocates `_ref`, emitting `var _ref;` that then binds the user's phantom
// `_ref` read to plugin's variable. this turns a ReferenceError into an undefined read
console.log(_ref);
[1, 2, 3].at(0);
