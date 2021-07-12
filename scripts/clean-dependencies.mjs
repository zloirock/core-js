import { readdir, rm } from 'fs/promises';

await rm('./node_modules', { force: true, recursive: true });

const packages = await readdir('./packages');
await Promise.all(packages.map(pkg => rm(`./packages/${ pkg }/node_modules`, { force: true, recursive: true })));

// eslint-disable-next-line no-console -- output
console.log('\u001B[32mnode_modules cleaned\u001B[0m');
