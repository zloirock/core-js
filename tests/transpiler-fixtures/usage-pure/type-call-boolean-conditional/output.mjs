import _at from "@core-js/pure/actual/instance/at";
// A naked boolean parameter distributes over true and false.
type Result<T> = T extends true ? number[] : string;
declare const value: Result<boolean>;
_at(value).call(value, -1);