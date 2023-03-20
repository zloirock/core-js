---
title: Compatibility data
icon: form
sidebar: false
layout: CompatPage
head:
  - - script
    - nomodule: ""
      src: /compat/compat-data.js
  - - script
    - nomodule: ""
      src: /compat/tests.js
  - - script
    - nomodule: ""
      src: /compat/legacy-runner.js
---

## Supported engines

`core-js` tries to support all possible JS engines and environments with ES3 support. Some features have a higher lower bar - for example, _some_ accessors can properly work only from ES5, promises require a way to set a microtask or a task, etc.

However, I have no possibility to test `core-js` absolutely everywhere - for example, testing in IE7- and some other ancient was stopped. The list of definitely supported engines you can see in the compatibility table below. [Write](https://github.com/zloirock/core-js/issues) if you have issues or questions with the support of any engine.

## About `core-js-compat`

`core-js` project provides (as [`core-js-compat`](https://github.com/zloirock/core-js/tree/master/packages/core-js-compat) package) all required data about the necessity of `core-js` modules, entry points, and tools for work with it - it's useful for integration with tools like `babel` or `swc`. If you wanna help, you could take a look at the related section of [Contributing](dev/README.md#how-to-update-core-js-compat-data).

## Compat Table

- The minimum version support this API natively { .true }
- This API can be used via `core-js`' ployfill { .false }
- No data available at the moment { .nodata }
