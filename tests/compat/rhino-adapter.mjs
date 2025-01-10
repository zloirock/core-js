const [path] = argv._;

await $`java -jar ${ path } -require tests/compat/rhino-runner.js`;
