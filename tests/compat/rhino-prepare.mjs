const VERSION = process.argv.find(it => it.startsWith('--version=')).slice(10);

const rhino = await fetch(
  `https://github.com/mozilla/rhino/releases/download/Rhino${ VERSION.replace(/\./g, '_') }_Release/rhino-${ VERSION }.jar`
);

await fs.writeFile('tests/compat/rhino.jar', Buffer.from(await rhino.arrayBuffer()));

await fs.writeFile('tests/compat/compat-data.js', `module.exports = ${ await fs.readFile('packages/core-js-compat/data.json') }`);
