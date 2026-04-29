import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
// generator IIFE wraps the bare return in a Generator object - the receiver is the
// generator, not the yielded / returned value. inlining the body's return / yield as the
// receiver type would emit `es.string.starts-with` based on the literal string here, but
// the actual `.startsWith` call goes against Generator (and resolves to undefined at
// runtime - user error, but plugin must not over-inject)
(function* () {
  return 'preamble';
})().startsWith('p');
// sync IIFE control on a different method to isolate per-line origin of imports
(() => 'tail')().padEnd(8);