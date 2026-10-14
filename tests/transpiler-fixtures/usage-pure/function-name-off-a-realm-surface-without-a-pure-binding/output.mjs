import _globalThis from "@core-js/pure/actual/global-this";
// A function `name` read off a realm surface no pure binding stands for (`Intl.DateTimeFormat`): unplugin
// dispatches the instance claim on the surface's read (the sidecar), babel keeps the leaf native - its debt.
const {
  DateTimeFormat: {
    name
  }
} = _globalThis.Intl;
export { name };