import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import { items } from './data';
const result = _flatMaybeArray(items).call(items);