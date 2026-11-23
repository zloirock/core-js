import { deepEqual, strictEqual } from 'node:assert/strict';

const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'core-js-update-version-'));
// Git hooks can export paths to the caller's repository.
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')));
env.GIT_CONFIG_GLOBAL = path.join(directory, 'gitconfig');
const run = $({ cwd: directory, quiet: true, env });
const previous = '4.1.2-alpha.1';
const target = '4.10.0-alpha.0';
const typesDocs = ['packages/core-js-types/README.md', 'docs/web/docs/typescript-type-definitions.md'];
const histories = ['modules-by-versions', 'entries-by-versions'];

function instructions(version) {
  return [
    `npm install --save @core-js/types@${ version }`,
    `npm install @core-js/types@${ version }`,
    `  npm i -D "@core-js/types@${ version }"`,
    'npm install --save @core-js/types@4.x',
    'npm install --save @core-js/types@4.1',
    `npm view @core-js/types@${ previous }`,
    'TypeScript 4.1+ is required.',
  ].join('\n');
}

try {
  await run`git init -q`;
  await run`git -c user.name=test -c user.email=test@example.org -c commit.gpgSign=false commit -qm fixture --allow-empty`;
  await run`git -c tag.gpgSign=false tag v${ previous }`;
  await fs.copy('LICENSE', path.join(directory, 'LICENSE'));
  for (const file of [
    'CHANGELOG.md', 'README.md', 'packages/core-js-compat/README.md', 'packages/core-js/internals/shared-store.js',
    'packages/core-js-builder/config.js', 'docs/web/docs/usage.md',
  ]) await fs.ensureFile(path.join(directory, file));
  for (const file of typesDocs) await fs.outputFile(path.join(directory, file), instructions(previous));
  await fs.outputJson(path.join(directory, 'packages/core-js/package.json'), { version: previous });

  // Supply the build outputs so the test exercises the release step in isolation.
  await fs.writeJson(path.join(directory, 'package.json'), { version: target, scripts: { 'build-compat': '', 'build-types': '' } });
  for (const name of histories) {
    await fs.outputJson(path.join(directory, 'packages/core-js-compat', `${ name }.json`), {
      '4.1.0': ['existing'], '4.10.0-unreleased': [name],
    });
  }

  await run`zx -- ${ path.resolve('scripts/update-version.mjs').replaceAll(path.sep, '/') }`;

  for (const name of histories) {
    const history = await fs.readJson(path.join(directory, 'packages/core-js-compat', `${ name }.json`));
    deepEqual(history, { '4.1.0': ['existing'], [target]: [name] }, name);
  }
  for (const file of typesDocs) {
    strictEqual(await fs.readFile(path.join(directory, file), 'utf8'), instructions(target), file);
  }
} finally {
  await fs.remove(directory);
}
