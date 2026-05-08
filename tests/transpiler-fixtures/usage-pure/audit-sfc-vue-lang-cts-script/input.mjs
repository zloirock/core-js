// Vue SFC virtual id with `lang=cts` selects the CommonJS+TS dialect in unplugin emit (`require`).
// babel-plugin sees no virtual id and falls back to ESM (`import`); both must accept the `as` cast and emit polyfills.
const x = 1 as number;
arr.at(0);
str.replaceAll('a', 'b');
Array.from(it);
