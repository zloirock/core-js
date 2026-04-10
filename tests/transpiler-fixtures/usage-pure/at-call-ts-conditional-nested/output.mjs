var _ref;
import _at from "@core-js/pure/actual/instance/at";
type Deep<T> = {
  get(): T extends object ? T extends Array<infer U> ? U[] : never : T;
};
declare const d: Deep<string>;
_at(_ref = d.get()).call(_ref, -1);