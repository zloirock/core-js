# Fixed script URL: browser cache experiment

This experiment tested a proposed delivery mode for a manual blocking script tag. It did not test a container implementation of `@core-js/service` or change the package's current immutable bundle URLs.

## Question and method

Can a page keep `<script src="/polyfills.js"></script>` before its application scripts while the JavaScript at that URL changes between releases? The browser must reuse unchanged bytes without executing an outdated script after a change.

A temporary HTTP server served HTML without cache instructions. The script set a global value to A or B, which the page read after loading. The script response used `Cache-Control: private, no-cache`, `Vary: User-Agent, Accept-Encoding`, and an `ETag` of `"v1"` or `"v2"`. The server returned `304` without a body when `If-None-Match` matched its current version, and `200` with JavaScript otherwise.

In each fresh browser session, the test opened the page with A, opened it again unchanged, changed the server response to B, and opened the page a third time. It checked both the server request log and the value executed by the browser. It did not use a hard reload or disable caching.

The server was reached through Sauce Connect with localhost proxying enabled. Desktop IE, Firefox, and Chrome used `127.0.0.1`; Safari and mobile browsers needed `127.0.0.1.sslip.io`. Initial Safari and Android attempts using the numeric address never reached the server and provide no evidence about caching.

## Results

In every successful session, the first request got `200` with A and executed A. The second request supplied `If-None-Match: "v1"`, got `304`, and executed cached A. After the switch, the request still supplied `If-None-Match: "v1"`, got `200` with B, and executed B.

| Browser | Sauce Labs job | Qualification |
| --- | --- | --- |
| IE11 on Windows 10 | [Session](https://app.saucelabs.com/tests/e34f2af2302e41bc81ea2d22365c8746) | Example of the supported browser floor |
| Firefox 15.0.1 on Windows | [Session](https://app.saucelabs.com/tests/ee2f5c71133349be88b34a3a94741724) | Example of the supported browser floor |
| Chrome 67 on Windows 10 | [Session](https://app.saucelabs.com/tests/82f9d17e59f740dd8912de8dad608773) | Earliest Chrome in the available catalog, not Chrome 38 |
| Safari 14.1 on macOS 11 | [Session](https://app.saucelabs.com/tests/0e478e4c29424ee08319b75fc5cbbe6b) | Earliest desktop Safari in the available catalog, not Safari 7.1 |
| iOS Safari 14.0 simulator | [Session](https://app.saucelabs.com/tests/da8ac863d1624066a5d59576d9a61bcf) | Additional identical conditional requests occurred on later loads; the executed script was correct |
| Chrome 95 on Android 5.0.2 emulator | [Session](https://app.saucelabs.com/tests/be3705b185254b6a8ae16377eda94428) | An old Android version does not imply an old Chrome version |

## Limits

The results show conditional revalidation and correct execution on the listed browsers. They do not establish behavior on Chrome 38 or Safari 7.1, which were unavailable in the catalog, or on every other browser at the supported floor. The experiment did not test a real proxy switching between containers, intermediary or CDN caches, changing request headers, multiple tabs, offline use, cache eviction, or different service images. A proxy must not confirm an old response with a stale `304` after a release switch.

The test used synthetic validators. A production validator must distinguish the bytes of the representation that would be served now, including its content coding; otherwise `304` could confirm JavaScript from a previous release. The measured behavior supports investigating a fixed-URL integration, not treating that integration as implemented or fully validated.
