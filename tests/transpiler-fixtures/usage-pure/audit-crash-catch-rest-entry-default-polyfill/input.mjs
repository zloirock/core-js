// catch destructure with a ...rest sibling AND an entry prop whose default is polyfillable
// (`it = [9].flat()`). the entry's default is emitted as a standalone let-decl (with the baked
// default) BEFORE the rest-gather pattern is rebuilt; the rebuilt pattern reserves a `_unused`
// slot for the entry's key so rest exclusion still works. both must hold. regression lock
try {} catch ({ [Symbol.iterator]: it = [9].flat(), ...rest }) { it; rest; }
