import _Promise from "@core-js/pure/actual/promise/constructor";
// Computed realm and constructor keys retain the selected prototype.
const proxyKey = 'self',
  ctorKey = 'Promise';
const {
  prototype
} = _Promise;
use(prototype);