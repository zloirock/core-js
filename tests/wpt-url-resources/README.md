# Web Platform Tests URL resources

These fixtures come from [Web Platform Tests](https://github.com/web-platform-tests/wpt),
revision [`792c7512e35133a4481f267dbd6417fdedd0df2c`](https://github.com/web-platform-tests/wpt/commit/792c7512e35133a4481f267dbd6417fdedd0df2c).
The upstream [3-Clause BSD license](LICENSE.md) applies.

| Module | Upstream resource under `url/resources/` |
| --- | --- |
| `urltestdata.js` | `urltestdata.json` |
| `urltestdata-javascript-only.js` | `urltestdata-javascript-only.json` |
| `setters.js` | `setters_tests.json` |
| `toascii.js` | `toascii.json` |

Each module wraps the corresponding JSON value in a default export and follows
the repository's ESLint formatting. Non-ASCII string code units use Unicode
escapes so older engines preserve test inputs when loading scripts as UTF-8.
All test cases, field names, expectations,
and metadata are preserved, including string comments and the setters' `comment`
property. There are no local expectation overrides.

Update all four resources from one pinned upstream revision, update the source
headers and this revision, and verify that the exported values equal the parsed
upstream JSON after formatting. The constructor adapter combines both parsing
resources, translates a null base to an absent base, and preserves empty strings.
The setters adapter ignores the top-level metadata and reads `new_value`.

The adapters live in `tests/unit-global/web.url.js` and
`tests/unit-pure/web.url.js`. The three WPT suites remain disabled by default;
updating their input data does not establish full URL or IDNA conformance.
