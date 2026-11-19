let x = [];
(function*() { x = 'hello'; })().next();
x.at(-1);
