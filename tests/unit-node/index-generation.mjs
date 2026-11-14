// Test bundles keep every source form, but only unit-pure needs the service namespace export.
import { strictEqual, rejects } from 'node:assert/strict';
import { generateTestsIndex } from '../../scripts/bundle-tests/generate-tests-index.mjs';

const cwd = process.cwd();
const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'core-js-test-index-'));
const helper = "import '../helpers/qunit-helpers';\n\n";
try {
  const scripts = path.join(directory, 'scripts/bundle-tests');
  await fs.ensureDir(scripts);
  process.chdir(scripts);
  for (const [name, options, imports, hook] of [
    ['unit-global', { pkg: 'core-js' }, ['es.sample', 'web.sample'], ''],
    ['unit-pure', { pkg: '@core-js/pure' }, ['es.sample', 'web.sample'], "\nimport core from '@core-js/pure';\ncore.globalThis.core = core;\n"],
    ['e2e-usage-pure', { pkg: '@core-js/pure', filter: /^[a-z]/, extensions: ['.js', '.ts'], exportCore: false },
      ['aa-first', 'es.sample', 'typed', 'web.sample', 'zz-last'], ''],
  ]) {
    const dir = path.join(directory, 'tests', name);
    await fs.ensureDir(dir);
    for (const file of ['zz-last.js', 'typed.ts', 'web.sample.js', 'aa-first.js', 'es.sample.js', 'index.js', 'README.md', 'ignored.mjs']) {
      await fs.writeFile(path.join(dir, file), '');
    }
    const expected = helper + imports.map(file => `import './${ file }';\n`).join('') + hook;
    await generateTestsIndex({ name, ...options });
    strictEqual(await fs.readFile(path.join(dir, 'index.js'), 'utf8'), expected, `${ name }: imports and service hook`);
    await generateTestsIndex({ name, ...options });
    strictEqual(await fs.readFile(path.join(dir, 'index.js'), 'utf8'), expected, `${ name }: deterministic regeneration`);
  }
  await rejects(generateTestsIndex({ name: 'missing', pkg: '@core-js/pure' }), { code: 'ENOENT' });
} finally {
  process.chdir(cwd);
  await fs.remove(directory);
}

// Also check the real caller, not just the generator's option in isolation.
const index = await fs.readFile(new URL('../e2e-usage-pure/index.js', import.meta.url), 'utf8');
strictEqual(/^import core from /mu.test(index), false, 'e2e index must not preload the whole pure package');
echo(chalk.green('test-index: 8 checks passed'));
