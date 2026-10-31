import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// the utilities over `typeof X` read the type X is declared with, never the value its initializer
// holds: a value of that type may be any family the declaration admits
type Loader = () => string | string[];
const load: Loader = () => 'x';
export function lastLoaded(result: ReturnType<typeof load>) {
  return _at(result).call(result, -1);
}
class Shelf {
  books: string | string[] = '';
}
class ListShelf extends Shelf {
  books: string[] = [];
}
const ShelfKind: typeof Shelf = ListShelf;
export function hasBook(shelf: InstanceType<typeof ShelfKind>, title: string) {
  var _ref;
  return _includes(_ref = shelf.books).call(_ref, title);
}