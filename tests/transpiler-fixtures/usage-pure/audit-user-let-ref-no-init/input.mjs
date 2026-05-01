// User-declared `let _ref;` without init followed by reassignment.
// Plugin must treat `_ref` as a real user binding and skip past it
// when allocating its own ref slots
let _ref;
_ref = [1, 2];
console.log(_ref);
[3, 4].at(0);
