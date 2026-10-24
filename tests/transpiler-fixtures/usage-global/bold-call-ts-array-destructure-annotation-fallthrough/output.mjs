import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.bold";
import "core-js/modules/web.dom-collections.iterator";
const items: string[] = ['hello'];
const [x]: unknown[] = items;
// @ts-expect-error the read sees the value the source assigned, which the declared type does not carry
x.at(0).bold();