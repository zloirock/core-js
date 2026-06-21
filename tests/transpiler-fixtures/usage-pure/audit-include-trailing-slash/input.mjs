// trailing slash on an entry-path include: `array/at/` is treated as a distinct entry
// path from `array/at`. the slashed form must be rejected, so validation surfaces
// "didn't match any polyfill". not canonicalising the slash is a design decision
// (entry-path strings are documented to match canonical entries verbatim)
'str'.at(-1);
