// `Symbol.iterator === Symbol.iterator` - equality, not `in`. equality reads Symbol.iterator
// twice as static accessor; each access triggers the well-known-symbol polyfill suite
// (same as `Symbol.iterator in obj` shape). dedup yields single import set
Symbol.iterator === Symbol.iterator;
