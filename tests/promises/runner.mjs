for (const mode of ['global', 'pure']) for (const set of ['aplus', 'es6']) {
  await $`promises-${ set }-tests adapter --timeout 1000 --color --${ mode }`;
}
