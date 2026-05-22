// Single entry with NO directive prologue ahead of it. After removal the string-literal
// expression slides into body position 0. There is no pre-existing directive context to
// disturb, so the promotion guard intentionally lets the literal land where it lands -
// the resulting prologue is the source's NEW first statement, an accepted consequence of
// rewriting an import-only top-of-file. NO `0;` placeholder is injected.
import "core-js/actual/array/from";
"use bogus";
foo();
