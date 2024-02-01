import { readdir, rm } from 'node:fs/promises';

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
    await rm(`./${ folder }/package-lock.json`, { force: true });
    await rm(`./${ folder }/node_modules`, { force: true, recursive: true });
  } catch { /* empty */ }
}));

console.log('\u001B[32mdependencies cleaned\u001B[0m');
