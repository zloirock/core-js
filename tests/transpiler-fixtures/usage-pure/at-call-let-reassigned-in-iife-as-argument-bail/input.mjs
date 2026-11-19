let x = [];
(fn => fn())(() => { x = "hello"; });
x.at(-1);
