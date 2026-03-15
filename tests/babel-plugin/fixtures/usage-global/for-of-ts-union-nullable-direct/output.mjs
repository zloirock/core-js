import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.sub";
import "core-js/modules/web.dom-collections.iterator";
declare const items: string[] | null | undefined;
for (const item of items) item.at(0).sub();