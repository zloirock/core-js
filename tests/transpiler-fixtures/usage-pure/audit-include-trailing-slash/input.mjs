// trailing slash on an entry-path include: `array/at/` is treated as a distinct entry
// path from `array/at`. `lookupEntryModules` rejects the slashed form, so validation
// surfaces "didn't match any polyfill". canonicalising the slash inside lookup is a
// design decision (entry-path strings are documented to match canonical entries verbatim)
'str'.at(-1);
