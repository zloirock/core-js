// nested proxy-global destructure assignment с двумя outer props без rest spread. оба
// inner-имени (Array.from, Object.fromEntries) полифилл-eligible; обе assignments должны
// эмититься independent; пустая destructure удаляется (без consumers)
let from, fromEntries;
({Array: {from}, Object: {fromEntries}} = globalThis);
