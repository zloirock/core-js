# saucelabs

The `tests/unit-browser` pages, run in Sauce Labs browsers that the CI runners do not have: real Safari, iOS and older Chromium and Gecko.

## Target environment

The runner is Node tooling started through `zxi`; the WebDriver client next to it is plain HTTP, because it has to speak the JSON Wire protocol too, and the maintained clients have dropped that protocol. What runs in the browsers is the published pages and `tests/unit-browser/qunit-results.js`, which they load. That file is ES5, because it runs in every browser of the matrix.

## Rules

- The run opens the pages deployed to GitHub Pages, never a local build. `npm run test-saucelabs -- <URL of a branch directory> [commit]` tests what is deployed there. With a commit - the full SHA, as `commit.txt` holds it - the runner first waits for the `commit.txt` that the Pages workflow writes to show that commit, and fails if a redeploy changes it during the run. That proves the deploy, not the bundles a browser gets: GitHub Pages caches for ten minutes (`max-age=600`), and an edge that served the previous deploy may keep serving it, so a run in the first minutes after a deploy can test the previous commit. Waiting that out was judged not worth ten minutes on every run. Without a commit, nothing ties the result to your tree
- The run is in the Pages workflow, not in `ci.yml`, and only for the branches of the main repository that the workflow builds pages for: the job has to run after the deploy, and the credentials (`SAUCE_USERNAME`, `SAUCE_ACCESS_KEY`, optional `SAUCE_REGION`, a data center such as `eu-central-1`, `us-west-1` by default) do not reach forks. `npm test` does not include it, and the job does not fail the workflow (`continue-on-error`) while the failures it found on the old engines are open - read its log, not the workflow badge
- A page without `qunit-results.js`, or without the QUnit it attaches to, fails as `no results reporter`; the page list lives in `runner.mjs`, separately from the pages themselves
- `platforms.mjs` holds only what CI lacks. The latest Chromium, Firefox and WebKit and IE11 run on the CI runners, so they never go here; how the versions are picked is in the comment at the top of the file. A browser the W3C protocol does not cover is marked `w3c: false`
- The matrix is sized to the concurrency of the account. Sessions above it wait in the Sauce Labs queue, and the session request timeout covers that wait
- A WebDriver error retries the whole platform in a new session. A failed assertion, a run that does not finish or has no assertions, and a page without the reporter are results and never retried. A page that stops answering WebDriver altogether looks the same as a broken VM, so it is retried like one
