// Force plugin to allocate `_ref` for receiver memo on `getX().method()`.
// User has already declared `_ref`, so plugin must skip past it on its
// own UID allocation. Forces real interaction between user-declared
// `_ref` shadow and plugin allocator
let _ref = "preserved";
function getArr() { return [1, 2, 3]; }
function getOther() { return [4, 5, 6]; }
getArr().at(-1);
getOther().findLast(x => x > 0);
console.log(_ref);
