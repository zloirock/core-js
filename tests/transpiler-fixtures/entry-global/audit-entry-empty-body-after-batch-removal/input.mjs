// Body contains only a directive prologue plus a single core-js entry; no statements follow.
// Modern targets emit an empty module set for the entry. The promotion guard short-circuits
// here because the next surviving sibling is `undefined` (off the end of the body), so the
// literal-expression predicate fails and the entry is removed cleanly. NO `0;` placeholder
// is needed - there is nothing past the prologue that could be promoted.
"use strict";
import "core-js/actual/array/from";
