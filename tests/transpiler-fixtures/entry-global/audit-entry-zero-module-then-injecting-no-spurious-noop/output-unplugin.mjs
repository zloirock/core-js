// a zero-module entry (`array/from`, empty under esmodules:true) sits adjacent to the directive
// prologue, and a module-injecting entry (`array/at`) follows a trailing string-literal. the file's
// TOTAL injected import block lands after the prologue and already breaks it, so NO `0;` placeholder
// is emitted for the removed zero-module entry. the directive-promotion is decided as a batch over the
// whole file (not an incremental left-to-right view that would see `0` modules at the first entry)
"use strict";
import "core-js/modules/es.array.at";
"use asm";
foo();