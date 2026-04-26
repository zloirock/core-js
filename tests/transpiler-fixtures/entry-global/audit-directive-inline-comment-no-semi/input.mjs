// directive prologue followed by inline comment and a missing semicolon must round-trip
// preserved through the entry rewrite.
"use strict" // marker
import "core-js/actual/promise/try";
foo();
