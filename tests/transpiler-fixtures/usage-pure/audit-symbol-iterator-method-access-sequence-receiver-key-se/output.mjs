import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A sequence receiver and a computed Symbol.iterator key select a method without calling it.
// Receiver prefix r() runs before key prefix k(), each exactly once.
// The method is read from the selected array after both prefixes.
let arr = [1, 2, 3];
const m = (r(), arr, k(), _getIteratorMethod(arr));