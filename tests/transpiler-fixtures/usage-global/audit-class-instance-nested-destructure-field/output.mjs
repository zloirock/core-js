import "core-js/modules/es.array.at";
// the nested pattern hop off a class instance narrows like the flat spelling: only the array
// family is injected for the field the class body types, where the unresolved walk pulled the
// string family beside it
class C {
  data = [1, [2]];
}
const c = new C();
export const {
  data: {
    at
  }
} = c;