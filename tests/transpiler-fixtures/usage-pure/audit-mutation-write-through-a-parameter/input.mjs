// Parameter and default writes patch the constructor supplied by the caller.
// Map routes through its pure constructor; Object and String stay callable natives
// because their pure namespace exports are objects. Passing an unrelated object
// must not taint Array.from.
function install(target) {
  target.groupBy = function patched() { return 'patched'; };
}
install(Map);
Map.groupBy(src, it => it);

const handler = { take(ns) { ns.fromEntries = patched; } };
handler.take(Object);
Object.fromEntries(src);

function withDefault(ctor = String) {
  ctor.raw = patched;
}
withDefault();
String.raw(src);

function other(target) {
  target.from = patched;
}
other({});
Array.from(src);
