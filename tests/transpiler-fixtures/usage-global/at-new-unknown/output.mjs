import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An unknown constructor can return any object family, so at needs generic dispatch.
new Foo().at(-1);