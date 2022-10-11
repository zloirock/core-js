import { readdir, rm } from 'fs/promises';

await rm('package-lock.json', { force: true });

const packages = await readdir('packages');
const folders = ['node_modules', ...packages.map(pkg => `packages/${ pkg }/node_modules`)];
await Promise.all(folders.map(folder => rm(folder, { force: true, recursive: true })));

console.log('\u001B[32mdependencies cleaned\u001B[0m');
