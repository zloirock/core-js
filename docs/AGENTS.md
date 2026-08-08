# docs

The content of the documentation site. `website/` renders it - `npm run build-website-local` builds only the current branch, which is how a change here is previewed.

## Target environment

Prose, not executable code. Nothing here runs, and the ESLint config ignores `docs/**` entirely, so snippets are never checked for you.

Snippets show the library from the consumer's side, so they use modern syntax - the opposite of the ES5 rule that governs the polyfill sources. Do not carry the implementation style into examples, or the examples into the implementation.

## What is hand-written

- `web/docs/` - the reference pages, grouped into `features/ecmascript/`, `features/proposals/` and `features/web-standards/`, plus `usage.md`, `engines.md`, `typescript-type-definitions.md` and `missing-polyfills.md`
- `web/index.md`, `web/404.md`
- the blog posts at the top level of this directory; `zh_CN/` holds Chinese translations of those same posts, under the same file names. The build copies files and skips directories, so those translations reach no page today

Everything else under `web/` is produced by the site build and gitignored: `web/blog/` comes from the posts above, and `web/changelog.md`, `web/contributing.md`, `web/security.md` are copies of `CHANGELOG.md`, `CONTRIBUTING.md` and `SECURITY.md` from the repository root. Editing those four in place is lost work - change the source instead.

## Rules

- `web/docs/menu.json` is the navigation registry. A page missing from it is still rendered but reachable only by its URL, so a new page is not done until it is listed there
- Internal links go through the `{docs-version}` placeholder, which the build replaces with the path of the version being rendered. A hard-coded version in a link breaks every other version of the site
- A feature page follows the shape of its neighbours rather than a fixed template - the built-in signatures and the entry points are on nearly all of them, a specification link and a module name on most, examples and a link to the type definitions on many. Copy the closest existing page instead of inventing a layout
