---
icon: state
---

# Roadmap

JavaScript, browsers, and web development are evolving at an amazing speed. The time when almost all of the `core-js` modules were required for all browsers is gone. The latest browsers have good standards support and, in the common use cases, they need only some percentage of the `core-js` modules for the most recent language features and bug fixes. Some companies are already dropping support for IE11 which was recently "buried" once more. However, even without IE, old browsers will always be there, bugs will happen in modern browsers too, and new language features will appear regularly and they will appear in browsers with a delay anyway; so, if we want to use modern JS in development and minimize possible problems, polyfills stay with us for a long time, but they should continue to evolve.

Here I will write (almost) nothing about adding new or improving existing specific polyfills (but, sure, it's one of the main parts of `core-js` development), let's talk about some other crucial moments without focusing on minor things. If it is decided to make a commercial project from `core-js`, the roadmap will be adapted to this outcome.

I am trying to keep `core-js` as compact as possible, but one of the main conceptions that it should follow is to be maximally useful in the modern web — the client should not load any unnecessary polyfills and polyfills should be maximally compact and optimized. Currently, a maximal `core-js` bundle size with early-stage proposals [is about 220KB minified, 70KB gzipped](https://bundlephobia.com/package/core-js) — it's not a tiny package, it's big enough — it's like jQuery, LoDash, and Axios together — the reason is that the package covers almost the entire standard library of the language. The individual weight of each component is several times less than the weight of quite correct alternatives. It's possible to load only the `core-js` features that you use and in minimal cases, the bundle size can be reduced to some kilobytes. When `core-js` is used correctly, this is usually a couple of tens of kilobytes — however, there is something to strive for. [Most pages contain pictures larger](https://almanac.httparchive.org/en/2022/media#bytesizes) than the entire `core-js` bundle, most users have Internet speed in dozens of Mbps, so why is this concept so significant?

I don't want to repeat old posts about [the cost of JavaScript](https://medium.com/dev-channel/the-cost-of-javascript-84009f51e99e) in detail where you can read why adding JS increases the time when the user can start interacting with the page much more than adding a similar size picture — it's not only downloading, it's also parsing, compiling, evaluating the script, it blocks the page rendering.

In too many places the mobile Internet is not perfect and is still 3G or even 2G. In the case of 3G, the download of one full copy of `core-js` can take a couple of seconds. However, pages contain more than one copy of `core-js` and many other duplicated polyfills too often. Some (mainly mobile) Internet providers have very limited "unlimited" data plans and after a few gigabytes reduce the speed to a few Kbps. The connection speed is often limited for many other reasons too.

The speed of the page load equals revenue.

![conversion](/project/roadmap/conversion.webp)

> Illustration is from a [random post](https://medium.com/@vikigreen/impact-of-slow-page-load-time-on-website-performance-40d5c9ce568a) by googling

The size of `core-js` is constantly growing because of the addition of new or improvements to the existing polyfills. This issue also is a blocker for some big polyfills — the addition of `Intl`, `Temporal`, and some other features to `core-js` could increase the maximal bundle size by a dozen times up to a few megabytes.

One of the main `core-js` killer features is that it can be optimized with the usage of Babel, SWC, or manually, however, current approaches solve only a part of the problem. To properly solve them, the modern web requires a new generation of the toolkit that could be simply integrated into the current development stack. And in some cases, as you will see below, this toolkit could help to make the size of your web pages even less than just without `core-js`.

I already wrote about some of this in [**`core-js@3`, Babel and a look into the future** post](../blog/2019/core-js-3-babel-and-a-look-into-the-future.html#look-into-the-future), but those were just raw ideas. Now they're in the stage of experimentation or even implementation.

Since the future of the project is uncertain, it makes no sense to write any specific dates here, I do not promise that all of this will be done shortly, but this is what should be strived for.

---

### New major version

`core-js@3` was released about 4 years ago — it's been a long time. It's not a big problem for me to add some breaking changes (rather ensuring backward compatibility is often a challenge) and to mark a new version as a major release — it's a big problem for the users.

At this moment, about 25% of `core-js` downloads are critically obsolete `core-js@2`. Many users wanna update it to `core-js@3`, but because their dependencies use `core-js@2` they still use the obsolete version to avoid multiple copies (I saw such issues on GitHub in too many projects). Too frequent major updates would worsen such cases even more.

However, it's better not to get too obsessed with compatibility with older versions. The library contains too much that's not removed only for compatibility reasons. The absence of some long-needed breaking changes for someone will negatively affect the future. Judging by how the standards, the ecosystem, and the Web change, and how legacy accumulates, it's better to release a new major version each 2-3 years.

The addition of all the new things that we would like to see in the new major version would take many years, which is unacceptable. However, `core-js` follows [SemVer](https://semver.org/) and it makes sense to release a new major release at first with breaking changes (some of them below), most of the new features can be added in minor releases. In this case, such a release can take just about 2-3 months of full-time work and it can be the first `core-js` version that reduced the size compared to the previous -)

### `core-js` package directly

### Drop critically obsolete engines support

IE is dead. However, not for all — for many different reasons, someone is still forced to make or maintain websites that should work in IE. `core-js` is one of the main tools that makes life easier for them.

At this moment, `core-js` tries to support all possible engines and platforms, even ES3 — IE8-. But only a small part of developers using `core-js` needs support of ES3 engines — at this moment, the IE8- segment of browsers is about 0.1%. For many other users, it causes problems — bigger bundle size and slower runtime execution.

The main problem comes from supporting ES3 engines: most modern ES features are based on ES5 features, which aren't available in those old engines. Some features (like getters / setters) can't be polyfilled, so some polyfills (like typed arrays) can't work in IE8- at all. Some others require heavy workarounds. In cases where you need to polyfill only some simple features, the main part of the `core-js` size in the bundle is the implementation of ES5 methods (in the case of polyfilling a lot of features, it's only some percent, so this problem is related mainly to minimalistic bundles).

Even the simple replacement of internal fallbacks of ES5 features to implementations to direct usage of those native features reduces minimalistic `core-js` bundle size by 2+ times. After reworking the architecture, it will be reduced even more.

The IE9-10 segment of browsers already is also small — at this moment, the same 0.1%. But it makes no sense to consider dropping their support without dropping support of some other obsolete engines with similar or even greater restrictions, for example, Android 4.4.4 — in total, it's about 1%. Raising the lower bar higher than ES5 is a more difficult decision at least because of some non-browser engines. However, even dropping IE11 support in the future will not give as many benefits as dropping IE8- support would now.

### ECMAScript modules and modern syntax

At this moment, `core-js` uses CommonJS modules. For a long time, it was the most popular JavaScript modules format, but now ECMAScript provides its own modules format and it's already very popular and supported _almost_ everywhere. For example, Deno, like browsers, doesn't support CommonJS, but supports ES modules. `core-js` should get an ECMAScript modules version in the near future. But, for example, on NodeJS, ECMAScript modules are supported only in the modern versions — but on NodeJS `core-js` should work without transpiling / bundling even in ancient versions, [Electron still does not support it](https://github.com/electron/electron/issues/21457), etc., so it's problematic to get rid of the CommonJS version immediately.

The situation with the rest of modern syntax is not so obvious. At this moment, `core-js` uses ES3 syntax. Initially, it was for maximal optimization since it should be pre-transpiled to old syntax anyway. But it was true only initially. Now, `core-js` just can't be properly transpiled in userland and should be ignored in transpiler configs. Why? Let's take a look, for example, at Babel transforms:

- A big part of transforms rely on modern built-ins, for example, transforms which use `@@iterator` protocol — yet `Symbol.iterator`, iterators, and all other related built-ins are implemented in `core-js` and absent before `core-js` loading.
- Another problem is transpiling `core-js` with transforms that inject `core-js` polyfills. Obviously, we can't inject polyfills into the place where they are implemented since it is circular dependencies.
- Some other transforms applied on `core-js` just break its internals — for example, [the `typeof` transform](https://babeljs.io/docs/en/babel-plugin-transform-typeof-symbol) (that should help with support of polyfilled symbols) breaks the `Symbol` polyfill.

However, the usage of modern syntax in polyfills code could significantly improve the readability of the source code, reduce the size and in some cases improve performance if polyfill is bundled for a modern engine, so it's time to think about rewriting `core-js` to modern syntax, making it transpilable by getting around those problems and publishing versions with different syntax for different use cases.

### Web standards polyfills

I've been thinking about adding the most possible web standards (not only ECMAScript and closely related features) support to `core-js` for a long time. First of all, about the remaining features from the [Minimum Common Web Platform API](https://common-min-api.proposal.wintercg.org/#index) ([what is it?](https://blog.cloudflare.com/introducing-the-wintercg/)), but not only about them. It could be good to have one bulletproof polyfills project for all possible web development cases, not only for ECMAScript. At the moment, the situation with the support of web standards in browsers is much worse than with the support of modern ECMAScript features.

One of the barriers preventing the addition of web standards polyfills to `core-js` was a significant increase of bundles' size, but I think that with current techniques of loading only the required polyfills and techniques which you can see below, we could add polyfills of web standards to `core-js`.

But the main problem is that it should not be naive polyfills. As I wrote above, today the correctness of ECMAScript features is not in a very bad shape almost universally, but we can't say this about web platform features. For example, [a `structuredClone` polyfill](https://github.com/zloirock/core-js#structuredclone) was relatively recently added. When working on it, taking into account the dependencies, I faced **hundreds** of different JavaScript engines bugs — I don't remember when I saw something like that when I added new ECMAScript features — for this reason, the work on this simple method, that naively could be implemented within a couple hours, including resolving all issues and adding required features, lasted for several months. In the case of polyfills, better to do nothing than to do bad. The proper testing, polyfilling, and ensuring cross-platform compatibility web platform features require even more significant resources than what I spend on ECMAScript polyfills. So adding the maximum possible web standards support to `core-js` will be started only in case if I have such resources.

---

### New approaches to tooling are more interesting

Someone will ask why it's here. What do tools, like transpilers, have to do with the `core-js` project? `core-js` is just a polyfill, and those tools are written and maintained by other people. Once I also thought that it is enough to write a great project with a good API, explain its possibilities, and when it becomes popular, it will acquire an ecosystem with proper third-party tools. However, over the years, I realized that this will not happen if you do not do, or at least not control, it yourself.

For example, for many years, instance methods were not able to be polyfilled through Babel `runtime`, but I explained how to do it too many times. Polyfilling via `preset-env` could not be used in real-life projects because of incomplete detection of required polyfills and a bad source of compatibility data, which I explained from the beginning. Because of such problems, I was forced [to almost completely rewrite those tools in 2018-2019, for the `core-js@3` release](https://github.com/babel/babel/pull/7646), after that we got the current state of statically analysis-based tools for polyfills injecting.

I am sure that if the approaches below are not implemented in the scope of `core-js`, they will not be properly implemented at all.

---

To avoid some questions related to the following text: `core-js` tools will be moved to scoped packages — tools like `core-js-builder` and `core-js-compat` will become `@core-js/builder` and `@core-js/compat` respectively.

### Not only Babel: plugins for transpilers and module bundlers

At this moment, some users are forced to use Babel only due to the need to automatically inject / optimize required polyfills. At this moment, Babel's [`preset-env`](https://babeljs.io/docs/en/babel-preset-env#usebuiltins) and [`runtime`](https://babeljs.io/docs/en/babel-plugin-transform-runtime#core-js-aliasing) are the only good enough and well-known ways to optimize usage of `core-js` with statical analysis. Historically, it happened because I helped Babel with polyfills. It does not mean that it's the only or the best place where it could be done.

Babel is only one of many transpilers. TypeScript is another popular option. Other transpilers are gaining popularity now, for example, [SWC](https://swc.rs/) (that already contains [a tool for automatic polyfilling / `core-js` optimization](https://swc.rs/docs/configuration/supported-browsers), but it's still not perfect). However, why do we talk about the transpilers layer? The bundlers layer and tools like `webpack` or [`esbuild`](https://esbuild.github.io/) (that also contains an integrated transpiler) are more interesting for the optimization of polyfills. [Rome](https://rome.tools/) has been in development for several years and still is not ready, but its concept looks very promising.

One of the main problems with statical analysis-based automatic polyfilling on the transpiler layer is that usually not all files from the bundle are transpiled — for example, dependencies. If some of your dependencies need a polyfill of a modern built-in feature, but you don't use this built-in in your userland code, this polyfill will not be added to the bundle. Unnecessary polyfills import also will not be removed from your dependencies (see below). Moving automatic polyfilling to the bundlers layer fixes this problem.

Sure, writing or using such plugins in many places is difficult compared to Babel. For example, [now without some extra tools you can't use plugins for custom transforms in TypeScript](https://github.com/microsoft/TypeScript/issues/14419). However, where there's a will there's a way.

Automatic polyfilling / optimization of `core-js` should be available not only in Babel. It's almost impossible to write and maintain plugins for all transpilers and bundlers in the scope of the `core-js` project, but it's possible to do those things:

- Improve data provided by `core-js` (`@core-js/compat`) and tools for integration with third-party projects, they should be comprehensive. For example, "built-in definitions" are still on Babel's side that causing problems with their reuse in other projects.
- Since some tools already provide `core-js` integration, it makes sense to help them too, not just Babel.
- It makes sense to write and maintain plugins for some significant tools in the scope of the `core-js` project. Which? We will see.

### Polyfills collector

One of the problems of the statical analysis-based automatic polyfilling on the files layer (`usage` polyfilling mode of Babel `preset-env`) was explained above, but it's not the only problem. Let's talk about some others.

Your dependencies could have their own `core-js` dependencies and they can be incompatible with the `core-js` version that you use at the root of your project, so injecting `core-js` imports to your dependencies directly could cause breakage.

Projects often contain multiple entry points, multiple bundles, and, in some cases, the proper moving of all `core-js` modules to one chunk can be problematic and it could cause duplication of `core-js` in each bundle.

I already posted [the `core-js` usage statistics](https://gist.github.com/zloirock/7331cec2a1ba74feae09e64584ec5d0e) above. In many cases, you could see the duplication of `core-js` — and it's only on the first loaded page of the application. Sometimes it's even like what we see on the Bloomberg website:

![bloomberg](/project/roadmap/bloomberg.webp)

[Some time ago this number was even higher.](/project/roadmap/bloomberg2.webp) Of course, such a number of copies and various versions of `core-js` is not something typical, but a situation with several copies of `core-js` is too common as you saw above, affecting about half the websites with `core-js`. To prevent this **a new solution is required to collect all polyfills from all entry points, bundles and dependencies of the project in one place.**

Let's call a tool for this `@core-js/collector`. This tool should take an entry point or a list of entry points and should use the same statical analysis that's used in `preset-env`, however, this tool should not transform code or inject anything, should check full dependencies trees and should return a full list of required `core-js` modules. As a requirement, it should be simple to integrate into the current development stack. One possible way can be a new polyfilling mode in plugins, let's call it `collected` — that will allow loading all collected polyfills of the application in one place and remove the unnecessary (see below).

### Removing unnecessary third-party polyfills

Now it's typical to see, for example, a dozen copies of `Promise` polyfills with the same functionality on a website — you load only one `Promise` polyfill from `core-js`, but some of your dependencies load `Promise` polyfills by themself — `Promise` polyfill from one more `core-js` copy, `es6-promise`, `promise-polyfill`, `es6-promise-polyfill`, `native-promise-only`, etc. But it's just ES6 `Promise` which is already completely covered by `core-js` — and available in most browsers without polyfills. Sometimes, due to this, the size of all polyfills in the bundle swells to several megabytes.

It's not an ideal illustration for this issue, many other examples would have been better, but since above we started to talk about the Bloomberg website, let's take a look at this site one more time. We have no access to the source code, however, we have, for example, such an awesome tool as [`bundlescanner.com`](https://bundlescanner.com/website/bloomberg.com%2Feurope/all) (I hope that the Bloomberg team will fix it ASAP, so the result could be outdated).

![bundlescanner](/project/roadmap/bundlescanner.webp)

As shown in the practice, since such analysis it's not a simple work, this tool detects only about half of libraries' code. However, in addition to 450 kilobytes of `core-js`, we see hundreds of kilobytes of other polyfills — many copies of `es6-promise`, `promise-polyfill`, `whatwg-fetch` ([for the above reason](#web-standards-polyfills), `core-js` _still_ does not polyfill it), `string.prototype.codepointat`, `object-assign` (it's a _ponyfill_ and the next section is about them), `array-find-index`, etc.

But how many polyfills were not detected? What's the size of all polyfills that this website loads? It seems a couple of megabytes. However, even for _very_ old browsers, at most a hundred kilobytes are more than be enough... And this situation is not something unique — it's a too common problem.

Since many of those polyfills contain just a subset of `core-js` functionality, in the scope of `@core-js/compat`, we could collect data that will show if a module is an unnecessary third-party polyfill or not and, if this functionality is contained in `core-js`, a transpiler or bundler plugin will remove the import of this module or will replace it to the import of suitable `core-js` modules.

The same approach could be applied to get rid of dependencies from old `core-js` versions.

### Globalization of pure version polyfills / ponyfills

One more popular and similar issue is a duplication of polyfills from global and pure `core-js` versions. The pure version of `core-js` / `babel-runtime` is intended for usage in libraries' code, so it's a normal situation if you use a global version of `core-js` and your dependencies also load some copies of `core-js` without global namespace pollution. They use different internals and it's problematic to share similar code between them.

I'm thinking about resolving this issue on the transpiler or bundler plugins side similarly to the previous one (but, sure, a little more complex) — we could replace imports from the pure version with imports from the global version and remove polyfills unnecessary for the target engines.

That also could be applied to third-party ponyfills or obsolete libraries that implement something already available in the JS standard library. For example, the usage of `has` package can be replaced by `Object.hasOwn`, `left-pad` by `String.prototype.padStart`, some `lodash` methods by related modern built-in JS methods, etc.

### Service

Loading the same polyfills, for example, in IE11, iOS Safari 14.8, and the latest Firefox is wrong — too much dead code will be loaded in modern browsers. At this moment, a popular pattern is the use of 2 bundles — for "modern" browsers that will be loaded if native modules are supported, `<script type="module">`, and for obsolete browsers which do not support native modules, `<script nomodule>` (a little harder in a practice). For example, Lighthouse can detect some cases of polyfills that are not required with the `esmodules` target, [let's check the long-suffering Bloomberg website](https://googlechrome.github.io/lighthouse/viewer/?psiurl=https%3A%2F%2Fwww.bloomberg.com%2Feurope&strategy=mobile&category=performance):

![lighthouse](/project/roadmap/lighthouse.webp)

Lighthouse shows just about 200KB in all resources, 0.56s. Let's remember that the site contains about a couple of megabytes of polyfills. [Now Lighthouse detects less than half of the features that it should](https://github.com/GoogleChrome/lighthouse/issues/13440), but even with another half, it's only a little part of all loaded polyfills. Where are the rest? Are they really required for a modern browser? The problem is that the lower bar of native modules support is too low — "modern" browsers will, in this case, need most of the polyfills of stable JS features that are required for old IE, so a part of polyfills is shown in the "unused JavaScript" section that takes 6.41s, a part is not shown at all...

From the very beginning of work on `core-js`, I've been thinking about creating a web service that serves only the polyfills needed for the requesting browser.

The availability of a such service is the only aspect in which `core-js` have lagged behind another project. [`polyfill-service`](https://polyfill.io) from Financial Times is based on this conception and it's a great service. The main problem with this project — it's a great service that uses poor polyfills. This project polyfills only a little part of the ECMAScript features that `core-js` provides, most of the polyfills are third-party and are not designed to work together, too many don't properly follow specs, too unpolished or just dangerous for usage (for example, [`WeakMap` looks like a step-by-step implementation of the spec text](https://github.com/Financial-Times/polyfill-library/blob/554248173eae7554ef0a7776549d2901f02a7d51/polyfills/WeakMap/polyfill.js), but the absence of some non-spec magic cause memory leaking and linear access time that makes it harmful, but here's more — instead of patching, fixing and reusing of native implementation in engines like IE11 where it's available, but does not accept an iterable argument, [`WeakMap` will be completely replaced](https://github.com/Financial-Times/polyfill-library/blob/554248173eae7554ef0a7776549d2901f02a7d51/polyfills/WeakMap/detect.js)). Some good developers try to fix this from time to time, but polyfills themselves are given unforgivably little time, so it's still too far from something that could be recommended for usage.

Creating such a service in the proper form requires the creation and maintenance of many new components. I work on `core-js` alone, the project does not have the necessary support from any company, and the development is carried out with pure enthusiasm, I need to look for funds to feed myself and my family, so I have no time and other resources required for that. However, in the scope of other tasks, I already made some required components, and discussions with some users convinced me that creating a maximally simplified service that you could start on your own server could be enough.

We already have the best set of polyfills, the proper compatibility data, and the builder which could already create a bundle for a target browser. The previously mentioned `@core-js/collector` could be used for optimization — getting only the required subset of modules, plugins for transpilers / bundlers — for removing unnecessary polyfills. Missing a tool for the normalization of the user agent and a service that will bind those components together. Let's call it `@core-js/service`.

#### What should it look like in a perfect world?

- You bundle your project. A plugin on the bundler's side removes all polyfill imports (including third-party, without global pollution, from your dependencies, etc.). Your bundles will not contain any polyfills.
- You run `@core-js/service`. When you run it, `@core-js/collector` checks all your frontend codebase, all your entry points, including dependencies, and collects a list of all required polyfills.
- A user loads a page and requests a polyfill bundle from the service. The service gives the client a bundle compiled for the target browser that contains the required subset of polyfills and uses allowed syntax.

So, with this complex of tools, modern browsers will not load polyfills at all if they are not required, old browsers will load only the required and maximally optimized polyfills.

---

Most of the above is about minimizing the size of polyfills sent to the client — but these are just a little subset of the concepts that it would be good to implement in the scope of `core-js`, however, I think that it's enough to understand that still requires a huge work and this work could significantly improve web development. Whether it will be implemented in practice and whether it will be available as FOSS or as a commercial project is up to you.
