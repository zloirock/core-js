import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.to-well-formed";
import "core-js/modules/web.url-search-params.constructor";
new URLSearchParams('a=1&a=2').getAll('a').at(-1);