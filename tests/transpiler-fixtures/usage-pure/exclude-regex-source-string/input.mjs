// a string exclude is raw regex source, as documented: the escaped dots name `es.array.at`, so the
// array read stays native and the string read rewrites. the escaped spelling was once read as an
// entry path that matched no polyfill
[1].at(0);
'str'.at(-1);
