<p align="center"><img alt="core-js" src="https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png" /></p>

# 那么，接下来是什么？(So, what's next?)

嗨，我是 **[@zloirock](https://github.com/zloirock)**，一个全职开源开发者。我不喜欢写长帖子，但似乎是时候写了。

最初，这篇文章应该是一篇关于开发 core-js 最新主要版本和关于其路线图的帖子（它被移到了后半部分），然而，由于最近的事件，它变成了一篇关于许多不同事情的长篇帖子...... 我他妈的累了（I'm fucking tired）。自由和开源软件从根本上被玩坏了。我可以默默地停止做这件事，但我想给开源最后一次机会。

<details>
<summary><b>🔻 点击查看如何提供帮助 🔻</b></summary>

如果你或你的公司以这样或那样的方式使用 `core-js`，并且你对你的供应链质量感兴趣，请支持这个项目：

- [**Open Collective**](https://opencollective.com/core-js)
- [**Patreon**](https://patreon.com/zloirock)
- [**Boosty**](https://boosty.to/zloirock)
- **Bitcoin ( bc1qlea7544qtsmj2rayg0lthvza9fau63ux0fstcz )**
- [**支付宝**](https://user-images.githubusercontent.com/2213682/219464783-c17ad329-17ce-4795-82a7-f609493345ed.png)

**如果你能在 Web 标准和开源方面提供一份好工作，请写信给我。**
</details>

## 什么是 [`core-js`](https://github.com/zloirock/core-js)？

- 它是 JavaScript 标准库中最受欢迎和最通用的 polyfill，它支持最新的 ECMAScript 标准和提案，从古老的 ES5 功能到 [iterator helpers](https://github.com/tc39/proposal-iterator-helpers)) 等前沿功能，以及与 ECMAScript 密切相关的 Web 平台功能，如 structuredClone。

- 它是最复杂、最全面的 polyfill 项目。在发布这篇文章时，core-js 包含大约 5000 个具有不同复杂程度的 polyfill 模块，从 Object.hasOwn 或 Array.prototype.at 到 URL、Promise 或 Symbol，这些模块旨在协同工作。使用不同的架构，它们每个都可以是一个单独的包 —— 虽然，可能有人并不喜欢这样。

- 它做到了最大程度的模块化 —— 你可以轻松（甚至自动）选择仅加载你将使用的功能。它可以在不污染全局命名空间的情况下使用（有人称这种用例为“ponyfill”）。

- 它专为与工具集成而设计，并为此提供了所需的一切。例如，@babel/preset-env，@babel/transform-runtime，以及类似的 SWC 功能，这些都是基于 core-js 的。

- 它是开发人员多年来每天在开发过程中使用现代 ECMAScript 功能的主要原因之一，但大多数开发人员只是不知道他们之所以有这种可能性，是因为 core-js，因为他们间接使用 core-js，因为它是由他们的 transpilers / 框架 / 中间包（如 babel-polyfill）提供的。

- 它不是一个框架或库，开发人员需要了解框架和库的 API，定期查看文档，或者至少记住他或她正在使用它。而对于 core-js 而言，即便开发人员直接使用它 —— 也只是一些导入行或配置中的一些行（在大多数情况下 —— 会配置错误，因为几乎没有人阅读文档），之后，他们忘记了 core-js，只是使用由 core-js 提供的 Web 标准的功能 —— 但有时这是他们使用最多的 JS 标准库。

> 译者注：为了理解本文，读者需要知道 `polyfill` 的含义。polyfill 是填充物的意思，是指在一种材料中填充另一种材料，比如用玻璃胶填充混凝土表面的裂缝，达到光滑平整的效果；再如填充在玩具或沙发中，让被填充物更温暖舒适。在 JavaScript 语境中，polyfill 意味着用于向旧版浏览器添加其并不支持的 JavaScript 新版标准的功能。通常，polyfill 是一种 JavaScript 库或代码，它可以检测当前环境的功能支持，并在缺少的情况下提供相应的实现。

[core-js 总共有 90 亿次 NPM 下载以及每月 2.5 亿次 NPM 下载](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=core-js-bundle&from=2014-11-18), GitHub 上有 1900 万个仓库依赖它 ([global](https://github.com/zloirock/core-js/network/dependents?package_id=UGFja2FnZS00ODk5NjgyNDU%3D) 和 [pure](https://github.com/zloirock/core-js/network/dependents?package_id=UGFja2FnZS00MjYyOTI0Ng%3D%3D)），这是很大的数字，但并不能直观展示 core-js 的真正传播。让我们用其他方式查看一下。

我写了个 [简单的脚本](https://github.com/zloirock/core-js/blob/master/scripts/usage/usage.mjs)，通过 Alexa 顶级网站列表检查 core-js 的使用情况。我们可以知道 core-js 的应用情况（以及各网站所使用的版本）。

<p align="center"><img alt="usage" src="https://user-images.githubusercontent.com/2213682/218452738-859e7420-6376-44ec-addd-e91e4bcdec1d.png" /></p>

在 TOP 1000 网站上运行这个脚本，**我检测到 [52%](https://gist.github.com/zloirock/7ad972bba4b21596a4037ea2d87616f6) 的测试网站对 core-js 的使用情况**。由于每天情况并不太一样（列表、网站等不是常数），结果可能会有百分之几的差异。然而，这只是使用现代浏览器对网站主页的粗略检测，很多使用并没有测出来，**如果手动检查，会发现使用量增加百分之几十**。例如，上面截图中某些网站没有被脚本发现使用了 core-js，但去他们主页手工看一下就会发现他们也用了（`请耐心点`，在下面的一系列屏幕截图之后，就没有这么多图片了）：

<p align="center"><img alt="whatsapp" width="720" src="https://user-images.githubusercontent.com/2213682/153953087-8e3891aa-f00a-4882-a338-f4cc7496581b.png" /></p>

---
<p align="center"><img alt="linkedin" width="720" src="https://user-images.githubusercontent.com/2213682/190879234-30c15dbb-cd5e-4056-8f32-2eac67ef9e89.png" /></p>

---
<p align="center"><img alt="netflix" width="720" src="https://user-images.githubusercontent.com/2213682/213377001-2af36bac-0577-4e34-a4fc-a49ca06e9f04.png" /></p>

---
<p align="center"><img alt="qq" width="720" src="https://user-images.githubusercontent.com/2213682/213378031-57496cb0-b6b6-4cc8-9656-f126820db26f.png" /></p>

---
<p align="center"><img alt="ebay" width="720" src="https://user-images.githubusercontent.com/2213682/213379258-eba54efb-1c65-451a-91af-9f9978ece5a7.png" /></p>

---
<p align="center"><img alt="apple" width="720" src="https://user-images.githubusercontent.com/2213682/161145359-812efe4c-33c9-4905-96b9-fef23d2d969e.png" /></p>

---
<p align="center"><img alt="fandom" width="720" src="https://user-images.githubusercontent.com/2213682/218451581-5cae922c-f782-4e44-8385-a443ef0f8232.png" /></p>

---
<p align="center"><img alt="pornhub" width="720" src="https://user-images.githubusercontent.com/2213682/174662177-5767c34b-f347-4045-96da-5b0783a1345b.png" /></p>

---
<p align="center"><img alt="paypal" width="720" src="https://user-images.githubusercontent.com/2213682/218453759-d15fc6c4-4246-479d-aea6-b9123ecb59a2.png" /></p>

---
<p align="center"><img alt="binance" width="720" src="https://user-images.githubusercontent.com/2213682/213380797-70a61338-2152-4642-b0e7-affebe2c3b71.png" /></p>

---
<p align="center"><img alt="spotify" width="720" src="https://user-images.githubusercontent.com/2213682/213381068-fb73821f-3cfa-4f37-9096-305587c16ef8.png" /></p>

**通过这样的手动检查，你可以在前 100 个网站的 75-80% 的网站上找到 core-js**，而检测脚本只在 55-60% 的网站上找到它。当然，在较大的样本中，百分比会下降。

[Wappalyzer](https://www.wappalyzer.com/technologies/javascript-libraries/) 使用浏览器插件检测一个网站使用的技术（包括 core-js），在他们之前的统计数据中，能够看到很有趣的结果，但现在他们的网站上，所有最受欢迎的技术的公开结果，最多也就只显示 500 万之多。基于 Wappalyzer 结果的统计[数据](https://almanac.httparchive.org/en/2022/javascript#library-usage)，在 800 万个移动页面和 500 万个桌面页面中，有 41% 和 44% 显示使用了 core-js。[Built With 显示前 10000 个网站中有 54% 使用了 core-js](https://trends.builtwith.com/javascript/core-js)（我不确定其检测的完整性）。

无论如何，我们可以自信地说，**大多数热门网站都在使用 core-js**。即使 core-js 没有在大公司的主要网站上使用，肯定也用在了他们的其他项目上。

还有什么 JS 库在网站更流行？不是 [React](https://trends.builtwith.com/javascript/React)、[Lodash](https://trends.builtwith.com/javascript/lodash) 或任何其他人们经常谈及的库或框架，我能确定的只有 [“又老又好”的 jQuery](https://trends.builtwith.com/javascript/jQuery)。

core-js 不仅仅是在网站的前端 —— 它几乎在所有使用 JavaScript 的地方 —— 我认为这从来没有被认真统计过。

<p align="center"><img alt="github" src="https://user-images.githubusercontent.com/2213682/211223204-ec62ea94-1df8-4a91-a9b2-4e85aef24677.png" /></p>

然而，由于上述原因，**[几乎没有人记得他或她使用了 core-js](https://2022.stateofjs.com/en-US/other-tools)**。

我为什么要发表此文？不是为了展示我有多酷，而是为了展示一切有多糟糕。请继续读。

---

## 让我们从一张流行的 xkcd 图片开始下一部分

[<p align="center"><img alt="xkcd" src="https://user-images.githubusercontent.com/2213682/113476934-c70f0900-94a8-11eb-8723-d080f129a449.png" /></p>](https://xkcd.com/2347/)

> 译者注：图片来自：https://xkcd.com/2347/

### 缘起

2012 年，我把我的开发栈切换到了全栈 JavaScript。当时 JavaScript 仍然太原始 —— IE 仍然比其他任何东西都更受欢迎，ES3 时代的浏览器仍然占据了 Web 的主要部分，最新的 NodeJS 版本是 0.7 —— 它才刚刚开始。JavaScript 仍然不适用于编写严肃的应用程序，开发人员用 CoffeeScript 语言转译器，解决了 JavaScript 所缺乏的语法糖问题，用 Underscore 等解决了 Javascript 缺乏标准库的问题。然而，他们并不是标准，随着时间的推移，这些语言和库连同使用它们的项目一起过时了。因此，我满怀希望地期待即将到来的 ECMAScript ~~Harmony~~ 6 标准。

旧 JavaScript 引擎仍然流行，用户并不着急，还没有什么机会放弃它们，即使新的 ECMAScript 标准有着快速和可靠的优点，想让 JavaScript 引擎支持这个新标准，也要等很多年。但可以使用一些工具尝试使用新标准，让转译器（这个词不像现在这么流行）和标准库来解决语法和 polyfill 的问题。当时，这些工具包才刚刚出现。

那时，ECMAScript 转译器开始流行并发展迅速。而与此同时，polyfill 几乎没有根据用户和实际项目的需求而发展。它们不是模块化的，并可能带来全局命名空间污染 —— 它们不适合做库。它们不是单一复合体 —— 而是需要用多个来自不同作者的不同的 polyfill 库，并以某种方式使它们工作在一起 —— 在某些情况下，这几乎是不可能的。太多必要的基本语言功能都还没有实现。

为了解决这些问题，2012 年底，我开始研究一个后来被称为 core-js 的项目，一开始仅仅是为了我自己的需要。为了让所有 JS 开发人员的生活更轻松，2014 年 11 月，我开源发布了 core-js。**也许这是我一生中最大的错误。**

由于我不是唯一一个面临这些问题的人，几个月后，core-js 已经成为 JavaScript 标准库 polyfill 的事实标准。core-js 被集成到 Babel（当时叫 `6to5`）中，它在 core-js 发布前几个月就出现了 —— 上面谈及的一些问题也是该项目所致力解决的。core-js 开始作为 `6to5/polyfill` 分发，后来更名为 babel-polyfill。经过几个月的合作、品牌重塑和演化后，babel-runtime 出现了，又几个月后，core-js 被集成到其关键框架中。

### 保障整个 Web 的兼容性

**我没有宣传自己，也没有宣传这个项目。这是第二个错误。** core-js 没有网站或社交媒体帐户，只有 GitHub。我没有在会议上谈论它。我几乎没有写任何关于它的帖子。我只是在制作一个非常有用的东西，并使之成为现代开发栈的一部分，对此我很高兴。我给了开发人员一个机会，让他们使用最现代和真正必要的 JavaScript 功能，而不需要等待多年（等它们在所有引擎中实现），并且无需考虑兼容性和错误。人们开始使用它，项目的传播呈指数级增长，很快，它已经在百分之几十的热门网站上使用。

> 译者注：注意，上面这段是作者最后悔的部分。

然而，这只是所需工作的开始，之后跟随的是常年的辛勤工作。我几乎每天都花几个小时在 core-js 和相关项目（主要是 Babel 和 [compat-table](https://kangax.github.io/compat-table/es2016plus/)）的维护上。

![github](https://user-images.githubusercontent.com/2213682/218516268-6ec765a5-50df-4d45-971f-3c3fc4aba7a1.png)

core-js 不是一个只有几十行代码的库，这种库你写完就可以忘掉它。与绝大多数库不同，它与 Web 的状态息息相关。它对 JavaScript 标准或提案的任何更改、任何 JS 引擎新发布、任何 JS 引擎中新的 bug 要做出反应。ECMAScript ~~6~~ 2015 之后跟着的是新提案、新版本的 ECMAScript、新的非 ECMAScript Web 标准、新引擎和新工具等。项目的演变、改进以及对 Web 当前状态的适配从未停止过 —— 几乎所有这些工作，对普通用户来说，仍然是看不见的。

越来越多的工作需要我做。

长期以来，我试图以不同的方式为 core-js 找到维护者或至少是持续的贡献者，但所有尝试都失败了。几乎每个 JS 开发人员都间接使用 core-js，他们知道 babel-polyfill、babel-runtime，他们知道自己所用的框架里已经 polyfill 了所必需的功能，但几乎没有人知道 core-js。在一些提到 core-js 的关于 polyfill 的帖子中，它被称为“`一个小库`”。这不是一个时髦的被广泛讨论的项目，如果它做得很好，为什么要帮助维护它呢？随着时间的推移，我失去了希望，但我觉得我对社区有责任，所以我被迫继续独自工作。

几年后，全职工作和 `FOSS`（`译者注：FOSS 即自由和开放源码软件`）几乎变得不可能 —— 没有人愿意为你在工作时间致力于 FOSS 而付钱，仅仅用非工作时间是不够的，有时，core-js 需要完全沉浸式的开发，而且是几周的时间。我认为社区需要适当的 polyfill，而钱并不是我的第一任务。

我辞去了一份高薪工作，并且拒绝了一些非常好的职位选择，因为在这些职位上，我不能投入足够的时间从事开源。我开始全职从事开源工作，没有人给我付钱。我希望或早或晚，我能找到一份可以完全致力于开源和 Web 标准的工作。我定期通过短期合同赚取在 FOSS 上生活和工作所需的钱。我回到了俄罗斯，在那里可以用相对较少的钱获得体面的生活水准。**我又犯了一个错 —— 正如你将在下面看到的，钱其实很重要。**

---

直到 2019 年 4 月，大约一年半时间，我没有分心干任何别的，我把所有时间都致力于 core-js@3，[并从根本上改进了 Babel 的 polyfill 工具](https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md)，这是工具集（toolkit）生成的基础，现在几乎到处都在使用。

### 事故

坏事发生在 core-js@3 发布 3 周后。一个四月的晚上，凌晨 3 点，我开车回家。两个穿着深色衣服的醉酒的 18 岁女孩决定以 **爬** 的方式穿过一条光线很差的高速公路 —— 其中一个躺在路上，另一个坐着并拽着第一个，她们并不在人行道上 —— 而是直接在我的车轮下。目击者就是这么说的。我绝对没有机会看到他们。还有一名目击者说，在事故发生之前，她们只是在路上开玩笑地打闹。这并没什么不寻常，这是俄罗斯。其中一个女孩死了，另一个女孩进了医院。然而，即使在这种情况下，根据俄罗斯的仲裁惯例，如果司机不是议员或类似什么人的儿子，他几乎总是被判有罪 —— 他必须要看到并预测一切，行人不负任何责任。我可能会在监狱里呆很长时间，如果我没有记错，检察官要求判我 7 年。

不入狱的唯一方法是与“受害者”和解 —— 这是此类事故后的标准做法 —— 并且还要有一名好律师。在事故发生后的几周内，我收到了“受害者”亲属当时以汇率计算的总额约为 8 万美元的资金索赔。律师也需要一大笔钱。

对于一个好的软件工程师来说，也许这不是一笔不可思议的钱，但是，正如我上面所写的，我长期全职在 core-js@3 版本上工作。没有人为这项工作付钱给我，我之前就已经花尽了所有的财务储备，所以，我没有那么多钱，也没有办法找到所需的钱。我的时间不多了。

### 筹钱

那时，core-js 的使用几乎和现在一样广泛。正如我上面所写，我为 core-js 寻找了很长时间的贡献者，但没有任何成功。然而，core-js 是一个应该积极维护的项目，它不能一直冻结。我的长期监禁不仅会给我带来问题 —— 而且也会给 core-js 带来死亡，给每个使用它的人带来问题 —— 有一半的 Web 都在用它。考虑一下令人头疼的 [巴士因子](https://en.wikipedia.org/wiki/Bus_factor)。

> 译者注：`巴士因子`：一个项目里的关键人员如果突然被巴士撞了，项目会怎么样？

在事件发生几个月前，我开始筹集资金来支持 core-js 开发（主要发布在 GitHub 的 README 中和 NPM 上）。结果是...... 57 美元/月。这就是全职工作以确保整个 Web 兼容性的“合理回报”。

于是我决定做一个小实验 —— 向 core-js 用户寻求帮助 —— 如果没人维护 core-js，他们将首先遭受痛苦。我在 core-js 安装后添加了一条消息：

![postinstall](https://user-images.githubusercontent.com/2213682/153024428-28b8102c-ce08-461c-af99-d0417dc7d2cd.png)

> 译者注：上面这段提示主要是向用户请求资金捐助，给出了两个捐助网站，并在最后一句说：“core-js 的作者正在找一个好工作。”

我知道我无法从捐款中获得所需的钱，但是，每一美元都很重要。我添加了一条求职消息，以便有机会获得捐赠之外的钱。我想，NPM 安装日志中的几行帮助请求（如果需要，可以隐藏）是可以接受的。我最初想的是在几周内删除这条消息，但一切都偏离了计划。**我对人的看法是有多错......**

### 恨

当然，我知道有人不希望在他们的控制台中看到帮助请求，但我收到的恨意简直淹没了我的房顶，每天有数百条消息、帖子和评论，都在表达他们的恨意。所有这些都可以简化为：

<p align="center"><img alt="get-rid" width="720" src="https://user-images.githubusercontent.com/2213682/154875165-2b144651-5769-4f8e-9072-3a1a03bfe164.png" /></p>

> 译者注：标题翻译：让这个 SB zloirock 和他的 core-js 库去死吧

这远远不是我所见过的最搞笑的事 —— 如果我愿意，我能收集到 [大量这种风格的“恨开源”评论](https://github.com/samdark/opensource-hate) —— 但我不会这样，我的生活中已经足够多负面东西了。

**开发人员喜欢使用免费的开源软件 —— 免费，效果好。他们对背后数千小时的开发不感兴趣，他们对项目背后那个真人的问题和需求不感兴趣。他们认为，提及这些就是对他们个人空间的侵犯，甚至是对他们个人的冒犯。对他们来说，这些开源项目，就是一些齿轮，应该自动耦合，不应该有任何噪音，也不应该要他们参与。**

因此，成千上万的开发人员侮辱我，并声称我无权向他们寻求任何形式的帮助。我的帮助请求如此冒犯了他们，以至于他们开始要求限制我对仓库和包的访问，并要求将它们转移到其他人那里，就像曾经对 [left-pad](https://arstechnica.com/information-technology/2016/03/rage-quit-coder-unpublished-17-lines-of-javascript-and-broke-the-internet/) 那样。他们中几乎没有人了解 core-js 的作用和规模，当然，也没有人想维护它 —— 它应该由“社区”和其他人来维护。我看到所有这些仇恨，为了不被他们影响，我没有删除安装包的请求帮助信息，本来我只想让它存在几周。

**求助于那些用 core-js 赚大钱的大公司？那可几乎是每家大公司。让我们稍微改一下这条 [旧推文](https://twitter.com/AdamRackis/status/931195056479965185)：**

> 公司：“我们想使用 SQL Server 企业版”
>
> MS：“这需要 25 万美元 + 2 万美元/月”
>
> 公司：“好的！”
> ...
>
> 公司：“我们想使用 core-js”
>
> core-js：“简单，执行 npm i core-js 就可以了”
>
> 公司：“酷！”
>
> core-js：“你想在经济上做出贡献吗？”
>
> 公司：“哈哈，不”

> _译者注：这条旧推文是 @AdamRackis 于 2017 年 11 月 17 日发布的，里面原先写的是 Babel，在此文中改为 core-js_

几个月后，厌倦了用户的投诉，NPM 推出了 [npm fund](https://docs.npmjs.com/cli/v6/commands/npm-fund) —— 这不是解决问题的办法，这只是摆脱这些投诉的一种方式。你多久会敲一下 npm fund？你多久会向 npm fund 中的人捐款？你会先看到谁并支持他？是 core-js 还是维护着十几个单行库（并且相互依赖）的人？npm fund 为 NPM 的未来步骤提供了完美的理由（请往下阅读）。

在 9 个月内，数千名开发人员，包括重度依赖 core-js 的项目开发人员，了解了我的状况 —— 但没有人提出要维护 core-js。几个月内，我与一些依赖 core-js 的重要项目的维护人员进行了交谈，但没有取得任何成功 —— 他们没有必要的时间资源。因此，我不得不要求一些与 FOSS 社区无关的朋友（起初是 [@slowcheetah](https://github.com/slowcheetah)，感谢他的帮助）替代我，至少尝试解决那些比较重大的 issue，在我重获自由之前。

---

有个别用户和小公司支持了 core-js —— 我非常感谢他们。然而，9 个月内筹集的资金仅为所需资金的 1/4 左右，你们知道，我需要 8 万美元解决困境，而且应该是在几周之内。

就在这段时间，不管怎么样，每天 core-js 的下载量几乎翻了一番。

2020 年 1 月，我进了监狱。

### 出狱

我不想说太多关于监狱的事，我也不想记住那些。那是在一家化工厂的奴隶般劳动，在那里我的健康严重受损，我 24/7 和毒贩、小偷和杀手们在一起，共渡了难忘的时光，而且，还无法访问互联网和计算机。

大约 10 个月后，我被提前释放了。

---

我看到了数十篇文章、数百篇帖子和数千条评论，其中许多评论的本质，大概就是这样的：

<p align="center"><img alt="reddit" width="720" src="https://user-images.githubusercontent.com/2213682/218419779-d61c9e39-c8c1-412b-83aa-eb1b12d2e760.png" /></p>

> 译者注：上面这段话的翻译：这家伙是个大混蛋。他绝对是我在 Github 上遇到的最糟糕的维护者，无人能及。不知道他因什么进了监狱，但我很高兴看到他离开这里。

他们到底认为我做错了什么？是的，我犯了上面所说错。我看到一些人支持开发 core-js，看到许多 issue，问题和消息 —— 但比那些恶评要少。与此同时，core-js 变得更受欢迎，已经达到了和现在一样的使用比例。

### 继续，保障整个 Web 的兼容性

出狱后，我像以前一样回到了 core-js 维护。而且，我完全不再被合同和任何其他工作分散注意力，我只是在 core-js 上工作。core-js 在融资平台上有一些钱 —— 虽然不多，比我全职从事 core-js 之前收到的少很多倍 —— 但对我来说，这足以维持生活。**这是一种降级。我全职开源，为了让世界变得更美好......** 我不考虑事故遗留下来的数万美元的诉讼，我也不考虑我的未来，我只是想 Web 有更美好的未来。当然，我希望一些公司能给我提供一个职位，让我有机会从事 Web 标准工作，并赞助我在 polyfill 和 FOSS 方面的工作。

在接下来的两年里，[我在 core-js 工作方面取得了很多成就](https://github.com/zloirock/core-js/compare/0943d43e98aca9ea7b23cdd23ab8b7f3901d04f1...master)，几乎和前 8 年一样多。仍然是 core-js@3 —— 但要好得多。然而，changelog 以及之前的 diff 只反映了一小部分已完成的工作。**几乎所有的工作都在暗处，普通用户看不到。**

这些工作包括 JS 标准和建议方面的基本工作，作为它的连带后果，考虑到我的辛勤工作，以及我反馈和建议后的变化，我认为一些 ECMAScript 提案 —— 许多已成为语言一部分 —— 是我的成就，也是提案拥护者的成就；这些工作包括 core-js 和引擎及其错误跟踪器的调错工作；这些工作包括在数百乃至数千个环境中持续自动或手动/构建/测试以确保标准库在任何地方的正常运行并收集兼容数据。core-js 兼容数据，从一开始仅仅是几天内制作的原型，变成了一个具有外部和内部工具的详尽数据集；这些工作包括对项目中正在开发的许多功能的设计和原型制作；这些工作还有更多，更多。

---

如上所述，core-js 存在于大多数流行的网站中，它提供了一个几乎完整的 JavaScript 标准库，并修复了不正确的实现。使用 core-js 打开的网页多于 Safari 和 Firefox 打开的网页。因此，从某种角度来看，core-js 可以被称为最受欢迎的 JavaScript 运行时之一。

在开发 core-js 时，我是几乎所有现代和未来 JavaScript 标准库功能的第一个实现者，几乎所有功能都有我的反馈，并根据这些功能进行了修复。core-js 是实验 ECMAScript 提案的最佳场地。在非常多的情况下，提案收到的反馈，都是用户在尝试了提案的实验性 core-js 之后提交的。

JavaScript 的最佳前进方式是 TC39 和 core-js 的合作。TC39 邀请 Babel 等项目的成员担任专家，却不找我。我经常看到 TC39 成员忽视我或 core-js，甚至故意制造障碍，他们甚至毫不避讳这点：

> 译者注：TC39 则是 ECMA 为 ES 专门组织的技术委员会（Technical Committee），39 这个数字用来标记旗下的技术委员会。TC39 的成员由各个主流浏览器厂商的代表构成。

<p align="center"><img alt="shu" width="600" src="https://user-images.githubusercontent.com/2213682/140033052-46e53b0c-e1bc-4c84-a1f4-3511d7de604a.png" /></p>

> 上图文字翻译：真正的困难是我现在拒绝与 core-js 的作者接触

---

<p align="center"><img alt="lj" width="800" src="https://user-images.githubusercontent.com/2213682/217476089-604b1629-73a8-4715-9276-a601004f0947.png" /></p>

> 上图文字翻译：polyfill 从来没有也从来不会决定提案如何运作，所以我不知道为什么这个问题一直被提起。

---

一段时间后，NPM 表达了它的“支持”。在 2020 年底发布的 npm@7 中，作为 npm fund 的逻辑延续，控制台禁用了安装后脚本（post-install scripts）的输出。结果是可以预期的，人们不再能看到资金请求，同时，几乎没有人使用 npm fund，所以 core-js 赞助者的数量开始下降。NPM 可真够“支持”我的，它不仅通过分发我的作品来赚钱，而且它自己也在用 core-js :-)

<p align="center"><img alt="npm" width="720" src="https://user-images.githubusercontent.com/2213682/218333796-18bee93f-64e7-4257-8ddd-d16fc4f05989.png" /></p>

> 译者注：这张图表明了 NPM 网站也在用 core-js

此外，另一个因素也在发挥作用。“`质量越高，支持越少`”，这个库维护得很好吗？几乎没有什么处于打开状态的错误报告吧？当有错误时，会立即得到修复吗？这库给了我们几乎所有想要的东西了吧？是吧？那么，我们为什么要支持这个库的维护呢？支持维护者的成本不会停留在表面 —— 对于大多数开发人员和公司来说，它仍然只是“`一个小库`”。许多以前还赞助 core-js 的人，后来都停止了。

core-js 代码包含我的版权。正如你在这篇文章前面看到的，core-js 出现在大约一半的网站上。经常性地，有人在有害网站或应用的源代码中发现它 —— 他们不知道什么是 core-js，他们的技术水平甚至不足以发现它。当这种情况发生时，警察会打电话威胁我，甚至有人试图勒索我。大多数时候，这一点都不好笑。

美国和加拿大记者多次联系我，因为他们在美国新闻和政府网站上发现了 core-js。当他们弄明白的时候，他们非常失望，失望于我不是一个干涉美国选举的邪恶的俄罗斯黑客。

无休止的仇恨流随着时间的推移略有减少，但仍然有。大部分内容从 GitHub issues 或 Twitter Threads 转移到我的邮件或 IM。今天，一位开发人员给我写了一条消息，他称我是开发人员社区的寄生虫，说我的 core-js 到处蔓延传播，没有一点屁用，但却赚了很多钱。他称我和 [Hans Reiser](https://en.wikipedia.org/wiki/Hans_Reiser) 是同样的杀人犯，买通了法官，逃脱了惩罚。他希望我和我所有的亲戚都死。这没有什么不寻常的，我每个月都会收到几条这样的消息。去年，又补充了一种，说我是一个“俄罗斯法西斯主义者”。

### 关于战争说几句

**开源应该脱离政治。**

我不想在两种邪恶之间做出选择。我不会对此发表更详细的评论，边境两边都有我身边的人，他们可能会因此而受罪。

让我提醒你我上面写过的内容：我回到了俄罗斯，因为在那里，可以用相对较少的钱获得体面的生活水平，并专注于 FOSS，而不是赚钱。现在我不能离开俄罗斯，因为在事故发生后，我有数万美元的未决诉讼，在还清它们之前，我被禁止离开这个国家。

### 你猜猜 core-js 每个月能收到多少钱？

当我开始全职维护 core-js 时，没有被合同和任何其他工作分心，**我每月收到的钱大约为 2500 美元 —— 比我通常的全职工作少 4～5 倍。** 记住，这是一种降级，为了让 Web 变得更好，为了让 issues 和 bugs 减少到零，为了制作最高质量的产品，这可是几乎每个人都在用的东西...... 项目将得到足够多的赞助，对吧？对吧？

几个月后，每月收入 **下降到约 1700 美元**（至少我觉得是这么多），通过 Tidelift 是 1000 美元，通过 Open Collective 是 600 美元，通过 Patreon 是 100 美元。除了订阅式的每月捐款，还会有一些一次性捐款（平均每月可能为 100 美元）。

Crypto？通过加密钱包请求捐款是很流行的。然而，一直以来，加密钱包上只收到了 2 笔总额约为 200 美元的转账，最后一次是在一年多前。GitHub 赞助商？它在俄罗斯不可用，所以从来没有过。PayPal？这是禁止俄罗斯人使用的，当它可用时，core-js 在这段时间里收到了大约 60 美元。补助金？我申请了很多补助金 —— 所有申请都被忽略了。

**在这些捐赠中，[Bower](https://bower.io/) 作为另一个 FOSS 社区，提供了主要部分：每月 400 美元。我也非常感谢[所有其他赞助商](https://opencollective.com/core-js#section-contributors)：由于您的捐款，我仍在为这个项目工作。**

然而，在这个列表中，没有一家大公司，或者至少没有一家是前 1000 名网站列表中的公司。老实说，目前支持者名单上主要是个人，少数是小公司，他们每月支付几美元。

如果有人说他们不知道 core-js 需要资金...... 拜托，我经常看到 [这样的表情包](https://www.reddit.com/r/ProgrammerHumor/comments/fbfb2o/thank_you_for_using_corejs/)：

<p align="center"><img alt="sanders" width="400" src="https://user-images.githubusercontent.com/2213682/218325687-08d58543-4b88-4a39-a0de-420bd325450f.png" /></p>

> 译者注：此图来自 reddit 网站的 r/programmerHumor 版块，用来讽刺作者在 core-js 安装后请求捐款。

---

一年前，Tidelift 不再给我寄钱了。他们说，由于政治局势，他们使用的 Hyperwallet 不再供俄罗斯人使用（但上个月我试图更新一些个人数据时，它又可以使用了），为了安全起见，他们会把我的钱存放在他们那边。在过去的几个月里，我试图把这笔钱存入银行或 Hyperwallet 账户，但收到回复说，他们会尝试做些事情（听起来很棒，不是吗？）。去年年底以来，他们干脆停止回复电子邮件。现在，我只有这个：

![tidelift](https://user-images.githubusercontent.com/2213682/217650273-548d123d-4ee4-4beb-ad5b-631c55e612a6.png)

> 信件主要内容翻译：Denis 你好，对于延误回复深表歉意。不幸的是，如果您在 Hyperwallet 中的账户被冻结，我们将无法向您付款，因此我们将终止您和我们之间的协议并立即生效。如果您能够解冻您的 Hyperwallet 帐户，请告诉我们，我们可以重新建立关系。（这是 Tidelift 给 core-js 作者 Denis 的邮件）

**Tidelift 以如此有趣的方式，让我知道我的收入减少了，今年我的工作收入不是每月 1800 美元，而是每月 800 美元。** 当然，没有对后续电子邮件的回复。然而，他们的网站显示，我仍然在收到钱。

<p align="center"><img alt="tidelift" width="500" src="https://user-images.githubusercontent.com/2213682/218159794-1ea53543-a8ff-463a-ad36-dc900a34b7c8.png" /></p>

> 译者注：从截图中可以看出，同样地，Tidelift 网站也使用了 core-js

我想知道，通过这个网站支持其供应链的公司，对这种骗局将如何反应。

---

同一天，在 OpenCollective 上，我看到每月订阅的捐赠从大约 600 美元减少到大约 300 美元。显然，Bower 的财务储备已经耗尽了。**`这意味着这个月我总共会得到大约400美元。`**

在之前的几个月里，我测量了在 core-js 上工作需要多少时间。结果大约是...... **每月 250 小时** —— 远远超过连休息日都没有的全职工作的时长，这使得我不可能有“真正的”全职工作或者为任何合同工作。250 小时 400 美元...... **每小时工作的报酬不到 2 美元，前一年多一点：每小时 4 美元。** 是的，几个月来，我确实花了更少的时间在这个项目上，但没有太大变化。

这就是确保整个 Web 兼容性的当前价格。加上没有保险或社会保障。

**收入增长和职业发展都很棒，对吧？**

> 译者注：注意在本文中，denis 经常使用反讽手法。

我想你很了解主要 IT 公司的高级软件工程师的报酬是多少。我收到了许多类似的报价，然而，它们与 core-js 的正确工作不兼容。

在经常受到的威胁、指责、命令和侮辱中，我经常会得到类似“停止乞讨，去工作，你这个懒惰的人。立即删除你的乞讨信息 —— 我不想看到它们。”有趣的是，至少其中一些人每年获得超过 30 万美元（我很确信这点，因为我与他们的同事交谈过），而（由于他们的工作性质）core-js 每月为他们节省了许多小时的工作。

### 一切都改变了

当我开始研究 core-js 时，我独自一人。现在我有一个家庭了。一年多前，我成了我儿子的父亲。现在我必须为他提供体面的生活水平。

![son](https://user-images.githubusercontent.com/2213682/208297825-7f98a8e2-088e-47d3-95a6-a853077296b3.png)

我有一个妻子，有时她想要一双新鞋，或一个包，或一个新的 iPhone，或一个 Apple Watch。我的父母已经到了需要我有力支持他们的年龄。

很明显，我不可能用我从 core-js 维护中获得的钱来正常地支持一个家庭，我的财政状况走到头了。

我越来越经常听到这样的责备：“放弃你的开源，你这是纵容自己，请回到正常的工作。谁谁谁只做了一年程序员，他对开源几乎一无所知，他每天只工作几个小时，已经赚的是你的好几倍。”

## 没有了

我他妈的累了（I'm damn tired. ）。我喜欢开源和 core-js。但我这样做是为了谁，为了什么？让我们总结一下上述内容。

- 自 2014 年以来，我一直在确保零兼容性问题，我为 Web 世界提供 web 平台的前沿功能；我大部分时间都在为此而工作，而我所赚的钱甚至不足以购买食物。
- 我看不到任何感激之情，而是来自开发人员的巨大仇恨，我可简化了他们的生活啊。
- 通过使用 core-js 而节省并赚取数百万美元的公司，所做的只是忽略 core-js 的资金请求。
- 即便在我危急的情况下，在面对我的请求时，他们中的大多数，不是帮助，而是忽视或憎恨。
- 那些标准开发人员和浏览器开发人员，不是和我合作以共同致力于 JavaScript 的美好未来，而是给我设置障碍，逼得我和他们斗争。

---

恨我的人，我并不在乎。如果我在乎，我早就离开开源了。

我可以容忍与标准开发人员缺乏正常的互动。这意味着用户将来会遇到问题，而且，当 Web 崩溃时，标准开发人员自己也会遇到问题。

**不管怎样，钱很重要。** 我已经受够了以牺牲我和家人的福祉为代价而资助公司。我应该有能力确保我的家人、我的儿子有一个光明的未来。

core-js 的工作几乎占据了我所有的时间，超过了全职工作日的时间。这项工作确保了大多数热门网站的正常运行，这项工作应该得到适当的报酬。我不会继续免费工作，也不会以每小时 2 美元的价格工作。我愿意继续以每小时至少 80 美元的价格为项目工作。[这正是 eslint 团队成员的收费标准](https://eslint.org/blog/2022/02/paying-contributors-sponsoring-projects/#paying-team-members-per-hour)。如果开源工作需要，我准备还清我的诉讼并离开俄罗斯 —— 虽然，这并不便宜。

---

我经常看到这样的评论：

<p align="center"><img alt="core-js approach" width="600" src="https://user-images.githubusercontent.com/2213682/136879465-88b3d349-6a1a-442e-bb78-fb20916a4679.png" /></p>

> 图片内容翻译：Zach Leatherman 说：“认真想想这个：如果有人试图勒索开源怎么办：‘这个项目需要每月____美元的捐款，否则将停止维护，没有更新，没有 bug 修复或安全补丁。这是个很好的项目 —— 如果它发生了什么事，那真是太遗憾了。’”Matt Mink 说：“听起来 core-js 就是这么干的。”

好的，伙计们，如果你们想要这个 —— 我就给你这个。

---

### 根据你们的反馈，core-js 将很快实施以下方式之一

- **给我适当的资金支持**

  我希望，至少在阅读了这篇文章后，大企业、小公司和开发人员会考虑其开发栈的可持续性，并适当地支持 core-js 开发。在这种情况下，core-js 将得到适当的维护，我将能够专注于添加新的功能。

  我现在的工作规模已经达到了顶峰，我一个人已经不能支撑了 —— 我在体力上已经不能继续。一些工作，比如改善测试覆盖范围或文档，这不难，但需要很多时间，这不是志愿者想做的那种工作 —— 我不记得有任何 PR 是关于改进现有功能的测试覆盖范围的。因此，在付费的基础上吸引至少一两个开发人员（至少是学生，当然最好有更高水平）是有意义的。

  考虑到其他维护人员的参与和其他费用，我认为目前每月大约 3 万美元就足够了。更多的钱，就会有更好的产品、更快的开发、更少的时间。我一个全职工作在 core-js 上当然可以，但不像团队那样有成效。

- **我被一家公司雇用，在那里我将能够从事开源和 Web 标准的工作**

  这将给我继续工作所需的资源。

- **core-js 将会成为一个商业项目，如果得不到适当的用户支持**

  以当前的 core-js 包创建商业模式是有问题的，因此新的 core-js 版本很可能会改变许可证。免费版本的功能将受到限制，所有额外的功能都将付费。core-js 将继续发展，在该项目范围内，将创建许多新工具以确保 Web 兼容性。当然，这将大大减少 core-js 的传播，并将给许多开发人员带来问题，然而，即使是一些付费客户也足够了，我的家人将有钱支付账单。

- **core-js 缓慢的死亡，如果你们并不需要它**

  我对商业项目有很多想法，我有很多好的工作机会 —— 所有这些都需要时间，而我把时间都给了 core-js 维护。这并不意味着我会立即完全停止维护 core-js，我只会按捐款金额的多少，来决定我干多少。如果它们处于当前水平，那我每月只会干几个小时，而不是像现在这样数投入百个小时。该项目将停止增长 —— 也许小错误将被修复，兼容性数据将被更新 —— 但不会更多了。一段时间后，core-js 将变得毫无用处，并会死亡。

**我仍然希望是第一种结果，因为 core-js 是现代数字基础设施的关键组成部分之一，但看看现在和过去，我正在为其他选择做准备。**

### 我提前回答一些我经常看到的愤怒的评论，这些评论肯定会在这篇文章之后出现

- **没问题，我们会固定依赖 core-js 的某个版本（pin the core-js dependency）。**

  与大多数项目不同，core-js 应该保持跟上最新前沿（bleeding edge），最新的 core-js 能让你使用最新的 JavaScript 技术，而不用考虑引擎的兼容性和错误。你可以固定在某个 core-js 版本，也许头一年或两年，你不会遇到严重的问题。之后，问题就出现了 —— 你用的 polyfill 会变得过时，但仍然存在于你的捆绑包中，变成一个无用的压舱石。你将无法使用 JS 语言的新功能，并将在 JS 引擎中面对新错误。

- **这是开源的，我们将分叉（fork）它，滚开。**

  我经常看到这样的评论，有人甚至试图用分叉吓唬我。我已经说过太多次了，**如果有人能分叉并正确维护 core-js，我会很高兴** —— 在没有人维护的情况下，分叉有什么意义呢。现在我根本没有看到任何人试图为 core-js 添加一些重要的东西，或者至少定期做出贡献。项目应该跟进每个新的 JavaScript 引擎版本，更新兼容性数据，修复或至少考虑每个引擎的每个新错误（无论多大的错误），查看并实现每个可能的新的 JavaScript 功能，最大限度地正确执行，测试并考虑每个现代引擎或老引擎的每个版本的具体细节。这是一项艰苦的工作，你准备好了吗，并且有所需的知识和时间吗？举个例子，当我在监狱里时，Babel 说他们搞不定：

  <p align="center"><img alt="babel" width="800" src="https://user-images.githubusercontent.com/2213682/154870832-36318fdd-c5a0-45ce-aaed-2d50371a2976.png" /></p>

> 图片文字翻译：nicolo-ribaudo 在 2020 年 3 月 15 日说：“我是 Babel 的维护者，我们大概率不会 fork core-js，因为我们没有足够的资源维护它。”

- **我们不需要 core-js，有许多替代项目可用。**

  我没有抱着你不放。你说的替代品在哪里？当然，core-js 不是 JavaScript 标准库的唯一 polyfill，但所有其他项目的使用率都比 core-js 少[几十](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=es6-shim&from=2014-11-18)[倍](https://user-images.githubusercontent.com/2213682/205467964-2dfcce78-5cdf-4f4f-b0d6-e37c02e1bf01.png)，这并不奇怪 —— 所有这些项目都只提供了 core-js 功能的一小部分，它们不够合适和复杂，它们可使用的场景非常有限，它们不能以如此简单的方式正确集成到你的项目中，并且还存在很多严重问题。如果真的有合适的替代品，我早就停止在 core-js 上工作了。

- **我们可以放弃 IE 支持，所以我们不再需要 polyfill。**

  正如我在上面写的那样，我没有抱着你。在某些情况下，真的不需要 polyfill，你可以不用它们，但 IE 只是一小部分问题 —— 即便在 IE 时代也是这样。当然，你不用 IE 的话，polyfill 不会给你带来在 IE8 中支持 ES6 这样的功能。但即使是最现代的引擎，也没有实现最现代的 JavaScript 功能。即使是最现代的引擎，也有错误。你确定你和你的团队完全了解你们应用所支持的所有引擎的所有限制，并且可以绕过它们吗？我有时都会忘记一些很怪的地方和缺失的特性。

- **你是个混蛋，我们会把你从 FOSS 社区中开除。**

  是的，你是对的。我真是个混蛋，让你有机会在现实生活中使用现代 JavaScript 功能，我这个混蛋多年来一直在解决你的跨引擎兼容性问题，并且比任何人都为此做出了更多的牺牲。我真是个混蛋，只想让他的儿子吃饱，只希望他的家人有足够的钱来支付账单，我这个混蛋的家人不应该需要任何东西。上面我说的，可能真的会让我离开 FOSS 而拥抱商业，让我们拭目以待吧。

---

现在，让我们从负面因素转到这篇文章的后半部分，我们将讨论如何让 core-js 做的更好以及 polyfill 的一般性问题。

## 路线图

JavaScript、浏览器和 Web 开发正在以惊人的速度发展。所有浏览器需要所有 core-js 模块的时代已经一去不复返了。最新的浏览器具有良好的标准支持，在常见的用例中，它们只需要一定比例的 core-js 模块来提供最新的语言功能和错误修复。一些公司已经放弃了对最近再次“埋葬”的 IE11 的支持。然而，即使没有 IE，旧浏览器也会一直存在，现代浏览器中也会发生错误，新的语言功能将定期出现，无论如何，它们都会延迟出现在浏览器中；因此，如果我们想在开发中使用现代 JS 并尽量减少可能的问题，polyfill 会长期留在我们身边，它们应该继续发展。

在这里，我将（几乎）不写任何关于添加新的或改进现有特定 polyfill 的内容（当然，这是 core-js 开发的主要部分之一），让我们谈谈其他一些关键事情，而不关注小事。如果决定将 core-js 做成商业项目，路线图是应该讨论的。

我正试图保持 core-js 尽可能紧凑，它应该遵循的主要原则是在现代 Web 中发挥最大作用 —— 客户端不应加载任何不必要的 polyfill，polyfill 应该最大限度地紧凑和优化。当前，最大的 core-js（针对早期提案）捆绑大小[约为 220 KB 缩小，压缩后 70 KB](https://bundlephobia.com/package/core-js)  —— 它不是一个小包，它挺大 —— 它就像 jQuery、LoDash、Axios 加起来一样大 —— 原因是该包几乎涵盖了该语言的整个标准库。core-js 每个组件的大小比同类可用替代品的大小少若干倍。你可以只加载所使用的 core-js 功能，在最小情况下，捆绑大小可以减少到几 K；正确使用时，通常是几十 K —— 然而，还有一些东西需要考虑，[大多数页面包含比整个 core-js 捆绑包更大的图片](https://almanac.httparchive.org/en/2022/media#bytesizes)，大多数用户的互联网速度为几十 Mbps，那么为什么还要这么关注 core-js 的大小？

我不想详细重复关于 [“JavaScript 的成本”](https://medium.com/dev-channel/the-cost-of-javascript-84009f51e99e) 这种旧帖子，在那里你可以阅读为什么添加 JS 会增加用户开始与页面交互的时间，而不是添加类似大小的图片 —— 它不仅是下载，它还解析、编译、评估脚本，它阻止了页面渲染。

在太多地方，移动互联网并不完美，它们还停留 3G 甚至 2G。在 3G 的情况下，下载一个完整的 core-js 可能需要几秒钟。然而，页面经常包含多个 core-js 和许多其他重复的 polyfill。一些（主要是移动互联网）互联网提供商的“无限”数据套餐非常有限，用户用了几 G 字节之后，网速就会降到几 Kbps。连接速度还受很多其他因素受限。

页面加载速度就等于收入。

<p align="center"><img alt="conversion" width="600" src="https://user-images.githubusercontent.com/2213682/217910389-7320a726-890d-4f34-a941-f51a069f01a1.png" /></p>

> 插图来自谷歌[随机搜索的一个帖子](https://medium.com/@vikigreen/impact-of-slow-page-load-time-on-website-performance-40d5c9ce568a)

由于 polyfill 的新增或改进，core-js 的大小不断增长。这也是一些大型 polyfill 所遇到的问题，在 core-js 中添加 Intl、Temporal 和其他一些功能，捆绑的大小将增加十几倍，达到几兆字节。

core-js 的杀手级功能之一是，它可以通过使用 Babel、SWC 或手动方式进行优化，虽然，现在的方法只能解决部分问题。为了正确解决这些问题，现代 Web 需要新一代的工具包，该工具包可以简单地集成到当前的开发堆栈中。在某些情况下，正如你将在下面看到的，这个工具包可以帮助使你的网页变得甚至比没有 core-js 更小。

我已经在[“**关于 core-js@3、Babel 和对未来的展望**”](https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md#look-into-the-future)中写了其中一些内容，但这些只是原始的想法。现在他们正处于实验甚至实施阶段。
由于该项目的未来不确定，在这里写下任何具体日期是没有意义的，我不保证所有这些都会很快完成，但这值得我们努力去做。

---

### 新的主版本（major version）

core-js@3 大约 4 年前发布 —— 已经很久了。对我来说，添加一些突破性更改并将新版本标记为 major 版本并不是一个大问题（相比之下，确保向后兼容则是一个挑战）—— 但这对用户来说是个大问题。

目前，大约 25% 的 core-js 下载是严重过时的 core-js@2。许多用户想将其更新到 core-js@3，但由于他们的依赖项使用 core-js@2，他们仍然使用过时的版本来避免多个副本（我在 GitHub 上看到了太多项目有此类问题）。太频繁的重大更新将使此类情况更加恶化。

然而，最好不要痴迷于与旧版本的兼容性。core-js 包含太多没有删掉的东西，仅仅是出于保持兼容性。**而缺乏一些长期需要的突破性变化将对未来产生负面影响。** 从标准、生态系统和 Web 的变化以及遗留物（legacy）的积累情况来看，最好每 2-3 年发布一个新的 major 版本。

如果需要好几年的开发，才能出来一个新版本让大家看到他们想要的一切，这对用户是不可接受的。core-js 遵循 [SemVer](https://semver.org/)，首先发布一个新的 major 版本，内含一些突破性变化（部分叙述如下），大多数新功能在 minor 版本中添加。在这种情况下，新版本可能需要大约 2-3 个月的全职工作，它会比上一个版本小，这将是 core-js 第一次变小 :-)

### 关于 core-js 包

### 放弃严重过时的引擎支持

IE 死了。然而，还有人用 —— 出于许多不同的原因，有人仍然被迫制作或维护在 IE 中工作的网站，core.js 是让他们生活更轻松的主要工具之一。

现在，core-js 试图支持所有可能的引擎和平台，甚至 ES3 和 IE8-（译者注：IE8- 代表 IE8 及更早的版本）。但只有一小部分使用 core-js 的开发人员需要这个，IE8- 浏览器的占有率约为 0.1%。对于更多其他用户来说，继续支持 IE8- 就意味着 —— 更大的捆绑和更慢的执行。

主要问题来自对 ES3 引擎的支持：大多数现代 ES 功能都基于 ES5，而 ES5 在旧引擎中不可用。一些功能（如 getter/setter）不能被 polyfill，因此一些 polyfill（如类型数组）根本无法在 IE8- 中工作。另一些功能需要很复杂的变通办法。真正可以 polyfill 的只是一些简单的功能，捆绑包中 core-js 大小的主要部分是 ES5 方法的实现（在 polyfill 的大量功能中，它只占百分之几，所以这个问题与精简捆绑包有关）。

即便简单地将 ES5 功能的 fallback 替换为直接使用原生功能，也会将 core-js 捆绑的大小减少 2 倍以上。重新设计架构后，它将进一步减少。

IE9-10 浏览器的占比也很小了 —— 目前，同样的 0.1%。但是，如果 core-js 还在支持其他一些过时的浏览器，考虑放弃对 IE9-10 的支持是没有意义的，他们的问题和限制是类似的，甚至前者还更多。例如 Android 4.4.4  —— 总共占比约为 1%。将标准提高到 ES5 之上是一个困难的决定，因为还要对一些非浏览器引擎提供支持。然而，即使将来放弃对 IE11 支持，也不会像现在放弃 IE8- 带来那么多好处。

### ECMAScript 模块和现代语法

目前，core-js 使用 CommonJS 模块。长期以来，这是最受欢迎的 JavaScript 模块格式，但现在 ECMAScript 提供了自己的模块格式，它已经非常受欢迎，几乎在任何地方都支持。例如，Deno，像浏览器一样，它不支持 CommonJS，但支持 ES。core-js 应该在不久的将来有一个 ECMAScript 模块版本。但是，ECMAScript 模块仅在 NodeJS 的现代版本中受支持，core-js 应该可以在较老的 NodeJS 版本中工作，而无需转译或打包。[Electron 仍然不支持它](https://github.com/electron/electron/issues/21457)，因此现在立刻干掉 core-js 的 CommonJS 版本是有问题的。

现代语法的其他方面并不那么明显。目前，core-js 使用 ES3 语法。最初，这是为了最大程度优化，因为它无论如何都应该预先转译为旧语法。但这只是最初的情况，现在，core-js 库无法在用户环境中正确转译，并且在转译器配置中应该被忽略。为什么？让我们以 Babel 转换为例看看：

- 转换的很大一部分依赖于现代的内置，例如，使用 @@iterator 协议的转换 —— 但 Symbol.iterator、迭代器和所有其他相关内置都是在 core-js 中实现的，在 core-js 加载之前不存在。

- 另一个问题是使用注入 core-js polyfill 的方式转译 core-js。显然，我们无法将 polyfill 注入到它们实现的地方，因为这会导致循环依赖。

- 对 core-js 的一些其他转换会破坏其内部结构 - 例如，[typeof 的转换](https://babeljs.io/docs/en/babel-plugin-transform-typeof-symbol)（将有助于支持 polyfill 后的 symbol）会破坏 Symbol 的 polyfill。

然而，在 polyfill 代码中使用现代语法可以显著提高源代码的可读性，并且有助于减少大小，在某些情况下还可以提高性能（如果在现代引擎中捆绑 polyfill）。所以，现在是时候考虑将 core-js 重写为现代语法了，为了让它能够正常转译，需要使用变通手法，并为不同用例发布不同语法的版本，以解决上述问题。

### Web 标准的 polyfill

我已经考虑很长时间了，想为 core-js 添加尽可能多的 Web 标准支持 (不仅仅是 ECMAScript 以及与其密切相关的特性)。首先，是关于[最小通用 Web 平台 API](https://common-min-api.proposal.wintercg.org/#index) （[它是什么？](https://blog.cloudflare.com/introducing-the-wintercg/)）的尚未实现功能，但不仅限于此。最好是有一个牢靠的 polyfill 项目，可以用于尽可能多的开发案例，而不仅仅是 ECMAScript。目前，浏览器中支持 Web 标准的情况比支持现代 ECMAScript 特性的情况要糟糕得多。

将 Web 标准 polyfill 添加到 core-js 的主要障碍之一，是捆绑包的大小显著增加，但我认为，使用目前仅加载所需 polyfill 的技术，以及下面我将描述的技术，我们可以将 Web 标准的 polyfill 添加到 core-js 中。

但主要问题是它不应该是一个幼稚的 polyfill，如我之前所述，现在，在绝大多数情况下，ECMAScript 功能的正确性并不算太差，但对于 Web 平台的功能就没有这么好了。例如，最近添加的 [structuredClone polyfill](https://github.com/zloirock/core-js#structuredclone)。在实现它时，考虑到依赖关系，我遇到了数百种不同的 JavaScript 引擎错误，但我不记得在添加新的 ECMAScript 功能时看到过这种情况。因为这个原因，为了一个简单的方法，本应该可以在几个小时内完成的工作（包括解决所有 issue 和添加所需功能），却持续了几个月。对于 polyfill，如果做得不好，还不如不做。适当的测试、polyfill 填充和确保跨平台兼容性的 Web 平台功能，比我在 ECMAScript polyfill 上花费的资源更多。因此，仅在我有这样的资源时，才会开始向 core-js 添加尽可能多的 Web 标准支持。

---

### 更有趣的新方法

有人会问它为什么处于这个位置。像转译器这样的工具与 core-js 项目有什么关系？core-js 只是一个 polyfill，转译器那些工具由其他人编写和维护的。有一次我也认为，用一个好的 API 编写一个伟大的项目，解释它的可能性就足够了，当它流行起来时，它将获得一个生态，并有着适当的第三方工具。然而，多年来，我意识到，如果你不这样做，或者不控制你自己，这种情况就不会发生。

例如，多年来，实例方法无法通过 Babel runtime 进行 polyfill，我解释了太多次如何操作。在实际的项目中，通过 preset-env 来 polyfill 是不可行的，因为所需的 polyfill 的检测不完整，以及兼容性数据来源不够好，我从一开始就解释了这一点。由于这些问题，我被迫 [在 2018-2019 年几乎完全重写这些工具，并发布在 core-js@3 版本中](https://github.com/babel/babel/pull/7646)，之后我们获得了现在这种基于静态分析的 polyfill 注入工具。

我相信，如果没有在 core-js 范围内使用如下的方法，它根本无法正常工作。

---

为了避免与以下文本相关的一些问题：core-js 的工具将挪动（move）到作用域包 —— 像 core-js-builder 和 core-js-compat 等工具将分别成为@core-js/builder 和@core-js/compat。

### 不仅仅是 Babel：转译器和模块捆绑器的插件

目前，一些用户被迫使用 Babel，只是因为需要自动注入及优化所需的 polyfill。Babel 的 [preset-env](https://babeljs.io/docs/en/babel-preset-env#usebuiltins) 和 [runtime](https://babeljs.io/docs/en/babel-plugin-transform-runtime#core-js-aliasing) 通过静态分析优化 core-js 的使用，这是唯一足够好且众所周知的方法。从历史上看，它之所以能这样，是因为我帮助 Babel 进行 polyfill。但这并不意味着 Babel 是唯一或最好的干这事的地方。

Babel 只是众多转译器之一。TypeScript 是另一个流行的选项。其他转译器现在越来越受欢迎，例如 [SWC](https://swc.rs/)（它已经包含[一个自动 polyfill/core-js 优化的工具](https://swc.rs/docs/configuration/supported-browsers)，但仍然不够完美）。然而，我们为什么要谈论转译器？捆绑器和 webpack 或 [esbuild](https://esbuild.github.io/)（也包含集成的转译器）等工具对 polyfill 的优化更有兴趣。[rome](https://rome.tools/) 已经发展了几年，还没有准备好，但它的概念看起来很有希望。

位于转译层的基于静态分析的自动 polyfill 有这么一个主要问题：不是捆绑包中的所有文件都会被转译 —— 例如，依赖项。如果你的一些依赖项需要现代内置功能的 polyfill，但你没有在用户空间代码中使用此内置功能，则 polyfill 不会被添加到捆绑包中。不必要的 polyfill 导入也不会从你的依赖项中删除（见下文）。将自动 polyfill 从转译层移动到捆绑器层，可以解决这个问题。

当然，与 Babel 相比，编写或使用此类插件在很多地方是比较困难的。例如，[如果没有一些额外的工具，你无法在 TypeScript 中使用插件进行自定义转换](https://github.com/microsoft/TypeScript/issues/14419)。然而，有意愿的地方就有办法 (where there's a will there's a way)。

core-js 的自动 polyfill/优化 不应该仅在 Babel 中可用。虽然 core-js 项目也不可能为所有转译器和捆绑器编写和维护插件，但可以做这些事情：

- 改进 core-js（@core-js/compat）提供的数据以及用于第三方项目集成的工具，它们应该是全面的。例如，“内置定义”仍然在 Babel 一侧，导致它们在其他项目中的重用存在问题。

- 由于一些工具已经提供了 core-js 集成，因此帮助他们也是有意义的，而不仅仅是 Babel。

- 为 core-js 项目范围内的一些重要工具编写和维护插件是有意义的。哪个？我们拭目以待。

### polyfill 收集器

上面解释了文件层上基于静态分析的自动 polyfill（usage polyfilling mode of Babel preset-env）的问题，但这不是唯一的问题。让我们谈谈其他的。

你的依赖项可能有自己的 core-js 依赖，它们可能与你在项目根部使用的 core-js 版本不兼容，直接将 core-js 导入到你的依赖项可能会导致损坏。

项目通常包含多个入口点、多个捆绑包，在某些情况下，将所有 core-js 模块移动到一个块（chunk）可能会有问题，并可能导致每个捆绑包中 core-js 重复。

我已经在前面发布了[core-js 使用统计数据](https://gist.github.com/zloirock/7331cec2a1ba74feae09e64584ec5d0e)。在许多情况下，你可以看到 core-js 的重复 —— 而且它只在应用程序的第一个加载页面上。有时它甚至像我们在彭博网站上看到的那样：

<p align="center"><img alt="bloomberg" width="720" src="https://user-images.githubusercontent.com/2213682/218467140-c475482c-24b0-4420-b510-32f6e2a15743.png" /></p>

[前段时间，这个数字甚至更高](https://user-images.githubusercontent.com/2213682/115339234-87e1f700-a1ce-11eb-853c-8b93b7fc5657.png)。当然，通常的网站不会拥有这么多不同版本的 core-js，但有多个 core-js 确实很常见，大约一半的用了 core-js 的网站都这样。为了防止这种情况，**需要一个新的解决方案，在一个地方从项目的所有入口点、捆绑包和依赖项收集所有的 polyfill。**

让我们称这个工具为 @core-js/collector。这个工具应该接收一个入口点或入口点列表，并使用 preset-env 中所使用的静态分析技术，但是，该工具不应该转换代码或注入任何内容，而是检查完整的依赖树，并返回所需的 core-js 模块的完整列表。作为一项需求，它应该可以很简单地集成到当前开发栈中。一种可能的方式是在插件中创建一个新的 polyfill 模式，称为“collected” - 它将允许在一个地方加载应用程序的所有收集的 polyfill，并删除不必要的 polyfill（见下文）。

### 删除不必要的第三方 polyfill

作为一个例子，一个很典型的情况是：在一个网站上看到多个具有相同功能的 Promise polyfill 副本，例如你只加载了一个来自 core-js 的 Promise polyfill，但是一些依赖项会自己加载 Promise polyfill，例如来自另一个 core-js 副本，或是来自 es6-promise、promise-polyfill、es6-promise-polyfill、native-promise-only 等等。然而，对于这些 ES6 Promise，core-js 已经完全实现了，而且大多数浏览器都不需要对 Promise 进行 polyfill。由于这种重复，使得捆绑包中所有 polyfill 的大小会膨胀到几兆字节。

> 译者注：Promise 是一种用于处理异步操作的对象，它可以让异步的代码变得更加易于阅读和维护。

这可能不是一个很好的例证，其他例子可能会更好，但既然上面我们开始谈论彭博网站，让我们再看看这个网站。我们无法访问源代码，但是我们有像 [bundlescanner.com](https://bundlescanner.com/website/bloomberg.com/europe/all) 这样很棒的工具（我希望彭博团队能尽快修复它，那时数据就不会是这样了）。

<p align="center"><img alt="bundlescanner" width="720" src="https://user-images.githubusercontent.com/2213682/181242201-ec16dd17-f4dd-4706-abf5-36e764c72e22.png" /></p>

从实践上讲，这种分析不是一件简单的工作，该工具只能检测到大约一半的库代码。然而，除了 450K 字节的 core-js 外，我们还看到数百 K 字节的其他 polyfill —— 许多 es6-promise、promise-polyfill、whatwg-fetch 的副本（由于前面所述的原因，core-js 仍然没有 polyfill 它）、string.prototype.codepointat、object-assign（这是 ponyfill，下一节会讲到它们）、array-find-index 等。

但是有多少 polyfill 没有检测到？这个网站加载的所有 polyfill 的大小是多少？看起来有几兆字节。然而，即使是非常旧的浏览器，最多一百 K 字节就足够了...... 这种情况并不特别 —— 这太常见了。

由于许多 polyfill 仅包含 core-js 功能的子集，在 @core-js/compat 的范围内，我们能通过收集数据，判断一个第三方 polyfill 模块是否必要，如果此功能包含在 core-js 中，转译器（transpiler）或捆绑器（bundler）插件将删除此模块的导入或将其替换为适当 core-js 模块的导入。

同样的方法可以应用于摆脱对旧 core-js 版本的依赖。

### 纯版本 polyfill/ponyfill 的全球化

另一个更常见的问题是来自全局（global）和纯（pure）core-js 版本的 polyfill 的重复。纯 core-js / babel-runtime 旨在用于库的代码中，因此如果你使用全局版本的 core-js 而且你的依赖项也加载了一些不带全局命名空间污染的 core-js 副本，那么这是一种正常情况。它们使用不同的内部结构，但它们之间共享类似的代码是有问题的。

我正考虑在转译器或捆绑器插件中解决这个问题，与前一个类似（但当然，更复杂一点）—— 我们可以将纯版本的导入替换为全局版本导入，并删除目标引擎中不必要的 polyfill。

这也可以应用于那些第三方 ponyfills 或过时库，他们所实现的功能在 JS 标准库中已经可用了。例如，has 包的使用可以替换为 Object.hasOwn，left-pad 替换为 String.prototype.padStart，somelodash 方法替换为相关的现代内置 JS 方法等。

### 服务

在 IE11、iOS Safari 14.8 以及最新的 Firefox 中加载相同的 polyfill 是错误的 —— 在现代浏览器中加载了太多的死代码。一个流行的模式是使用 2 个捆绑包：为“现代”浏览器加载支持本地模块的 `<script type="module">` ，而对于不支持本地模块的过时浏览器，则加载 `<script nomodule>`（实践中有些困难）。例如，Lighthouse 可以检测到一些不需要的 polyfill 案例，[让我们检查一下长期受苦的彭博网站](https://googlechrome.github.io/lighthouse/viewer/?psiurl=https://www.bloomberg.com/europe&strategy=mobile&category=performance)：

<p align="center"><img alt="lighthouse" width="720" src="https://user-images.githubusercontent.com/2213682/148652288-bd6e452a-f6ba-417d-8972-9d98d2f715a4.png" /></p>

Lighthouse 检测出所有资源仅约 200 KB，0.56 秒。但该网站包含大约几兆字节的 polyfill。[Lighthouse 只检测出不到一半的应检测内容](https://github.com/GoogleChrome/lighthouse/issues/13440)，但即把它能检测的都检测出来，它也只是所有加载的 polyfill 的一小部分。其余的在哪里？现代浏览器真的需要它们吗？问题是，本地模块支持的下限太低 —— 在这种情况下，“现代”浏览器仍将需要旧版 IE 所需的大多数 polyfill，以提供稳定的 JS 功能。因此，部分 polyfill 显示在“未使用 JavaScript”部分中，需要 6.41 s，另外的部分根本没有显示......

从我开始写 core-js 的一开始，我就一直在考虑创建一个 Web 服务，为浏览器提供所需的 polyfill 服务。

未提供此类服务是 core-js 落后于另一个项目的唯一方面。英国《金融时报》的 [polyfill-service](https://polyfill.io/) 就基于这一概念，这是一个很牛的服务。这个项目的主要问题是，服务很牛，但是用了糟糕的 polyfill。这个项目只是 polyfill 了 core-js 提供的 ECMAScript 功能的一小部分，大多数 polyfill 是第三方的，他们并不是为一起工作而设计的，太多 polyfill 没有正确遵循规范，或者太粗糙，或者使用起来很危险（例如，[WeakMap 看样子是在一步步实现规范](https://github.com/Financial-Times/polyfill-library/blob/554248173eae7554ef0a7776549d2901f02a7d51/polyfill/WeakMap/polyfill.js)，但缺乏一些特别手段，使其导致内存泄漏和线性访问时间，这就不太好了，还有更多其他问题 —— 它不是在 IE11 这类引擎中修补、修复和重用本地实现，而是不接受可迭代参数，[这使得 WeakMap 将会被完全替换](https://github.com/Financial-Times/polyfill-library/blob/554248173eae7554ef0a7776549d2901f02a7d51/polyfill/WeakMap/detect.js)）。一些优秀的开发人员时不时尝试修复这个问题，但是 polyfill 本身拥有的时间实在是太少了，因此它还远远达不到可被推荐的地步。

以适当的形式创建这样的服务需要制作和维护许多新组件。我独自一人从事 core-js 开发，项目没有得到任何公司的必要支持，开发纯粹是建立在热情之上，我需要资金来养活自己和家人，所以我没有时间和其他资源去开发它。然而，在其他任务范围内，我已经制作了一些必需的组件，与一些用户的讨论让我相信，创建一个最大限度简化的服务，然后在你自己的服务器上运行它就足够了。

我们已经拥有了最好的 polyfill 集、适当的兼容性数据以及可以为目标浏览器创建捆绑包的构建器。前面提到的 @core-js/collector 可以用来做优化 —— 仅获取所需的模块子集、转译器/捆绑器的插件 —— 删除不必要的 polyfill。仅仅是缺少一个用于用户代理规范化的工具和一个将这些组件绑定在一起的服务，让我们称它为@core-js/service。

#### 在一个完美的世界里，它应该是什么样子？

- 捆绑你的项目。捆绑器端的插件会从你的依赖项中删除所有 polyfill 导入（包括第三方的，没有全局污染的）。你的捆绑包将不包含任何 polyfill。
- 运行 @core-js/service。当你运行它时，@core-js/collector 会检查你的所有前端代码库、所有入口点，包括依赖项，并收集所有必需的 polyfill 的列表。
- 用户加载一个页面，并向服务请求 polyfill 捆绑包。服务为客户端提供了一个为目标浏览器编译的捆绑包，其中包含所需的 polyfill 子集并使用所允许的语法。

这样，使用这种工具，现代浏览器如果自身够用，将根本不加载 polyfill，旧浏览器将只加载所需的优化后的 polyfill。

---

以上大部分内容都是关于如何将发送给客户端的 polyfill 最小化 —— 这些只是 core-js 范围内想要实现东西的一小部分，如果你明白做到这一点需要大量的工作，而且它可以显著改善 Web 开发，那就足够了。它是否会真的被做出来，以及它是 FOSS 的还是商业的，取决于你。

## 结论

这是我最后一次尝试将 core-js 保留为具有适当质量和功能水平的免费开源项目。这是最后一次传递信息：在开源的另一边有真实的人，他有家庭需要养活，有问题需要解决。

如果你或你的公司以这样或那样的方式使用 core-js，并且对你的供应链质量感兴趣，请支持本项目：

- [**Open Collective**](https://opencollective.com/core-js)
- [**Patreon**](https://patreon.com/zloirock)
- [**Boosty**](https://boosty.to/zloirock)
- **Bitcoin ( bc1qlea7544qtsmj2rayg0lthvza9fau63ux0fstcz )**
- [**支付宝**](https://user-images.githubusercontent.com/2213682/219464783-c17ad329-17ce-4795-82a7-f609493345ed.png)

**如果你能在 Web 标准和开源方面提供一份好工作，请联系我。**

---

**欢迎在 [这个 issue](https://github.com/zloirock/core-js/issues/1179) 中添加评论。**

**[Denis Pushkarev](https://github.com/zloirock)，2023 年 2 月 14 日**

**翻译｜卫剑钒 (微信公众号：man-mind)**
