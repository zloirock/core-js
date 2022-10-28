cd('tests/promises');

await $`npm i --no-audit --no-fund --loglevel=error`;

for (const set of ['aplus', 'es6']) {
  await $`npx promises-${ set }-tests adapter --timeout=1000 --color`;
}
