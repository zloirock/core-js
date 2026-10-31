# unit-deno

The orchestration runner uses Node and the ambient zx globals through `npm run test-unit-deno`. Each QUnit process runs on Deno, with a runtime guard. Keep feature tests in `tests/unit-global` and `tests/unit-pure`.

Run `npm run bundle` before the runner when runtime code or unit tests changed. The three processes cover global modules, the global bundle and the pure bundle. QUnit is installed by the zx bootstrap from this directory's package manifest; Deno uses that installation without creating a separate lockfile.

Like the Bun runner, skip with a message when the executable is absent. An installed runtime's failure must fail the command. CI installs the latest stable Deno before running this suite.
