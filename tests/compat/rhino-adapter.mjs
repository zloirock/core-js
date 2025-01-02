const [path] = argv._;

await $`java -jar ${ path } -version 200 -require tests/compat/rhino-runner.js`;
