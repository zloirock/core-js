import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `(globalThis as any).Symbol.iterator in x` - outer `in` rewrite subsumes the chain. the
// `globalThis` leaf inside a TSAsExpression wrapper must be marked as handled too; otherwise
// the Identifier visitor re-fires on `globalThis` and emits a duplicate polyfill request
function check(x: unknown): boolean {
  return (globalThis as any).Symbol.iterator in x;
}