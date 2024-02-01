async function generateTestsIndex(name, pkg) {
  const dir = `tests/${ name }`;
  const files = await fs.readdir(dir);
  return fs.writeFile(`${ dir }/index.js`, `import '../helpers/qunit-helpers';\n\n${ files
    .filter(it => /^(?:es|esnext|web)\./.test(it))
    .map(it => `import './${ it.slice(0, -3) }';\n`)
    .join('') }${ pkg !== 'core-js' ? `\nimport core from '${ pkg }';\ncore.globalThis.core = core;\n` : '' }`);
}

await generateTestsIndex('unit-global', 'core-js');
await generateTestsIndex('unit-pure', '@core-js/pure');

echo(chalk.green('indexes generated'));
