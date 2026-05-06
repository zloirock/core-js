import childProcess from 'node:child_process';
import { copyFile, glob, readdir, rm } from 'node:fs/promises';
import { promisify, styleText } from 'node:util';

const exec = promisify(childProcess.exec);

const { UPDATE_DEPENDENCIES } = process.env;

const ignore = new Set([
  'scripts/check-actions',
  'scripts/usage',
  'tests/test262',
  'tests/unit-bun',
]);

const folders = ['', ...(await Promise.all([
  'packages',
  'scripts',
  'tests',
].map(async parent => {
  const dir = await readdir(parent);
  return dir.map(name => `${ parent }/${ name }`);
}))).flat()];

await Promise.all(folders.map(async folder => {
  if (!ignore.has(folder)) try {
    if (UPDATE_DEPENDENCIES) await rm(`./${ folder }/package-lock.json`, { force: true });
    await rm(`./${ folder }/node_modules`, { force: true, recursive: true });
  } catch { /* empty */ }
}));

console.log(styleText('green', 'dependencies cleaned'));

for await (const source of glob('packages/*/package.tpl.json')) {
  const target = source.replace(/\.tpl\.json$/, '.json');
  try {
    await copyFile(source, target);
    console.log(`${ styleText('cyan', source) } ${ styleText('green', 'copied to') } ${ styleText('cyan', target) }`);
  } catch { /* empty */ }
}

await exec(UPDATE_DEPENDENCIES ? 'npm i' : 'npm ci');

console.log(styleText('green', 'dependencies installed'));
