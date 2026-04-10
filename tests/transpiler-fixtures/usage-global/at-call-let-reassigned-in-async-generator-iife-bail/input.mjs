let x = [];
(async function*() { x = 'hello'; })();
x.at(-1);
