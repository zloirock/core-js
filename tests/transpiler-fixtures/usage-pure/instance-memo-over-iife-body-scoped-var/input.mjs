// an instance-method memo (the outer `.at`) wraps an IIFE whose body hosts another instance
// method needing its own block-scoped `var _ref;`. that scoped var must compose into the
// enclosing memo overwrite, not be emitted as a raw insert inside it (MagicString can't fold an
// insert into an overwritten chunk). covers both the function-IIFE and arrow-IIFE block bodies
(function () { [9].at(0); return [1]; })().at(0);
(() => { [3].at(0); return [2]; })().at(0);
