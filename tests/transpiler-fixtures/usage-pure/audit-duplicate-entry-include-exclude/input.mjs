// entry-path `array/from` appears in both include and exclude. previously duplicate
// detection only covered module patterns, so entry-path duplicates silently let exclude
// win (no polyfill emitted). fix: unified duplicate check across include/exclude covers
// both module and entry patterns. user gets a clear "matched by both" validation error
Array.from(x);
