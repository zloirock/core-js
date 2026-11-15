import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Member lookup retains the distributive condition after substituting its type argument.
type Result<T> = T extends true ? {
  rows: number[];
} : {
  rows: string;
};
declare const value: Result<boolean>;
_at(_ref = value.rows).call(_ref, -1);