// catch destructure with a polyfill in an entry prop's DEFAULT (`it = [9].flat()`) AND in a
// non-entry prop's computed KEY (`[[1].at(0)]`). both drain paths (entry-default compose +
// whole-prop key compose) must coexist over the single `_ref` overwrite without orphaning either.
// the entry is listed FIRST so both plugins evaluate keys/defaults in source order: the AST-based
// plugin hoists an entry's extraction above the residual destructure, so a non-entry polyfilled
// key placed before the entry would reorder the ops between the two plugins. regression lock
try {} catch ({ [Symbol.iterator]: it = [9].flat(), [[1].at(0)]: b }) { b; it; }
