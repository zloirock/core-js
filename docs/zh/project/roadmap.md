---
icon: state
---

# 路线图

JavaScript、浏览器和 Web 开发正在以惊人的速度发展。所有浏览器都需要几乎所有 `core-js` 模块的时代已经一去不复返了。最新的浏览器有很好的标准支持，而且在常见的情况下它们只需要一些 `core-js` 模块来获得最新的语言特性和 bug 修复。一些公司已经放弃了对最近再次被“埋葬”的 IE11 的支持。但是，即使没有 IE，旧的浏览器也会一直存在，现代浏览器也会出现 bug，新的语言特性会定期出现，而且稍后总会出现在浏览器中；所以，如果我们想在开发中使用现代 JS 并尽量减少可能出现的问题，polyfills 会伴随我们很长时间，但它们应该继续发展。

在这里我（几乎）不会写任何关于新增或优化现有的某个 polyfill 的内容（但是，它当然是 `core-js` 开发的主要部分之一），让我们谈谈其他一些关键时刻，而不是关注次要的事情。如果我决定用 `core-js` 做一个商业项目，路线图将适应这个结果。

我试图让 `core-js` 尽可能简洁，但它应该遵循的主要概念之一是在现代 web 中最大限度地发挥作用——客户端不应该加载任何不必要的 polyfills，并且 polyfills 应该尽可能简洁并且经过优化。目前，带有早期提案的 `core-js` 最大的包[压缩后约为 220KB，gzip 后为 70KB](https://bundlephobia.com/package/core-js)——它不是一个小包，它已经够大了——相当于 jQuery、LoDash 和 Axios 的总和——因为这个包包含了 JS 的几乎整个标准库。每个组件的单独大小比替代品的大小小几倍。当然你可以只加载用到了的 `core-js` 功能，并且在极小的情况下，包的大小可以减少到几 KB。正确使用 `core-js` 时，这通常是几十 KB——但是，有一些东西需要努力。[大多数页面包含的图片](https://almanac.httparchive.org/en/2022/media#bytesizes)比整个 `core-js` 包大，大多数用户的网速都在几十 Mbps，所以为什么会这个概念那么重要？

我不想详细重复有关 [JavaScript 的性能开销](https://medium.com/dev-channel/the-cost-of-javascript-84009f51e99e) 的旧帖子，你其中督导为什么添加 JS 会增加用户可以开始与页面交互的时间远远超过添加类似大小的图片的时间——它不只是下载，还有解析、编译、评估脚本，它会阻塞页面渲染。

在太多地方移动互联网还不完善，还在用 3G 甚至 2G。在 3G 的情况下，完全下载 `core-js` 可能需要几秒钟。但是，页面经常包含多个 `core-js` 副本和许多其他重复的 polyfill。一些（主要是移动）互联网提供商的“无限”流量套餐非常有限，使用几 GB 后将速度降低到几 Kbps。连接速度通常也受到许多其他原因限制的。

页面加载速度等于收入。

![conversion](/project/roadmap/conversion.webp)

> 插图来自谷歌搜索的[随机帖子](https://medium.com/@vikigreen/impact-of-slow-page-load-time-on-website-performance-40d5c9ce568a)

`core-js` 的大小随着新增的或优化现有的 polyfill 持续增长。这个问题也阻碍了添加一些大型 polyfill 的障碍——向 core-js 添加 `Intl`、`Temporal` 等功能可能会使最大的包大小增加十几倍，到达几 MB。

`core-js` 的主要杀手级功能之一是它可以使用 Babel、SWC 或手动进行优化，但是，当前的方法只能解决部分问题。为了妥善解决这些问题，现代 web 需要可以简单地集成到当前技术栈中的新一代工具。在某些情况下，比如下面的，这个工具包可以帮助您缩小网页的大小，甚至比没有 `core-js` 时还要小。

我已经在 [**core-js@3, Babel 和展望未来**](../blog/2019/core-js-3-babel-and-a-look-into-the-future.html#展望未来)里写了一些相关的内容，但这些只是原始想法。现在他们正处于试验甚至实现阶段。

由于项目的未来是不确定的，所以在这里写任何具体的日期是没有意义的，我不承诺所有这些都会很快完成，但这是应该争取的目标。

---

### 新的主要版本

`core-js@3` 大约在 4 年前发布——已经过去很久了。对我来说在新版本中添加一些破坏性更改（确保向后兼容性通常有挑战性）并标记为主要版本不是个大问题——但这对用户来说是个大问题。

目前，大约 25% 的 `core-js` 下载是严重过时的 `core-js@2`。很多用户想更新到 `core-js@3`，但是因为他们的依赖使用 `core-js@2`，他们仍然使用过时的版本来避免重复复制（我在 GitHub 上的太多项目中看到了这个问题）。过于频繁的重大更新会使这种情况更加恶化。

但是，最好不要过于执着于兼容过时版本。这个库包含了太多仅出于兼容性而保留的内容。缺少一些长期需要的破坏性更改会对未来产生负面影响。从标准、生态系统和 Web 的变化以及历史遗留如何积累来判断，最好每隔两三年发布一个新的主要版本。

添加我们希望在新的主要版本中看到的所有新内容将花费很多年，这是不可接受的。然而 `core-js` 遵循[语义化版本](https://semver.org/)并且首先发布具有破坏性更改的新主要版本是有意义的（其中一些在下面）是有意义的，大多数新功能都可以添加在次要版本中。在这种情况下，这样的发布可能只需要大约 2-3 个月的全职工作，并且它可能是第一个大小比以前小的 `core-js` 版本 -)

### 直接的 `core-js` 包

### 放弃严重过时的引擎支持

IE 已死。然而，并不是对所有人来说——由于许多不同的原因，仍然有人被迫制作或维护可以在 IE 中运行的网站。`core-js` 是让他们的生活更轻松的主要工具之一。

目前，`core-js` 试图支持所有可能的引擎和平台，甚至包括 ES3 — IE8-。但只有一小部分使用 core-js 的开发者需要 ES3 引擎的支持——目前，IE8- 部分的浏览器大约为 0.1%。对于许多其他用户来说，它会导致问题——更大的包大小和更慢的运行速度。

主要问题来自支持 ES3 引擎：大多数现代 ES 功能都基于 ES5 功能，这些功能在那些老的引擎中不可用。一些功能（比如 getters / setters）不能被 polyfill，所以一些 polyfill（比如 typed array）根本不能在 IE8- 中工作。其他一些需要繁重的解决方法。在你只需要 polyfill 一些简单特性的情况下，包中 `core-js` 大小的主要部分是 ES5 方法的实现（在 polyfill 很多特性的情况下只有百分之几，所以这个问题主要与最小化包有关）。

即使是简单地将 ES5 功能的内部回落替换为直接使用这些原生功能的实现，也可以将最小化的 `core-js` 包大小减少 2 倍以上。重新设计架构后，它将进一步减少。

IE9-10 浏览器部分的市场也已经很小了——目前也是 0.1%。但是考虑放弃他们的支持而不放弃对其他一些具有类似甚至更大限制的过时引擎的支持是没有意义的，例如，Android 4.4.4——总共大约是 1%。将较低的标准提高到比 ES5 更高是一个更困难的决定，至少因为一些非浏览器的引擎。然而，即使在未来放弃对 IE11 的支持也不会像现在放弃对 IE8- 的支持那样带来那么多好处。

### ECMAScript 模块和现代语法

目前 `core-js` 使用 CommonJS 模块。在很长一段时间里它都是最流行的 JavaScript 模块格式，但现在 ECMAScript 提供了自己的模块格式，并且它已经非常流行并且 _几乎_ 无处不在。比如 Deno 和浏览器一样，不支持 CommonJS，但是支持 ES 模块。`core-js` 应该在不久的将来有 ECMAScript 模块版本。但是，例如，在 NodeJS 上，ECMAScript 模块仅在现代版本中受支持——但即使在古老的 NodeJS 版本上，`core-js` 应该可以在没有转译/打包的情况下工作，[Electron 仍然不支持它](https://github.com/electron/electron/issues/21457)等，所以立即摆脱 CommonJS 版本是有问题的。

其他现代语法的情况并不那么明显。目前 `core-js` 使用 ES3 语法。最初是为了最大程度地优化，因为无论如何都应该将其预编译为旧语法。但这只是最初。现在，`core-js` 无法在用户空间中正确转译，应该在转译器配置中被忽略。为什么？例如，让我们看一下 Babel 转换：

- 很大一部分转换依赖于现代内置函数，例如，使用 `@@iterator` 协议的转换——然而`Symbol.iterator`、迭代器和所有其他相关的内置函数都是在 `core-js` 中实现的，并且在 `core-js` 加载之前不存在。
- 另一个问题是使用注入 `core-js` polyfill 的转换来转译 `core-js`。显然，我们不能将 polyfill 注入到它们实现的地方，因为它是循环依赖。
- 其他一些应用于 `core-js` 的变换只是破坏了它的内部——例如，[`typeof` 变换](https://babeljs.io/docs/en/babel-plugin-transform-typeof-symbol)（应该有助于支持被 polyfill 的 symbol）破坏了 `Symbol` polyfill。

然而如果现代引擎捆绑了 polyfill，在 polyfill 代码中使用现代语法可以显着提高源代码的可读性、减小大小并在某些情况下提高性能，因此是时候考虑使用现代语法重写 `core-js` ，通过解决这些问题并针对不同用例发布具有不同语法的版本，使其可转换。

### Web 标准的 polyfill

长期以来，我一直在考虑为 `core-js` 添加最可能的 Web 标准（不仅是 ECMAScript 和密切相关的功能）支持。首先，关于[最小化常用 Web 平台 API](https://common-min-api.proposal.wintercg.org/#index) 的剩余功能（[它是什么？](https://blog.cloudflare.com/introducing-the-wintercg/)），但不仅仅是关于它们。对于所有可能的 Web 开发案例，而不仅仅是 ECMAScript，最好有一个保障性的 polyfill 项目。目前，浏览器支持 Web 标准的情况比支持现代 ECMAScript 特性的情况要糟糕得多。

阻止将 Web 标准 polyfill 添加到 `core-js` 的障碍之一是打包大小的显着增加，但我认为使用当前按需加载 polyfill 的技术和下面写到的技术，我们可以添加 Web 标准的 polyfills 到 `core-js`。

但主要问题是它不应该是简单的 polyfill。正如我在上面所写的，今天 ECMAScript 功能的正确性几乎普遍都不是很糟糕，但我们不能对 web 平台功能这么说。例如，[一个 `structuredClone` polyfill](https://github.com/zloirock/core-js#structuredclone) 是最近添加的。在处理它时，考虑到依赖性，我遇到了 **数百个** 不同的 JavaScript 引擎 bug——我不记得我在添加新的 ECMAScript 功能时看到过类似的错误——出于这个原因，这个我天真地以为可以在几个小时内完成的工作持续了几个月，包括解决所有问题和添加所需的功能。对于 polyfill，与其做坏事，不如什么都不做。适当的测试、polyfill 和确保跨平台兼容性的 web 平台功能需要我花费比 ECMAScript polyfill 更多的资源。因此只有在我有这样的资源的情况下，才会开始向 `core-js` 添加尽可能多的 Web 标准支持。

---

### 新的工具方法更有趣

有人会问为什么它会在这里。转译器等工具与 core-js 项目有什么关系？`core-js` 只是一个 polyfill，这些工具是由其他人编写和维护的。曾经我也认为用一个好的 API 写一个伟大的项目就足够了，只需要解释它的可能性，当它流行起来时，会有一个包含合适第三方工具的生态系统。然而，多年来，我意识到，如果你自己不去做，或者至少不去控制，这就不会发生。

例如，多年来，实例方法无法通过 Babel `runtime` 进行 polyfill，但我已经太多次解释了思路。通过 `preset-env` 进行的 polyfill 无法在实际项目中使用，因为对所需的 polyfill 的检测不完整以及兼容性数据的错误来源，我从一开始就解释了这一点。由于这些问题，我被迫[为了 `core-js@3` 在 2018-2019 年几乎完全重写了这些工具](https://github.com/babel/babel/pull/7646)，之后 我们了解了用于 polyfill 注入的基于静态分析的工具的当前状态。

我敢肯定，如果下面的方法没有在 `core-js` 作用域内实现，它们将根本无法正确实现。

---

为了避免一些与以下文本相关的问题：`core-js` 工具将被移动到作用域中——像 `core-js-builder` 和 `core-js-compat` 这样的工具将分别变成 `@core-js/builder` 和 `@core-js/compat。

### 不仅仅是 Babel：转译器和模块打包器的插件

目前，一些用户由于需要自动注入或优化所需的 polyfill 而被迫仅使用 Babel。目前 Babel 的 [`preset-env`](https://babeljs.io/docs/en/babel-preset-env#usebuiltins) 和 [`runtime`](https://babeljs.io/docs/en/babel-plugin-transform-runtime#core-js-aliasing) 是通过静态分析优化 `core-js` 使用的唯一优秀、知名的方法。从历史上看，它发生是因为我用 polyfill 帮助 Babel。这并不意味着它是唯一或最好的地方。

Babel 只是众多转译器中的一个。TypeScript 是另一个流行的选择。其他转移器现在越来越受欢迎，例如，[SWC](https://swc.rs/)（已经包含 [自动 polyfilling 和 `core-js` 优化工具](https://swc.rs/docs/configuration/supported-browsers)，但它仍然不完美）。但是，为什么我们要谈论转译器层呢？打包器层和工具，如 `webpack` 或 [`esbuild`](https://esbuild.github.io/)（也包含一个集成的转译器）对于 polyfill 的优化更有趣。[Rome](https://rome.tools/) 已经开发了好几年，还没有完成，但它的概念看起来很有前途。

转译器层上基于静态分析的自动 polyfilling 的主要问题之一是，通常并非捆绑包中的所有文件都被转译——例如，依赖项。如果您的某些依赖项需要一个现代内置功能的 polyfill，但您没有在您的用户空间代码中使用这个内置功能，那么这个 polyfill 将不会被添加到 bundle 中。不必要的 polyfills import 也不会从你的依赖项中移除（见下文）。将自动 polyfilling 移动到 bundlers 层解决了这个问题。

当然，与 Babel 相比，在很多地方编写或使用这样的插件是困难的。例如，[现在如果没有一些额外的工具，您将无法在 TypeScript 中使用插件进行自定义转换](https://github.com/microsoft/TypeScript/issues/14419)。然而，有志者事竟成。

`core-js` 的自动 polyfill 和优化应该不仅在 Babel 中可用。在 `core-js` 项目作用域为所有转译器和打包器编写维护插件几乎不可能，但是可以做这些事情：

- 完善 `core-js` (`@core-js/compat`) 提供的数据和与第三方项目集成的工具，它们应该是全面的。例如，“内置定义”仍然在 Babel 一边，导致它们在其他项目中的重用出现问题。
- 由于一些工具已经提供了 `core-js` 集成，所以帮助他们也是有意义的，而不仅仅是 Babel。
- 为 `core-js` 项目范围内的一些重要工具编写和维护插件是有意义的。至于是哪个？ 我们会看到的。

### polyfill 收集器

上面解释了文件层上基于静态分析的自动填充的问题之一（Babel `preset-env` 的`usage` 填充模式），但这不是唯一的问题。让我们谈谈其他一些。

您的依赖项可能有自己的 `core-js` 依赖项，并且它们可能与您在项目根目录中使用的 `core-js` 版本不兼容，因此直接将 `core-js` 导入注入到您的依赖项中可能会导致损坏.

项目通常包含多个入口点、多个包，并且在某些情况下，将所有 `core-js` 模块正确移动到一个 chunk 中可能会出现问题，并且可能导致每个包中的 `core-js` 重复。

我已经在上面发布了 [`core-js` 使用统计数据](https://gist.github.com/zloirock/7331cec2a1ba74feae09e64584ec5d0e)。在许多情况下，您会看到 `core-js` 的重复——它只出现在应用的第一个加载页面上。有时甚至就像我们在彭博社网站上看到的那样：

![bloomberg](/project/roadmap/bloomberg.webp)

[前段时间这个数字更高。](/project/roadmap/bloomberg2.webp) 当然，这样数量的重复和 `core-js` 的各种版本并不典型，但是正如上面那样，`core-js` 重复太常见了，影响了使用 `core-js` 的网站中的约一半。为了防止发生这种情况，**需要一个新的解决方案来从项目的所有入口点、捆绑包和依赖项中收集所有 polyfill。**

让我们为这个 `@core-js/collector` 调用一个工具。这个工具应该有一个入口点或一个入口点列表，并且应该使用与 `preset-env` 中使用的相同的静态分析，但是，这个工具不应该转换代码或注入任何东西，而应该检查完整的依赖树并且返回一个所需 `core-js` 模块的完整列表。作为一个需求，它应该很容易集成到当前的技术栈中。一种可能的方法是在插件中使用新的 polyfill 模式，我们叫它`收集`——在一个地方加载应用的所有 polyfill 并删除不必要的（见下文）。

### 删除不必要的第三方 polyfill

例如，现在通常会在一个网站上看到十几个具有相同功能的 `Promise` polyfill——您只从 `core-js` 加载一个 `Promise` polyfill，但是您的一些依赖项自身加载 `Promise` polyfill——来自另一个 `core-js` 副本的 `Promise` polyfill，`es6-promise`、`promise-polyfill`、`es6-promise-polyfill`、`native-promise-only` 等等。但这只是 ES6 `Promise` 已经完全被 `core-js` 涵盖——并且在大多数没有 polyfills 的浏览器中可用。有时，由于这个原因，打包后所有 polyfill 的大小都会膨胀到几 MB。

它不是这个问题的理想描述，许多其他例子会更好，但是既然上面我们开始谈论彭博社网站，让我们再看一次这个网站。我们无法访问源代码，但是，例如，我们拥有 [`bundlescanner.com`](https://bundlescanner.com/website/bloomberg.com%2Feurope/all) 这样一个很棒的工具（我希望彭博社的团队尽快修复它，这样结果可能会过时）。

![bundlescanner](/project/roadmap/bundlescanner.webp)

从实践中可以看出，由于这样的分析不是一项简单的工作，因此该工具只能检测到大约一半的库代码。然而，除了 450 KB 的 `core-js` 之外，我们还看到了数百 KB 的其他 polyfill——许多份 `es6-promise`、`promise-polyfill`、`whatwg-fetch`（[出于上述原因](#web-标准的-polyfill)、`core-js` _仍然_ 不 polyfill 它），`string.prototype.codepointat`、`object-assign`（这是一个*ponyfill*，下一节是关于它们的）、`array-find-index` 等。

但是有多少 polyfill 没有被检测到？ 该网站加载的所有 polyfill 的大小是多少？ 似乎有几兆字节。然而，即使对于*非常*旧的浏览器，最多 100 KB 也绰绰有余……而且这种情况并不是独一无二的——这是一个太普遍的问题。

由于这些 polyfill 中的许多只包含 `core-js` 功能的一个子集，在 `@core-js/compat` 的范围内，我们可以收集数据来显示模块是否是不必要的第三方 polyfill，并且，如果此功能包含在 `core-js` 中，那么转译器或打包器插件将移除此模块或将其替换为合适的 `core-js` 模块。

相同的方法可以用来解决旧 `core-js` 版本的依赖。

### 纯净版本 polyfills/ponyfills 的全球化

一个更流行和相似的问题来自全局和纯净版本 `core-js` 的 polyfills 的重复。`core-js` 或 `babel-runtime` 的纯净版本是为了在库的代码中使用，所以如果你使用全局版本的 `core-js` 并且你的依赖项也加载一些没有全局命名空间污染的 `core-js` 副本是正常的情况。它们使用不同的内部结构，并且在它们之间共享相似的代码是有问题的。

我正在考虑在转译器或打包器插件方面解决这个问题，类似于之前的问题（但是，当然，有点复杂）——我们可以用从全局版本导入代替从纯净版本导入，并删除不必要的 polyfill 目标引擎。

这也可以应用于第三方 ponyfill 或过时的库，它们实现了 JS 标准库中已经可用的东西。例如，`has` 包的用法可以替换为 `Object.hasOwn`，`left-pad` 可以替换为 `String.prototype.padStart`，一些 `lodash` 方法可以替换为相关的现代 JS 内置方法等。

### service

加载相同的 polyfills 是错误的，比如在 IE11、iOS Safari 14.8 和最新的 Firefox 中——在现代浏览器中会加载太多不会运行的代码。目前，一种流行的模式是使用两个包——用于在支持原生模块加载的现代浏览器的 `<script type="module">`，以及用于不支持原生模块的过时浏览器的 `<script nomodule>`（在实践中有点难）。例如，Lighthouse 可以检测到一些 esmodules 目标不需要的 polyfill 案例，[让我们看看多灾多难的彭博社网站](https://googlechrome.github.io/lighthouse/viewer/?psiurl=https%3A%2F%2Fwww.bloomberg.com%2Feurope&strategy=mobile&category=performance)：

![lighthouse](/project/roadmap/lighthouse.webp)

Lighthouse 显示所有资源大约 200KB，0.56 秒。注意这个网站包含大约几 MB 的 polyfill。[现在 Lighthouse 检测不到它应有的一半功能](https://github.com/GoogleChrome/lighthouse/issues/13440)，但即使有另一半，它也只是所有加载的 polyfill 的一小部分。其余的在哪里？现代浏览器真的需要它们吗？问题是原生模块支持的下限太低——在这种情况下，“现代”浏览器需要旧 IE 所需的大部分稳定 JS 功能的 polyfill，因此部分 polyfill 显示在“未使用的 JavaScript”部分耗时 6.41 秒，有一部分根本没有显示……

从 `core-js` 的非常早期起，我就一直在考虑创建一个 Web 服务，只提供请求浏览器所需的 polyfill。

此类服务的可用性是 `core-js` 落后于另一个项目的唯一方面。Financial Times 的 [`polyfill-service`](https://polyfill.io) 就是基于这个概念，它是一个很棒的服务。这个项目很伟大，但它的主要问题是它使用了糟糕的 polyfill。这个项目只 polyfill 了 `core-js` 提供的一小部分 ECMAScript 特性，大多数 polyfill 都是第三方的，并不是为了协同工作而设计的，太多的 polyfill 没有正确遵循规范，太粗糙或者使用起来很危险（例如，[`WeakMap` 看起来像一个循序渐进规范文本的实施](https://github.com/Financial-Times/polyfill-library/blob/554248173eae7554ef0a7776549d2901f02a7d51/polyfills/WeakMap/polyfill.js)，但一些非规范的魔法会导致内存泄漏和有害的线性访问时间，还有更多——不接受可迭代的参数而不是在 IE11 等引擎中修补、修复和重用原生实现，[`WeakMap` 将被完全替换](https://github.com/Financial-Times/polyfill-library/blob/554248173eae7554ef0a7776549d2901f02a7d51/polyfills/WeakMap/detect.js)。一些优秀的开发人员不时尝试修复此问题，但花在 polyfill 本身上的时间很傻搜，因此离推荐还差得很远。

以适当的形式创建这样的服务需要创建和维护许多新组件。我一个人做 `core-js`，这个项目没有任何公司的支持，只依靠纯粹的热情进行开发，我需要寻求捐款来养活自己和家人，所以我没有这个项目所需的时间和其他资源。然而，在其他任务范围内，我已经制作了一些必需的组件，并且与一些用户的讨论使我确信创建一个可以在自己的服务器上启动的最简化的服务就足够了。

我们已经拥有最好的 polyfill 集、适当的兼容性数据以及已经可以为目标浏览器创建捆绑包的构建器。前面提到的 `@core-js/collector` 可以被用于优化——仅获取所需的模块子集、转译器或打包器的插件——用于删除不必要的 polyfill。缺少格式化 UA 的工具和将这些组件绑定在一起的服务。我们称它为 `@core-js/service`。

#### 一个完美的世界应该是什么样子的？

- 你打包你的项目。打包器端的插件会删除所有 polyfill 导入（包括第三方来自依赖项等的全局的污染）。您的包中没有任何 polyfill。
- 你运行 `@core-js/service`。当您运行它时，`@core-js/collector` 会检查你的所有前端代码库、所有入口点（包括依赖项），并收集所有必需的 polyfill 的列表。
- 用户加载页面并从服务请求 polyfill 包。该服务为客户端提供一个为目标浏览器编译的包，其中包含所需的 polyfill 子集并使用允许的语法。

因此，使用这种复杂的工具，如果不需要的话，现代浏览器根本不会加载 polyfill，而旧浏览器只会加载必需的和最大程度优化的 polyfill。

---

上面的大部分内容都是关于最小化发送到客户端的 polyfill 的大小——但这些只是概念的一小部分，在 `core-js` 的范围内实现会很好，但是我认为理解这仍然需要大量的工作，而这项工作可以显著改善 Web 开发就足够了。它是否会被付诸实践以及它是 FOSS 还是商业项目取决于你。
