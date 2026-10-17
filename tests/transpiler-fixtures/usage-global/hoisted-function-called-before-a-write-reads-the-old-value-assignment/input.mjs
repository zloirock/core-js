// a function declaration is created when its scope is entered, so a call ahead of a write reads what
// the binding held before it: the modules of both values stay - for a constructor, for a key, and for
// a write a later one overwrites after a second call. a function first used after the write reads the
// written value alone
let Ctor = Iterator;
Ctor = Array;
