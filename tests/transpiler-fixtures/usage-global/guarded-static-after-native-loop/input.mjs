// A loop initializer retains the guard after the native slot before it.
// The earlier instance read keeps its own slot; global mode keeps the source form.
let M = Map;
if (flag) M = { name: 'user', at: 8, groupBy: 7 };
for (const { name: nm, at: other, groupBy: method } = M; test();) use(nm, other, method);
