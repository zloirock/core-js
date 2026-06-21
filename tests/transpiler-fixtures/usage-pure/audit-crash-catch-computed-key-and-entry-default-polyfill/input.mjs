// catch destructure with a polyfill in an entry prop's DEFAULT (`it = [9].flat()`) AND in a
// non-entry prop's computed KEY (`[[1].at(0)]`). both extraction paths must coexist over the
// single `_ref` overwrite without orphaning either; the entry is listed FIRST so a non-entry
// polyfilled key before it does not reorder ops between the AST and text plugins. regression lock
try {} catch ({ [Symbol.iterator]: it = [9].flat(), [[1].at(0)]: b }) { b; it; }
