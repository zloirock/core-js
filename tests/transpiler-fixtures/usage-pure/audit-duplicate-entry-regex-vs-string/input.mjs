// regex include vs string exclude on the same module path - NOT flagged as duplicate.
// regex form and string form are different pattern types; unified check only matches
// identical representations (string-string, or regex-regex by source/flags)
Array.from(x);
