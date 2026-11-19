// Parentheses distinguish an async-named target from an async function head.
let async;
for ((async) of [7]) console.log([async].at(0));
