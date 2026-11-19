import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.suppressed-error.constructor";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.to-well-formed";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.can-parse";
import "core-js/modules/web.url.parse";
import "core-js/modules/web.url-search-params.constructor";
export function gathered({
  URL: {
    canParse,
    ...others
  } = SuppressedError
} = globalThis) {
  return [canParse, others];
}