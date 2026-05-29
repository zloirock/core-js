// global type reference nested in a TSTupleType element: tuple members live in `elementTypes`
// (plural), distinct from TSArrayType's singular `elementType` - both must be walked so Map
// here is detected the same as in any other annotation position
let entries: [Map<string, number>, string];
