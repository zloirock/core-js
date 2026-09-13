import _Reflect from "@core-js/pure/actual/reflect";
// A tag can patch the namespace in its interpolation slot. A named write keeps the
// namespace local, while mutation routing still gates the later static read.
// Pure carries the patched static through its substituted namespace.
function tag(strings, namespace) {
  namespace.ownKeys = patch;
}
tag`${_Reflect}`;
_Reflect.ownKeys({
  value: 1
});