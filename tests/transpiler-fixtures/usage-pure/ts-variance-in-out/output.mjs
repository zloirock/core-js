var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
interface Writer<in T> {
  write(value: T): void;
}
interface Reader<out T> {
  read(): T;
}
declare const reader: Reader<string[]>;
_atMaybeArray(_ref = reader.read()).call(_ref, 0);