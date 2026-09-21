// trailing slash on an entry-path include: `array/at/` is not an entry the map knows, so it is
// read as a module pattern, matches no module name (none carries a `/`) and validation reports it
// as unmatched. not canonicalising the slash is a design decision (entry-path strings are
// documented to match canonical entries verbatim)
'str'.at(-1);
