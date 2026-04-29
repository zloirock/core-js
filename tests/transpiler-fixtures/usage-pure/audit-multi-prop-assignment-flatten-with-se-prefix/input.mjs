// destructure assignment с side-effect-bearing receiver и двумя полифилл-eligible outer
// props без rest spread. side-effect лифтится как отдельный statement до полифилл-assigns;
// пустая destructure удаляется (без consumers)
let from, fromEntries;
({ Array: { from }, Object: { fromEntries } } = (sideEffect(), globalThis));
