import _at from "@core-js/pure/actual/instance/at";
async function f() {
  await (arr == null ? void 0 : _at(arr).call(arr, 0));
}