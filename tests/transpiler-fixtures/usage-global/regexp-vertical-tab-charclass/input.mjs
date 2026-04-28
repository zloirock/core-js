// `\v` (vertical tab) inside a character class - the polyfill plugin must NOT rewrite
// regex literal contents. linter `regexp/sort-character-class-elements` orders elements
// by escape category; this fixture asserts source-faithful pass-through regardless of
// any future regex-aware visitor that might mistake the literal as a polyfill anchor
const re = /[\v\t]/;
re.test('x');
