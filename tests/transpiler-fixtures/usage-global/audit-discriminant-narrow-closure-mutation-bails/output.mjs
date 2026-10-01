import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Discriminant guard cannot survive across a function boundary when the bound binding
// is rebindable: the closure runs after the outer reassignment, so narrowing to the
// 'a'-branch (method: () => string) is unsound. Plugin must emit polyfills for both
// the 'a' and 'b' method return shapes.
type U = {
  kind: 'a';
  method: () => string;
} | {
  kind: 'b';
  method: () => Array<number>;
};
function f(u: U) {
  if (u.kind === 'a') {
    setTimeout(function () {
      u.method().at(0);
    });
    u = {
      kind: 'b',
      method: () => [1, 2, 3]
    };
  }
}