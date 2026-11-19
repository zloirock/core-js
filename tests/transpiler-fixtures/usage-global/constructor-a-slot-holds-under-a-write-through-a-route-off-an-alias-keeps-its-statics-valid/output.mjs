import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.to-well-formed";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.can-parse";
import "core-js/modules/web.url-search-params.constructor";
const parsed = {
  C: URL
};
const tail = parsed;
const link = flag ? first : tail;
const head = flag ? second : link;
head.C = userValue;
export const valid = parsed.C.canParse('a:b');