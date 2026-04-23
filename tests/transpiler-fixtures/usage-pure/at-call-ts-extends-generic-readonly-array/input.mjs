// `class ReadOnlyList extends ReadonlyArray<string>` - super's type arg flows through
// resolveKnownContainerType for ReadonlyArray too (alias of Array in KNOWN_CONSTRUCTORS).
// `.at(-1)` picks the array-specific polyfill via inner-type narrowing
class ReadOnlyList extends ReadonlyArray<string> {}
declare const list: ReadOnlyList;
list.at(-1);
