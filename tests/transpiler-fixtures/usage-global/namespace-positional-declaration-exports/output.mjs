import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A namespace exposes only the user's bindings and cannot contain an export list.
const rows: [number[], number[]] = [[3], [7]];
declare const mixed: [number, {
  at: number;
}];
export namespace Outer {
  export const [{
    at: first
  }, {
    at: second
  }] = rows;
  export namespace Inner {
    export const [index, {
      at: value
    }] = mixed;
  }
}