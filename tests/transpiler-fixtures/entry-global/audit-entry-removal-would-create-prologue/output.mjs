// Entry with NO directive prologue ahead of it and a bare string literal behind it. Removing
// the entry would put that literal at body position 0, where it is a DIRECTIVE - the prologue
// changes even though there was none before, so the `0;` terminator is owed here too. A file
// with no prologue is the worst case for this, not an exemption from it.
0;
"use bogus";
foo();