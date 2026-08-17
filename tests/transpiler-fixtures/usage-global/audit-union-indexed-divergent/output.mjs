import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// the negative twin of `audit-union-indexed-and-utility`. an arm that disagrees leaves the access
// unresolved, so BOTH families its method lives in stay injected. it sits in its own file because
// this method observes the import set of the whole file, and it is the only method a divergent
// union admits at all - `includes` would collapse its parameter to `never` and stop typechecking
type Mixed = {
  v: number[];
} | {
  v: string;
};
declare const mixed: Mixed["v"];
mixed.at(0);