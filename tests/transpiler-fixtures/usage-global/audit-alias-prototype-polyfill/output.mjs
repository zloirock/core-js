import "core-js/modules/es.array.at";
// member-init alias of `Array.prototype`: `P.at(0)` injects `es.array.at` side-effect
const P = Array.prototype;
P.at(0);