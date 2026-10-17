import "core-js/modules/es.array.of";
Array.of = function () {
  return [8];
};
let patched = 'isArray';
if (c) patched = 'of';
export const viaPatched = Array[patched];