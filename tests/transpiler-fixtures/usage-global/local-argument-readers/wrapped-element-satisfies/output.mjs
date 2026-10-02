import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A transparent wrapper inside a literal carrier keeps the named source and its writes.
// The changed array slot can hold a string; its method must retain both receiver families.
const box: any = {
  rows: [8, 9]
};
box.rows = "ab";
const [{
  rows
}] = [box satisfies {
  rows: any;
}];
use(rows.includes("ab"));