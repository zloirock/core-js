import childProcess from 'node:child_process';
import { readdir, rm } from 'node:fs/promises';
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

await exec(UPDATE_DEPENDENCIES ? 'npm i' : 'npm ci');

console.log('\u001B[32mdependencies installed\u001B[0m');
