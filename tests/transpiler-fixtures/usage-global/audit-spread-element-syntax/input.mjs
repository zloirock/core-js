// onSpreadElement: inside ObjectExpression - no iterator polyfill needed.
// Everywhere else (array, call args) - iterator polyfill needed
const arr = [...x];
const obj = { ...y };
foo(...z);
