import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// A `delete` whose operand calls a static off a realm navigation names no reference to delete: the
// call runs once on the static's own entry, after any effect the navigation's root buries, and the
// navigation folds with no guard.
let n = 0;
export const invokedClaim = delete globalThis.window.self?.Array?.of(5);
export const invokedClaimSeq = delete (n++, globalThis.window).self?.Array?.from([6]);
export const invokedStaticSeq = delete (n++, globalThis.window).self?.Object?.fromEntries([]);