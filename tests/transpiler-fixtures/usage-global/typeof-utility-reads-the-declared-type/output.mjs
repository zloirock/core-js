import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// the utilities over `typeof X` read the type X is declared with, never the value its initializer
// holds: a value of that type may be any family the declaration admits
type Loader = () => string | string[];
const load: Loader = () => 'x';
export function lastLoaded(result: ReturnType<typeof load>) {
  return result.at(-1);
}
class Shelf {
  books: string | string[] = '';
}
class ListShelf extends Shelf {
  books: string[] = [];
}
const ShelfKind: typeof Shelf = ListShelf;
export function hasBook(shelf: InstanceType<typeof ShelfKind>, title: string) {
  return shelf.books.includes(title);
}