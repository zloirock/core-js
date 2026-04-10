let x = [];
if (cond) (() => { x = "hello"; })();
x.at(-1);
