import childProcess from 'node:child_process';
import { copyFile, readdir, rm } from 'node:fs/promises';
import { promisify } from 'node:util';

const exec = promisify(childProcess.exec);

const { UPDATE_DEPENDENCIES } = process.env;

const ignore = new Set([
  'scripts/check-actions',
  'scripts/usage',
  'tests/test262',
  'tests/unit-bun',
]);

const folders = [''].concat(...await Promise.all([
  'packages',
  'scripts',
  'tests',
].map(async parent => {
  const dir = await readdir(parent);
  return dir.map(name => `${ parent }/${ name }`);
})));

await Promise.all(folders.map(async folder => {
  if (!ignore.has(folder)) try {
    if (UPDATE_DEPENDENCIES) await rm(`./${ folder }/package-lock.json`, { force: true });
    await rm(`./${ folder }/node_modules`, { force: true, recursive: true });
  } catch { /* empty */ }
}));

console.log('\u001B[32mdependencies cleaned\u001B[0m');

// TODO: replace with glob from Node 22
for (const pkg of await readdir('packages', { withFileTypes: true })) {
  if (pkg.isDirectory()) {
    const source = `packages/${ pkg.name }/package.tpl.json`;
    const target = source.replace(/\.tpl\.json$/, '.json');
    try {
      await copyFile(source, target);
      console.log(`\u001B[36m${ source } \u001B[32mcopied to \u001B[36m${ target }\u001B[0m`);
    } catch { /* empty */ }
  }
}

await exec(UPDATE_DEPENDENCIES ? 'npm i' : 'npm ci');

console.log('\u001B[32mdependencies installed\u001B[0m');
