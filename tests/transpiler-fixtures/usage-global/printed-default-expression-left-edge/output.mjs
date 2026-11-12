import "core-js/modules/es.array.at";
// The left edge remains an expression even inside a default-export logical operation.
export default (function hidden() {
  return [7].at(0);
}) || 0;