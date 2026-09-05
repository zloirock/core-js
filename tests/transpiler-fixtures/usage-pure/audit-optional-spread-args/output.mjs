import _includes from "@core-js/pure/actual/instance/includes";
// optional call with spread args `fn?.(...iter)`: the spread iteration protocol must
// still be polyfilled even through the optional call form.
arr == null ? void 0 : _includes(arr).call(arr, ...args);