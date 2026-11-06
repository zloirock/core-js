import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";

// A function `name` read off a realm surface no pure binding stands for (`Intl.DateTimeFormat`): unplugin
// dispatches the instance claim on the surface's read (the sidecar), babel keeps the leaf native - its debt.
const name = _nameMaybeFunction(_globalThis.Intl.DateTimeFormat);

export { name };