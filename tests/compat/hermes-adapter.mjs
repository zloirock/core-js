const [HERMES_PATH] = argv._;

await $`${ HERMES_PATH } -w -commonjs ./tests/compat`;
