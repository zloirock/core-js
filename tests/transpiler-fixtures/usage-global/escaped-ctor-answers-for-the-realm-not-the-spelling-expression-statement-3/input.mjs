// A parameter handed the realm constructor widens that constructor family.
function hand(x) {
  globalThis.taken = x;
}
function shell(Promise) {
  hand(Promise);
}
shell(globalThis.Promise);
new Promise(function (r) {
  r();
});
