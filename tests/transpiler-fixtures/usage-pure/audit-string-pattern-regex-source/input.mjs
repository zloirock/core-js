// a string `include` is raw regex source, as documented: `es\.(array|string)\.at` names the two
// modules with an escaped dot and an alternation. the entries map decides what is an entry path;
// a string it does not resolve is a module pattern, however entry-like or dotted it looks
'str'.at(-1);
[1].at(0);
