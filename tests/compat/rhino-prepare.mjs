const { version } = argv;

const rhino = await fetch(
  `https://github.com/mozilla/rhino/releases/download/Rhino${ version.replace(/\./g, '_') }_Release/rhino-${ version }.jar`
);

await fs.writeFile('tests/compat/rhino.jar', Buffer.from(await rhino.arrayBuffer()));

await fs.writeFile('tests/compat/compat-data.js', `module.exports = ${ await fs.readFile('packages/core-js-compat/data.json') }`);
