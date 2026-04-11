let x = [1, 2, 3];
(async function*() { x = 'hello'; })();
x.at(0);
