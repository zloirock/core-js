<p align="center"><img alt="core-js" src="https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png" /></p>

# So, what's next?

Hi. I am (**[@zloirock](https://github.com/zloirock)**) a full-time open-source developer. I don't like to write long posts, but it seems this is high time to do it. Initially, this post was supposed to be a post about the start of active development of the new major version of `core-js` and the roadmap (it was moved to [the second half](#roadmap)), however, due to recent events, became a really long post about many different things... I'm fucking tired. Free open-source software is fundamentally broken. I could stop working on this silently, but I want to give open-source one last chance.

## What is [`core-js`](https://github.com/zloirock/core-js)?

- It is the most popular and the most universal polyfill of the JavaScript standard library, which provides support for the latest ECMAScript standard and proposals, from ancient ES5 features to bleeding edge features like [iterator helpers](https://github.com/tc39/proposal-iterator-helpers), and web platform features closely related to ECMAScript, like `structuredClone`.
- It is the most complex and comprehensive polyfill project. At the time of publishing this post, `core-js` contains about a half thousand polyfill modules with different levels of complexity — from `Object.hasOwn` or `Array.prototype.at` to `URL`, `Promise` or `Symbol` — that designed to work together. With another architecture, each of them could be a separate package — however, it is not so convenient.
- It is maximally modular — you can easily (or even automatically) choose to load only the features you will be using. It can be used without polluting the global namespace (someone calls such a use case "ponyfill").
- It is designed for integration with tools and provides all that's required for this — for example, `@babel/preset-env`, `@babel/transform-runtime`, and similar SWC features are based on `core-js`.
- It is one of the main reasons why developers can use modern ECMAScript features in their development process each day for many years, but most developers just don't know that they have this possibility because of `core-js` since they use `core-js` indirectly as it's provided by their transpilers / frameworks / intermediate packages like `babel-polyfill` / etc.
- It is not a framework or a library, which usage require the developer to know their API, periodically look at the documentation, or at least remember that he or she is using it. Even if developers use `core-js` directly — it’s just some lines of import or some lines in the configuration (in most cases — with mistakes, since almost no one read the documentation), after that, they forget about `core-js` and just use provided by `core-js` features from web-standards — but sometimes this is the most of JS standard library that they use.

[About 9 billion NPM downloads / 250 million NPM downloads for a month](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=core-js-bundle&from=2014-11-18), 19 million dependent GitHub repositories ([global](https://github.com/zloirock/core-js/network/dependents?package_id=UGFja2FnZS00ODk5NjgyNDU%3D) ⋃ [pure](https://github.com/zloirock/core-js/network/dependents?package_id=UGFja2FnZS00MjYyOTI0Ng%3D%3D)) — big numbers, however, they do not show the real spread of `core-js`. Let's check it.

I wrote [a simple script](https://github.com/zloirock/core-js/blob/master/scripts/usage/usage.mjs) that checks the usage of `core-js` in the wild by the Alexa top websites list. We can detect obvious cases of `core-js` usage and used versions (only modern).

<p align="center"><img alt="usage" src="https://user-images.githubusercontent.com/2213682/218452738-859e7420-6376-44ec-addd-e91e4bcdec1d.png" /></p>

At this moment, this script running on the TOP 1000 websites **detects usage of `core-js` on [52%](https://gist.github.com/zloirock/7ad972bba4b21596a4037ea2d87616f6) of tested websites**. Depending on the phase of the moon (the list, websites, etc. are not constants), results may vary by a few percent. However, it’s just a naive detection on initial pages using a modern browser that loses many cases, **manual check shows that it’s additional dozens of percent**. For example, let's leave the initial pages of some websites from the screenshot above where `core-js` was **not** found by this script, without repetition of each company (at first — MS that's already on the screenshot) websites (be patient, after the series of screenshots the number of pictures will decrease):

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

**With such a manual check, you can find `core-js` on about 75-80 of the top 100 websites** while the script found it on about 55-60. On a larger sample the percentage, of course, decreases.

[Wappalyzer](https://www.wappalyzer.com/technologies/javascript-libraries/) allows detection of used technologies, including `core-js`, with a browser plugin and has previously shown interesting results, but now on their website, all the most popular technologies' public results are limited to only about 5 million positives. Statistics based on Wappalyzer results are available [here](https://almanac.httparchive.org/en/2022/javascript#library-usage) and show `core-js` on 41% and 44% of 8 million mobile and 5 million desktop tested pages. [Built With at this moment shows `core-js` on 54% of TOP 10000 sites](https://trends.builtwith.com/javascript/core-js) (however, I'm not sure about the completeness of their detection and see the graph from another reality).

Anyway, we can say with confidence that **`core-js` is used by most of the popular websites**. Even if `core-js` is not used on the main site of any large corporation, it's definitely used in some of their projects.

What JS libraries are more widespread on websites? It’s not [React](https://trends.builtwith.com/javascript/React), [Lodash](https://trends.builtwith.com/javascript/lodash), or any other most talked-about library or framework, I am pretty sure only about ["good old" jQuery](https://trends.builtwith.com/javascript/jQuery).

And `core-js` is not only about websites frontend — it's used almost everywhere where JavaScript is used — but I think that's more than enough statistics.

<p align="center"><img alt="github" src="https://user-images.githubusercontent.com/2213682/211223204-ec62ea94-1df8-4a91-a9b2-4e85aef24677.png" /></p>

However, for the above reasons, [**almost no one remembers that he or she uses `core-js`**](https://2022.stateofjs.com/en-US/other-tools).

Why am I posting this? No, not to show how cool I am, but to show how bad everything is. Read on.

---

## Let's start the next part with one popular `xkcd` picture

[<p align="center"><img alt="xkcd" src="https://user-images.githubusercontent.com/2213682/113476934-c70f0900-94a8-11eb-8723-d080f129a449.png" /></p>](https://xkcd.com/2347/)

### Beginning

I switched my development stack to full-stack JavaScript in 2012. It was a time when JavaScript still was too raw — IE still was more popular than anything else, ES3 era browsers still occupied a significant part of the web, the latest NodeJS version was 0.7 — it was just starting its way. JavaScript still was not adapted for writing serious applications and developers solved problems of lack of required language syntax sugar with compilers from languages like CoffeeScript and lack of proper standard library with libraries like Underscore. However, it wasn't a standard — over time, these languages and libraries become obsolete together with the projects that use them. So, I took all news of the upcoming ECMAScript ~~Harmony~~ 6 standard with great hope.

Given the prevalence of old JavaScript engines and the fact that users were in no hurry and often did not have the opportunity to abandon them, even in the case of quick and problem-free adoption of the new ECMAScript standard, the ability to use it only through JavaScript engines was postponed for many and many years. But it was possible to try to get support features from this standard using some tools. Transpilers (this word was not as popular as now) should have to solve the problem with the syntax, and polyfills — with the standard library. However, at that time the necessary toolkit was only just beginning to emerge.

It was a time when ECMAScript transpilers started to become popular and develop actively. However, at the same time, polyfills almost have not evolved according to users' and real-life projects' needs. They were not modular. They were not been able to use without global namespace pollution — so they were not suitable for libraries. They were not one complex — it was required to use some different polyfill libraries from different authors and somehow make them work together — but in some cases, it was almost impossible. Too many necessary fundamental language features were just missed.

To fix those problems, at the end of 2012, initially for my own projects, I started to work on the project that later was called `core-js`. I wanted to make the life of all JS developers easier and in November 2014, I published `core-js` as an open-source project. *Maybe it was the biggest mistake in my life.*

Since I was not the only one who faced these issues, after a few months, `core-js` has already become the de facto standard of JavaScript standard library features polyfill. `core-js` had been integrated into Babel (`6to5` at that moment) that appeared a couple of months before `core-js` publishing — some of mentioned above issues were critical for this project too. `core-js` began to be distributed as `6to5/polyfill`, after rebranding — `babel-polyfill`. After some months of collaboration, has appeared a tool that became `babel-runtime` after rebranding and evolution. After some months `core-js` was integrated into the key frameworks.

### Ensuring compatibility for the whole Web

I didn't promote myself or the project. *This is the second mistake.* `core-js` hadn't a website or social media accounts, only GitHub. I did not show up at conferences to talk about it. I almost didn't write posts about it. I was just making a really useful and wanted part of the modern development stack and I was happy about that. I gave developers a chance to use the most modern and really necessary JavaScript features without waiting for years until they are implemented in all required engines, without thinking about compatibility and bugs — and they started to use it. The spread of the project had grown exponentially — very soon it was already used on dozens of percent of popular websites.

However, it was just the start of the required work. Many years of hard work followed. Almost every day I spent some hours on `core-js` and related projects (mainly Babel and [`compat-table`](https://kangax.github.io/compat-table/es2016plus/)) maintenance.

![github](https://user-images.githubusercontent.com/2213682/218516268-6ec765a5-50df-4d45-971f-3c3fc4aba7a1.png)

`core-js` is not a several lines library that you can write and forget about it. Unlike the vast majority of libraries, it's bound to the state of the Web. It should react to any change of JavaScript standards or proposals, to any new JS engine release, to any detection of a bug in JS engines, etc. After ECMAScript ~~6~~ 2015 followed new proposals, new versions of ECMAScript, new non-ECMAScript web standards, new engines and tools, etc. The evolution, the improvement of the project, and the adaptation to the current state of the Web have never stopped — and almost all of this work remains not visible to the average user.

The scale of required work was constantly growing.

I tried to find other maintainers or at least constant contributors for `core-js` in different ways for a long time, but all attempts have failed. Almost every JS developer used `core-js` indirectly and knew, for example, `babel-polyfill`, `babel-runtime`, or that his framework polyfill all required features, but almost no one knew `core-js`. In some posts about polyfilling where `core-js` was mentioned, it was called "a small library". It was not a trendy and widely discussed project, so why help maintain it if it works great anyway? Over time I lost hope for it, but I felt a responsibility to the community, so I was forced to continue working alone.

After a few years combining full-time work and FOSS became almost impossible — no one wanted to pay money for the working time devoted to FOSS, non-working hours were not enough, and sometimes `core-js` required complete immersion for weeks. I thought that proper polyfilling is required for the community and money was not my priority.

I left a high-paying job and did not accept some very good options because in those positions I did not have the opportunity to devote enough time to work on open-source. I started to work on open-source full-time. No one paid me for it. I hoped sooner or later to find a job where I could fully dedicate myself to open-source and web standards. Periodically, I earned the money, required for life and work on FOSS, on short-term contracts. I returned to Russia, where it was possible to have a decent standard of living for relatively small money. *One more mistake — as you will see below, money matters.*

---

Until April 2019, for about one and a half years as a whole and about a half-year full-time without distraction to any other work, I worked on [the `core-js@3` with a fundamental improvement of polyfilling-related Babel tools](https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md), the basement of the toolkit generation that now is used almost everywhere.

### Accident

Shit happened 3 weeks after the `core-js@3` release. One April night, at 3 AM, I was driving home. Two deadly drunk 18-years-old girls in dark clothes decided somehow *to crawl* across a poorly lit highway — one of them lay down on the road, another sat down and dragged the first, but not from the road — directly under my wheels. That's what the witnesses said. I had absolutely no chance to see them. One more witness said that before the accident they were just jokingly fighting on the road. Nothing unusual, it's Russia. One of them died and another girl went to a hospital. However, even in this case, according to Russian arbitrage practice, if the driver is not a son of a deputy or someone like that, he almost always will be found guilty — he should see and anticipate everything, and a pedestrian owes nothing to anyone. I could end up in prison for a long time, IIRC later the prosecutor requested 7 years.

The only way not to end up in prison was reconciliation with "victims" — a standard practice after such accidents — and a good lawyer. Within a few weeks after the accident, I received financial claims totaling about 80 thousand dollars at the exchange rate at that time from "victims'" relatives. A significant amount of money was also needed for a lawyer.

Maybe it's not inconceivable much money for a good software engineer, but, as I wrote a little above, for a long time I worked on the `core-js@3` release full time. Of course, no one paid me for this work, and I completely exhausted all my financial reserves, so, sure, I hadn't such money and I didn't have a chance to find the required money from available sources. The time I had was running out.

### Fundraising

By that time `core-js` already was used almost as widely as it's now. As I wrote above, for a long time I looked for contributors for `core-js` without any success. However, `core-js` is a project that should be actively maintained and it can’t stay just frozen. My long-term imprisonment would have caused problems not only for me — but it's also the death of `core-js` and problems for all who use it — for half of the Web. The notorious [bus factor](https://en.wikipedia.org/wiki/Bus_factor).

Some months before that, I started raising funds to support the `core-js` development (mainly it was posted READMEs on GitHub and NPM). The result was... \$57 / month. Fair pay for full-time work on ensuring compatibility for the whole web 😂

I decided to make a little experiment — to ask for help from the `core-js` users — those who will suffer if `core-js` will be left without maintenance. I added a message on `core-js` installation:

![postinstall](https://user-images.githubusercontent.com/2213682/153024428-28b8102c-ce08-461c-af99-d0417dc7d2cd.png)

I understood that hardly I'll get all the required money on donations, however, every dollar mattered. I added a job search message to get a chance to earn another part. I was thinking that some lines in the NPM installation log asking to help, which can be hidden if it's required, is an acceptable price for using `core-js`. The original plan was to delete this post in a few weeks, but everything went against the plan. How wrong I was about people...

### Hate

Of course, I expected that someone would not like to see a request for help in their console, but the continuous stream of hate that I began to receive went through the roof. It was hundreds of messages, posts, and comments for a day. All this can be reduced to something like:

<p align="center"><img alt="get-rid" width="720" src="https://user-images.githubusercontent.com/2213682/154875165-2b144651-5769-4f8e-9072-3a1a03bfe164.png" /></p>

This is far from the funniest thing I've seen — if I wanted to, I could collect a huge selection of statements in the style [collected here](https://github.com/samdark/opensource-hate) — but why? I already have enough negativity in my life.

**Developers love to use free open-source software — it’s free and works great, they are not interested in that many and many thousands of hours of development, and real people with their own problems and needs are behind it. They consider any mention of this as an invasion of their personal space or even a personal affront. For them, these are just gears that should automatically change without any noise and their participation.**

So, thousands of developers attacked me with insults and claimed that I have no right to ask them for any kind of help. My request for help offended them so much that they began to demand restricting my access to the repository and packages and move them to someone else like it was done with [`left-pad`](https://arstechnica.com/information-technology/2016/03/rage-quit-coder-unpublished-17-lines-of-javascript-and-broke-the-internet/). Almost no one of them understood what `core-js` does, the scale of the project, and, of course, no one of them wanted to maintain it — it should do "the community", someone else. Seeing all this hatred, in order not to be led by the haters, I did not delete the help-asking message, that initially planned to add only for a couple of weeks, just out of principle.

**What about companies for whom `core-js` helped and helps to make big money? It's almost all big companies. Let's rephrase [this old tweet](https://twitter.com/AdamRackis/status/931195056479965185):**

> Company: "We'd like to use SQL Server Enterprise"
>
> MS: "That'll be a quarter million dollars + $20K/month"
>
> Company: "Ok!"
>
> ...
>
> Company: "We'd like to use core-js"
>
> core-js: "Ok! npm i core-js"
>
> Company: "Cool"
>
> core-js: "Would you like to help contribute financially?"
>
> Company: "lol no"

A few months later, tired of user complaints, NPM presented [`npm fund`](https://docs.npmjs.com/cli/v6/commands/npm-fund) — it was not a problem solution, it was just a way to get rid of those complaints. How often did you call `npm fund`? How often did you pay donations to someone who you saw in `npm fund`? Who did you see and support at first — `core-js` or one who maintains a dozen of one-line libraries dependent on each other? It also provided NPM a perfect justification for the future step (read below).

Within 9 months many thousands of developers, including developers of projects fundamentally dependent on `core-js`, knew about the situation — but no one offered to maintain `core-js`. Within many months I talked with maintainers of some significant projects dependent on `core-js`, but without any success — they hadn't required time resources. So I was forced to ask some of my friends who were not related to FOSS community (at first **[@slowcheetah](https://github.com/slowcheetah)**, thanks him for his help) to cover me and at least try to fix significant issues until I get free.

---

Few users and small companies supported the `core-js` — and I am very grateful to them. However, within 9 months it was collected only about 1/4 of the money that should have been collected within a couple of weeks to change something.

During the same time, despite everything, the number of `core-js` downloads for a day almost doubled.

In January 2020 I ended up in prison.

### Release

I don’t wanna say many words about prison and I have no great desire remembering this. It was slave labor at a chemical factory where my health was significantly ruined and where I 24/7 had a great time in a company of drug dealers, thieves, and killers (from other regimes), without access to the Internet and computers.

After about 10 months, I was released early.

---

I saw dozens of articles, hundreds of posts, and thousands of comments the essence of many of which can be expressed by this:

<p align="center"><img alt="reddit" width="720" src="https://user-images.githubusercontent.com/2213682/218419779-d61c9e39-c8c1-412b-83aa-eb1b12d2e760.png" /></p>

What do you think I did? *Of course, I made the same mistake.* I saw some people who supported the development of `core-js`, many issues, questions, and messages — sure, not so much like angry comments. `core-js` became even more popular and was already used by almost the same percentage of websites as it is now.

### Ensuring compatibility for the whole Web again

I returned to `core-js` maintenance like it was before. Moreover, I completely stopped being distracted by contracts and any other work in favor of working on `core-js`. `core-js` had some money on funding platforms — not so much, many times less than I received before starting work on `core-js` full-time — but for me alone it was enough for life. A kind of down-shifting, full-time Open-Source for making the world better... I didn't think about the tens of thousands of dollars in lawsuits left over from the accident. I didn't think about my future. I thought about a better future for the Web. And, of course, I was hoping that some company would offer me a position with the opportunity to work on web standards and would sponsor my work on polyfills and FOSS.

[A lot has been accomplished](https://github.com/zloirock/core-js/compare/0943d43e98aca9ea7b23cdd23ab8b7f3901d04f1...master) over the next two years — in terms of work, almost the same as in the previous 8 years. This is still `core-js@3` — but much better. However, the changelog and even the previous diff reflect only a few percent of the work done. Almost all of this work remains in the shadows, not visible to the average user.

This is a fundamental work with standards and proposals. As a side effect of this work, taking into account the hard work that was done and changes after my feedback and suggestions, I consider many of the ECMAScript proposals that have become part of the language my achievements as much as they are achievements of their champions. This is work with engines and their bug trackers in searching for bugs. This is constant automatic and (too often) manual testing in many hundreds of environments, many thousands of environments / builds / test suites combinations for ensuring proper work of standard library everywhere and collecting compat data. From a raw prototype, made in a couple of days, `core-js` compat data became exhaustive data set with proper external and internal tooling. This is the design and prototyping of many features that are yet to appear in the project. And also much, much more.

---

As you can see above, `core-js` is present in most of the popular websites, provides an almost complete JavaScript standard library, and fixes not proper implementations. The number of web page openings with `core-js` is greater than the number of web page openings in Safari and Firefox. Thus, from a certain point of view, `core-js` can be called one of the most popular JavaScript runtimes.

During work on `core-js`, I am the first implementor of almost all modern and future JavaScript standard library features, almost all of them have my feedback and they have been fixed according to it. `core-js` is the best playground for experimentation with ECMAScript proposals. In too many cases, proposals have feedback from other users after they play with experimental `core-js` implementations of proposals.

The best way forward for JavaScript would be for TC39 and `core-js` to work together on the future of JavaScript. For example, TC39 invites members of projects like Babel and others as experts. But seems not in the `core-js` case. Instead of this, too often, I see ignore of my or `core-js` issues or even making roadblocks by TC39 members and they even don’t hide it:

<p align="center"><img alt="shu" width="600" src="https://user-images.githubusercontent.com/2213682/140033052-46e53b0c-e1bc-4c84-a1f4-3511d7de604a.png" /></p>

---

<p align="center"><img alt="lj" width="800" src="https://user-images.githubusercontent.com/2213682/217476089-604b1629-73a8-4715-9276-a601004f0947.png" /></p>

---

After a while, "support" came from NPM. In `npm@7` which was released at the end of 2020 as a logical continuation of `npm fund` was disabled console output in post-install scripts. The result was expected — because people stopped seeing the funding request and almost no one uses `npm fund`, the number of `core-js` backers began to decline. Excellent support for the project from those who not only earn by distributing my work but also use it themselves -)

<p align="center"><img alt="npm" width="720" src="https://user-images.githubusercontent.com/2213682/218333796-18bee93f-64e7-4257-8ddd-d16fc4f05989.png" /></p>

In addition, another factor came into play again. Higher quality — less support. Is the library well-maintained? There are practically almost no open bug reports, and if they happen, is it fixed almost instantly? Does the library already give us almost everything we want? Yes? So why should we support the maintenance of the library? The price at which this is done for the maintainers is not on the surface — for the most, it's still just "a small library". Many of those who backed `core-js` before stopped doing it.

`core-js` code contains my copyright. As you can see at the top of this post, it's present in about half of all websites. Regularly someone finds it in the source code of harmful sites / applications — but they don't know what is `core-js` and their tech level is not good enough even for finding out it. After that, the police call and threaten me, and someone even tries to blackmail me. Sometimes it's even not funny.

I have been contacted several times by American and Canadian journalists who discover `core-js` on American news and government websites. They were very disappointed that I was not an evil Russian hacker who meddles in American elections.

The endless stream of hatred decreased slightly over time but continued. However, most of it moved from something like GitHub issues or Twitter threads to my mail or IM. Today, one developer wrote to me a message. He called me a parasite on the body of the developer community that makes a lot of money spamming and doing nothing useful. He called me the same murderer as [Hans Reiser](https://en.wikipedia.org/wiki/Hans_Reiser), but who bought the judge and went unpunished. He wished death on me and all my relatives. And there is nothing unusual here, I get several such messages a month. In the last year, this has been added that I am a "Russian fascist".

### Some words about war

**Open-source should be out of politics.**

I don't want to choose between two kinds of evil. I will not comment on this in more detail, since there are people close to me on both sides of the border who may suffer because of this.

Let me remind you what I wrote about above — I returned to Russia because it was a place where it was possible to have a decent standard of living for relatively small money and concentrate on FOSS instead of making money. Now I cannot leave Russia, because after the accident I have outstanding lawsuits in the amount of tens of thousands of dollars and I am forbidden to leave the country until they are paid off.

### What do you think, how much money `core-js` earn for a month?

When I started to maintain `core-js` full-time, without being distracted by contracts and any other work, **it was about \$2500 for a month — it was about 4-5 times less than I usually had on full-time contracts**. Remember, a kind of down-shifting, to make the Web better. Temporarily. Reduce issues and bugs to zero, make the highest quality product, which is used by almost everyone — and the project will be sufficiently supported, right? Right?

After a few months, monthly repeat was **decreased to about \$1700** *(at least that's what I thought)* — \$1000 via Tidelift, \$600 via Open Collective, and \$100 via Patreon. In addition to the monthly repeat, one-time donations periodically come — on average it was maybe \$100 for a month.

Crypto? Adding a crypto wallet for donations was a very popular request. However, for all the time, only 2 transfers for a total amount of about \$200 have been received on crypto wallets, the previous one was more than a year ago. GitHub sponsors? It's not available for Russia and never was. PayPal? It's banned for Russians. When it was available, `core-js` received about 60$ for all time. Grants? I applied for a lot of grants — all were ignored.

**The main part, \$400 for a month, from those donations, `core-js` had from... [Bower](https://bower.io/), another FOSS community. I am also very grateful [to all other sponsors](https://opencollective.com/core-js#section-contributors) — because of your donations, I'm still working on this project.**

However, in this list there is no one big corporation or at least a company from the top 1000 website list. Let's be honest — there are mainly individuals, and only a few small companies on the current list of backers and they pay a few dollars a month.

If someone will say that they don't know that `core-js` requires funding... Come on, I regularly see memes like [this](https://www.reddit.com/r/ProgrammerHumor/comments/fbfb2o/thank_you_for_using_corejs/):

<p align="center"><img alt="sanders" width="400" src="https://user-images.githubusercontent.com/2213682/218325687-08d58543-4b88-4a39-a0de-420bd325450f.png" /></p>

---

A year ago, Tidelift stopped sending me money. They said that because of the political situation, the Hyperwallet that they used is no longer available for Russians (but it was available for me till the previous month when I tried to update some personal data), and for safety, they will store my money on their side. Within a previous few months, I tried to get this money to a bank or a Hyperwallet account but received only replies that they will try to do something (*sounds great, doesn't it?*). From the end of the previous year, they just stopped responding to emails. And now, I've got this:

![tidelift](https://user-images.githubusercontent.com/2213682/217650273-548d123d-4ee4-4beb-ad5b-631c55e612a6.png)

**In such an amusing way, I found out that I will not receive the money for the previous year, and this year I worked not for \$1800, but for \$800 a month.** There were, of course, no replies to subsequent emails. However, their site indicated that I received and still receive money through them.

<p align="center"><img alt="tidelift" width="500" src="https://user-images.githubusercontent.com/2213682/218159794-1ea53543-a8ff-463a-ad36-dc900a34b7c8.png" /></p>

I wonder how the companies that support their dependencies chain through them will react to such a scam.

---

At the same day, on OpenCollective I saw that the monthly repeat was reduced from about \$600 to about \$300. Apparently, the financial reserves of `Bower` have come to an end. That means that **for this month I'll get about \$400 at all**.

In the previous months, I measured how much time takes the work on `core-js`. It turned out about... **250 hours a month** — significantly more than a full day without any days off, which makes it impossible to have “real” (as many say) full-time work or work any significant contracts. $400 for 250 hours... It will be less than **\$2 per hour of work, for the previous year a little more — $4 per hour**. Yes, in some months, I spend less time working on the project — however it does not change much.

So much willing to pay for ensuring compatibility for the whole Web. And no insurance or social security.

**Awesome earning growth and career, right?**

I think you understand well how much senior software engineers in key IT companies get paid. I received a lot of comparable offers, however, they are not compatible with the proper work on `core-js`.

---

Among the regular threats, accusations, demands, and insults, I often get something like "Stop begging and go to work, idler. Remove your beggarly messages immediately — I don't wanna see them." The funny thing is that at least some of these people get over $300,000 a year (which I know for sure because I talk to their colleagues), and (because of the nature of their work) `core-js` save them many hours of work each month.

### Everything changes

When I started working on `core-js`, I was alone. Now I have a family. A few over a year ago, I became a father of son. Now I have to provide him with a decent standard of living.

![son](https://user-images.githubusercontent.com/2213682/208297825-7f98a8e2-088e-47d3-95a6-a853077296b3.png)

I have a wife and sometimes she wants some new shoes or a bag, a new iPhone or Apple Watch. My parents are already at the age that I need to significantly support them.

I think it is obvious that it is impossible to properly support a family with the money that I have or had from `core-js` maintenance. Financial reserves I used, have finally come to the end.

More and more often I hear reproaches like: "Give up your Open-Source, this is pampering. Go back to a normal job. `%USERNAME%` works as a programmer for just a year. He understands almost nothing about it, works a couple of hours a day, and already earns times more than you."

# NO MORE

I'm damn tired. I love working on open-source and `core-js`. But who or what am I doing this for? Let's summarize the above.

- I ensure no compatibility issues and provide bleeding edge features of the web platform for most of the Web from 2014 and I'm working on it almost all my time for money that now will not be enough even for food.
- Instead of any gratitude, all I see is huge hatred from developers whose life I simplify.
- Companies that save and earn many millions of dollars on `core-js` usage just ignore `core-js` funding requests.
- Even in a critical situation, on an ask for help, instead of help, most of them preferred to ignore or hate.
- Instead of working together with standards and browsers developers on a better future for JavaScript, I'm forced to struggle with roadblocks that they make.

---

I don't care about the haters. Otherwise, I would leave open-source a long time ago.

I can tolerate the lack of normal interaction with the standards developers. First of all, it's future problems for users and, when the Web will be broken, for standards developers themself.

**However, money matters.** I've had enough of sponsoring corporations at the expense of my and my family's well-being. I should be able to ensure a bright future for my family, for my son.

The work on `core-js` takes almost all my time, more than a full working day. This work ensures the proper work the most of the popular websites and this work should be paid properly. I'm not going to keep working for free or for $2 per hour. I'm willing to continue working on a project at least for $80 an hour. This is the money that have, for example, [`eslint` team members for an hour](https://eslint.org/blog/2022/02/paying-contributors-sponsoring-projects/#paying-team-members-per-hour). And, if work on open-source requires it, I'm ready to pay off my lawsuits and leave Russia — however, it's not cheap.

---

Regularly I see comments like this:

<p align="center"><img alt="core-js approach" width="600" src="https://user-images.githubusercontent.com/2213682/136879465-88b3d349-6a1a-442e-bb78-fb20916a4679.png" /></p>

Ok guys, if you want it — let's use such an approach.

---

## Depending on your feedback, `core-js` will soon follow one of the following ways:

- **Appropriate financial backing**

  I hope that at least after reading this post corporations, small companies, and developers will finally think about the sustainability of their development stack and will properly back `core-js` development. In this case, `core-js` will be appropriately maintained and I’ll be able to concentrate on adding [a new level of functionality](#roadmap).

  The scale of the necessary work goes through the roof, one of me is no longer enough — I can't work more physically. Some work, for example, improving test coverage or documentation, is simple enough and takes a lot of time, but it’s not the kind of work that volunteers want to do — I don’t remember any PRs with improving test coverage of existent features. So it makes sense to attract at least one or two developers (at least students, better — higher level) on a paid basis.

  Taking into account the involvement of additional maintainers and other expenses, I think that at this moment about 30 thousand dollars for a month could be enough. More money — better product and faster development. A couple times less — it makes sense to resume the work on `core-js` full-time alone — sure, not as productive as it could be with a team.

- **I may be hired by a company where I will be able to work on Open-Source and Web standards**

  and that will give me the resources required for continuation of work.

- **`core-js` will become a commercial project** if it will not have appropriate support from users

  It's problematic to create a commercial infrastructure around the current `core-js` packages, so most likely the new `core-js` major release will change the license. The free version will be significantly limited. All extra functionality will be paid for. `core-js` will continue to evolve appropriately and, in the scope of this project, will be created many new tools for ensuring web compatibility. Sure, it will significantly reduce the spread of `core-js` and will cause problems for many developers, however, even some paying customers could be enough and my family will have money for paying bills.

- **Slow death** in case I'll see that `core-js` is not required

  I have many ideas for commercial projects, I have a lot of good job offers — all this takes time, which now goes to `core-js` maintenance. It does not mean that I'll immediately completely stop to maintain `core-js` — I'll just maintain pro-rata donations. If they are at the current level, it will be only a few hours of maintenance a month instead of hundreds now. The project will stop the upgrowth — maybe minor bugs will be fixed and compatibility data will be updated — this time is not enough for more. After a while, `core-js` will become just useless and will die.

I still hope for the first outcome since `core-js` is one of the key components of the modern digital infrastructure, but, looking at the current and the past, I am mentally getting ready for other options.

## I will answer in advance some angry comments that I see regularly and that will definitely be after this post:

- **"Not a problem, we will just pin the `core-js` dependency."**

  Unlike most projects, `core-js` should be on the bleeding edge since `core-js` allows you to be on the bleeding edge of JavaScript — use the most recent JavaScript features and don’t think about engines compatibility and bugs. However, the library has a good safety margin for the future. Maybe for a year or a couple, you will not have serious problems. After that, they will appear — polyfills will be obsolete, but still will be present in your bundles and will be just useless ballast. You will not be able to use new features of the language and will face new bugs in JS engines.

- **"It's open-source, we will fork it, fuck off."**

  I see such comments regularly, someone even tries to scare me with a fork. I've said already too many times that **if someone will fork and properly maintain `core-js`, I'd be happy** — it makes no sense just to fork it without maintenance. Now I don't see even anyone who tries to add to `core-js` something significant or at least contribute regularly. It should react on each new JavaScript engine release to update compatibility data, fix or at least take into account each new (no matter how significant) bug from each engine, take a look and implement each new JavaScript feature that possible, do it maximally properly, test and take into account the specifics of each version of each modern or legacy engine — it's a hard work — are you ready and have the required knowledge and time for that? For example, when I was in prison, Babel said that they are not:

  <p align="center"><img alt="babel" width="800" src="https://user-images.githubusercontent.com/2213682/154870832-36318fdd-c5a0-45ce-aaed-2d50371a2976.png" /></p>

- **"We don't need `core-js`, many alternative projects are available."**

  Nobody is holding you. But where are those alternatives in real life? Sure, `core-js` is not the only polyfill of the JavaScript standard library. But all other projects are [tens](https://npm-stat.com/charts.html?package=core-js&package=core-js-pure&package=es6-shim&from=2014-11-18) [times](https://user-images.githubusercontent.com/2213682/205467964-2dfcce78-5cdf-4f4f-b0d6-e37c02e1bf01.png) less popular than `core-js`, and it's not unreasonable — all of them provide only a little part of `core-js` functionality, they are not enough proper and complex, the number of cases where they can be used is significantly limited, they can’t be properly integrated into your project in such simple way and have other significant problems. In case of the existence of proper alternatives, I would stop working on `core-js` a long time ago.

- **"We can drop IE support, so we no longer need polyfills."**

  As I wrote a little above, nobody is holding you. In some cases, polyfills are really not required and you can avoid them, but it's only a little part of all cases — almost the same as it was in the IE era. Of course, if you don't need IE support, polyfills will not expand your possibilities as much as it was with adding ES6 support to IE8. But even the most modern engines do not implement the most modern JavaScript features. Even the most modern engines contain bugs. Are you pretty sure that you and your team perfectly know all limitations of all engines that you support and can work around them? Even I sometimes may forget some moments.

- **"You are an asshole, we will expel you from the FOSS community."**

  Yes, you're right. I'm such an asshole that gives you a chance to use modern JavaScript features in the real life, have been solving your cross-engine compatibility issues for many years, and had sacrificed for this more than anyone else. I’m such an asshole that just wants his son to be well-fed, wants his family has money to pay bills and does not need anything. Some options above suppose my leaving FOSS in favor of commercial software, so will see.

---

Now let's move away from the negative to the second half of this post where we will talk about things that would be nice to implement in `core-js` and problems of polyfilling at all.

# Roadmap

JavaScript, browsers, and web development are evolving with amazing speed. The time when almost all of the `core-js` modules were required for all browsers has gone. The latest browsers have good standards support and, with common use cases, they need only some percentage of the `core-js` modules for the most recent language features and bug fixes. Some companies are already dropping support for IE11 which recently was "buried" once more. However, even without IE, old browsers will always be, bugs will happen even in modern browsers, and new language features will appear regularly and anyway they will appear in browsers with a delay — so, if we want to use modern JS in development and minimize possible problems, polyfills stay with us for a long time, but they should evolve.

Here I will not (almost) write about adding new or improving existing specific polyfills (but, sure, it's one of the main parts of `core-js` development), let's talk about some other crucial moments without focusing on minor things. If it is decided to make a commercial project from `core-js`, the roadmap will be adapted to this condition.

I am trying to keep `core-js` as compact as possible, but one of the main conceptions that it should follow is to be maximally useful in the modern web — the client should not load any unnecessary polyfills and polyfills should be maximally compact and optimized. Currently, a maximal `core-js` bundle size with early-stage proposals [is about 220KB minified, 70KB gzipped](https://bundlephobia.com/package/core-js) — it's not a tiny package, it's big enough — it's like jQuery, LoDash, and Axios together — the reason is that the package covers almost the entire standard library of the language. The individual weight of each component is several times less than the weight of quite correct alternatives. It's possible to load only the `core-js` features that you use and in minimal cases, the bundle size can be reduced to some kilobytes. When `core-js` is used correctly, this is usually a couple of tens of kilobytes — however, there is something to strive for. [Most pages contain pictures larger](https://almanac.httparchive.org/en/2022/media#bytesizes) even the full `core-js` bundle, most users have Internet speed in dozens of Mbps, so why is this concept so significant?

I don't want to repeat old posts about [the cost of JavaScript](https://medium.com/dev-channel/the-cost-of-javascript-84009f51e99e) in detail where you can read why adding JS increases the time when the user can start interacting with the page much more than adding a similar size picture — it's not only downloading, it's also parsing, compiling, evaluating the script, it blocks the page rendering.

In too many places, mobile Internet is not perfect and still 3G or even 2G. In the case of 3G, downloading of one full copy of `core-js` can take a couple of seconds. However, pages contain more than one copy of `core-js` and many other duplicated polyfills too often. Some (mainly mobile) Internet providers have very limited "unlimited" tariff plans and after some gigabytes reduce the speed to some Kbps. Internet speed is also often limited for many other reasons.

The speed of the page loading equals the revenue.

<p align="center"><img alt="conversion" width="600" src="https://user-images.githubusercontent.com/2213682/217910389-7320a726-890d-4f34-a941-f51a069f01a1.png" /></p>

> Illustration is from a [random post](https://medium.com/@vikigreen/impact-of-slow-page-load-time-on-website-performance-40d5c9ce568a) by googling

The size of `core-js` is constantly growing because of adding new or improving existing polyfills. This issue also is a block for adding some big polyfills — adding `Intl`, `Temporal`, and some other features to `core-js` could increase the maximal bundle size a dozen times to some megabytes.

One of the main `core-js` killer features is that it can be optimized with the usage of Babel, SWC, or manually, however, current approaches solve only a part of the problem. To properly solve them, the modern web requires a new generation of the toolkit that could be simply integrated into the current development stack. And in some cases, as you will see below, this toolkit could help to make the size of your website pages even less than just without `core-js`.

I already wrote about some of this in [**`core-js@3`, Babel and a look into the future** post](https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md#look-into-the-future), but that were just raw ideas. Now it's in the stage of experimentation or even implementation.

Since the future of the project is in doubt, it makes no sense to write any specific dates here, I do not promise that all of this will be done shortly, but this is what should be strived for.

---

### New major version

`core-js@3` was released about 4 years ago — it's too much. It's not a big problem for me to add some breaking changes (rather ensuring backward compatibility is often a challenge) and to mark a new version as a major release — it's a big problem for users.

At this moment, about 25% of `core-js` downloads are critically obsolete `core-js@2`. Many users wanna update it to `core-js@3`, but because their dependencies use `core-js@2` they still use the obsolete version for avoiding multiple copies (I saw such issues on GitHub in too many projects). Too frequent major updates would worsen such cases even more.

However, it's better not to get too obsessed with compatibility with older versions. The library contains too much that's not removed only for compatibility reasons. The absence of some long-needed breaking changes for someone will negatively affect the future. Judging by how the standards, the ecosystem, and the Web change, and how legacy accumulates, it's better to release a new major version each 2-3 years.

Adding all the new things that we would like to see in the new major version would take many years, which is unacceptable. However, `core-js` follows [SemVer](https://semver.org/) and makes sense to release a new major release at first with breaking changes (some of them below), most of the new features can be added in minor releases. In this case, such a release can take just about 2-3 months of full-time work and it can be the first `core-js` version that reduced the size compared to the previous -)

### `core-js` package directly

### Drop critically obsolete engines support

IE is dead. However, not for all — for many different reasons, someone is still forced to make or maintain websites that should work in IE. `core-js` is one of the main tools that makes life easier for them.

At this moment, `core-js` tries to support all possible engines and platforms, even ES3 — IE8-. But only a small part of developers using `core-js` needs support of ES3 engines — at this moment, the IE8- segment of browsers is about 0.1%. For many other users, it causes problems — bigger bundle size and slower runtime execution.

The main problem comes from supporting ES3 engines: most modern ES features are based on ES5 features, which aren't available in those old engines. Some features (like getters / setters) can't be polyfilled, so some polyfills (like typed arrays) can't work in IE8- complete. Some others require heavy workarounds. In case you need to polyfill only some simple features, the main part of `core-js` size in the bundle is the implementation of ES5 methods (in the case of polyfilling a lot of features, it's only some percent, so this problem is related mainly to minimalistic bundles).

Even simple replacing internal fallbacks of ES5 features to implementations to direct usage of those native features reduces minimalistic `core-js` bundle size 2+ times. After reworking the architecture, it will be reduced even more.

The IE9-10 segment of browsers already is also small — at this moment, the same 0.1%. But it makes no sense to consider dropping their support without dropping support of some other obsolete engines with similar or even greater restrictions, for example, Android 4.4.4 — in total, it's about 1%. Raising the lower bar higher than ES5 is a more difficult decision at least because of some non-browser engines. However, even dropping IE11 support in the future will not give so many benefits as dropping IE8- support now.

### ECMAScript modules and modern syntax

At this moment, `core-js` uses CommonJS modules. For a long time, it was the most popular JavaScript modules format, but now ECMAScript provides its own modules format and it's already very popular and supported *almost* everywhere. For example, Deno, like browsers, doesn’t support CommonJS, but supports ES modules. `core-js` should get an ECMAScript modules version in the near future. But, for example, on NodeJS, ECMAScript modules are supported only in the modern versions — but on NodeJS `core-js` should work without transpiling / bundling even in ancient versions, [Electron still does not support it](https://github.com/electron/electron/issues/21457), etc., so it's problematically to get rid of the CommonJS version immediately.

The situation with the rest of modern syntax is not so obvious. At this moment, `core-js` uses ES3 syntax. Initially, it was for maximal optimization since anyway it should be pre-transpiled to old syntax. But it was only initially. Now, `core-js` just can't be properly transpiled in userland and should be ignored in transpiler configs. Why? Let's take a look, for example, at Babel transforms:

- A big part of transforms rely on modern built-ins, for example, transforms which use `@@iterator` protocol — but `Symbol.iterator`, iterators, and all other related built-ins are implemented in `core-js` and absent before `core-js` loading.
- Another problem is transpiling `core-js` with transforms that inject `core-js` polyfills. Obviously, we can't inject polyfills into the place where they are implemented since it is circular dependencies.
- Some other transforms applied on `core-js` just break its internals — for example, [the `typeof` transform](https://babeljs.io/docs/en/babel-plugin-transform-typeof-symbol) (that should help to work with polyfilled symbols) breaks the `Symbol` polyfill.

However, the usage of modern syntax in polyfills code could significantly improve the readability of the source code, reduce the size and in some cases improve performance if polyfill is bundled for a modern engine, so it's time to think about rewriting `core-js` to modern syntax, making it transpilable by getting around those problems and publishing versions with different syntax for different use cases.

### Web standards polyfills

I'm thinking about adding the maximum possible web standards (not only ECMAScript and closely related features) support to `core-js` for a long time. First — about the remaining features from the [Minimum Common Web Platform API](https://common-min-api.proposal.wintercg.org/#index) ([what is it?](https://blog.cloudflare.com/introducing-the-wintercg/)), but not only about them. It could be good to have one bulletproof polyfills project for all possible web development cases, not only for ECMAScript. At the moment, the situation with the support of web standards in browsers is much worse than with the support of modern ECMAScript features.

One of the barriers preventing the addition of web standards polyfills to `core-js` was significantly increasing bundles size, but I think that with current technics of loading only required polyfills and technics which you could see below, we could add polyfills of web standards to `core-js`.

But the main problem is that it should not be naive polyfills. As I wrote above, now the correctness of ECMAScript features almost everywhere is not very bad, but we can't say it about web platform features. For example, [a `structuredClone` polyfill](https://github.com/zloirock/core-js#structuredclone) was relatively recently added. During work on it, taking into account the dependencies, I faced **hundreds** of different JavaScript engines bugs — I don't remember when I saw something like that when I added new ECMAScript features — for this reason, the work on this simple method, that naively could be implemented for a couple of hours, with resolving all issues and adding required features, lasted for several months. In the case of polyfills, better to do nothing than to do bad. The proper testing, polyfilling, and ensuring cross-platform compatibility web platform features require even more significant resources than what I spend on ECMAScript polyfills. So adding the maximum possible web standards support to `core-js` will be started only in case I have such resources.

---

### New approaches to tooling are more interesting

Someone will ask why it's here. What do tools, like transpilers, have to do with the `core-js` project? `core-js` is just a polyfill, and those tools are written and maintained by other people. Once I also thought that it is enough to write a great project with a good API, explain its possibilities, and when it becomes popular, it will acquire an ecosystem with proper third-party tools. However, over the years, I realized that this will not happen if you do not do, or at least not control, it yourself.

For example, for many years, instance methods were not able to be polyfilled through Babel `runtime`, but I explained how to do it too many times. Polyfilling via `preset-env` was not able to be used in real-life projects because of incomplete detection of required polyfills and a bad source of compatibility data, which I explained from the beginning. Because of such problems, I was forced [to almost completely rewrite those tools in 2018-2019, for the `core-js@3` release](https://github.com/babel/babel/pull/7646), after that we got the current state of statically analysis-based tools for polyfills injecting.

I am sure that if the approaches below are not implemented in the scope of `core-js`, they will not be properly implemented at all.

---

For avoiding some questions related to the following text: `core-js` tools will be moved to scoped packages — tools like `core-js-builder` and `core-js-compat` will become `@core-js/builder` and `@core-js/compat` respectively.

### Not only Babel: plugins for transpilers and module bundlers

At this moment, some users are forced to use Babel only due to the need to automatically inject / optimize required polyfills. At this moment, Babel's [`preset-env`](https://babeljs.io/docs/en/babel-preset-env#usebuiltins) and [`runtime`](https://babeljs.io/docs/en/babel-plugin-transform-runtime#core-js-aliasing) are the only enough good and well-known ways to optimize usage of `core-js` with statical analysis. It happened historically because I helped Babel with polyfills. It does not mean that it's the only or the best place where it could be done.

Babel is only one of many transpilers. TypeScript is another popular option. Other transpilers are gaining popularity now, for example, [SWC](https://swc.rs/) (that already contains [a tool for automatic polyfilling / `core-js` optimization](https://swc.rs/docs/configuration/supported-browsers), but it's still not perfect). However, why do we talk about the transpilers layer? The bundlers layer and tools like `webpack` or [`esbuild`](https://esbuild.github.io/) (that also contains an integrated transpiler) are more interesting for the optimization of polyfills. [Rome](https://rome.tools/) in development for several years and still is not ready, but its conception looks very promising.

One of the main problems with statical analysis-based automatic polyfilling on the transpiler layer is that usually not all files from the bundle are transpiled — for example, dependencies. If some of your dependencies need a polyfill of a modern built-in feature, but you don't use this built-in in your userland code, this polyfill will not be added to the bundle. Unnecessary polyfills import also will not be removed from your dependencies (see below). Moving automatic polyfilling to the bundlers layer fixes this problem.

Sure, writing or using such plugins in many places is difficult compared to Babel. For example, [without some extra tools now you can’t use plugins for custom transforms in TypeScript](https://github.com/microsoft/TypeScript/issues/14419). However, there are always options and there would be a desire.

Automatic polyfilling / optimization of `core-js` should be available not only in Babel. It's almost impossible to write and maintain plugins for all transpilers and bundlers in the scope of the `core-js` project, but it's possible to do those things:

- Improve provided by `core-js` data (`@core-js/compat`) and tools for integration with third-party projects, they should be comprehensive. For example, "built-in definitions" are still on Babel's side that causing problems with their reuse in other projects.
- Since some tools already provide `core-js` integration, makes sense to help them, not only Babel.
- Makes sense to write and maintain plugins for some significant tools in the scope of the `core-js` project. What? Will see.

### Polyfills collector

One of the problems of the statical analysis-based automatic polyfilling on the files layer (`usage` polyfilling mode of Babel `preset-env`) was explained above, but it's not the only problem. Let's talk about some others.

Your dependencies could have their own `core-js` dependencies and they can be incompatible with the `core-js` version that you use at the root of your project, so injecting `core-js` imports to your dependencies directly could cause breakage.

Projects often contain multiple entry points, multiple bundles, and, in some cases, the proper moving of all `core-js` modules to one chunk can be problematic and it could cause duplication of `core-js` in each bundle.

I already posted [the `core-js` usage statistics](https://gist.github.com/zloirock/7331cec2a1ba74feae09e64584ec5d0e) above. In many cases, you could see the duplication of `core-js` — and it's only on the first loaded page of the application. Sometimes it's even like what we see on the Bloomberg website:

<p align="center"><img alt="bloomberg" width="720" src="https://user-images.githubusercontent.com/2213682/218467140-c475482c-24b0-4420-b510-32f6e2a15743.png" /></p>

[Some time ago this number was even more.](https://user-images.githubusercontent.com/2213682/115339234-87e1f700-a1ce-11eb-853c-8b93b7fc5657.png) Of course, a such number of copies and various versions of `core-js` is not something typical, but a situation with some copies of `core-js` is too common and you could see it on about half of the websites with `core-js`, so for preventing this **required a way to collect all polyfills from all entry points, bundles and dependencies of the project in one place.**

Let's call a tool for this `@core-js/collector`. This tool should take an entry point or a list of entry points and should use the same statical analysis that's used in `preset-env`, however, this tool should not transform code or inject anything, should check full dependencies trees and should return a full list of required `core-js` modules. Require simple ways to integrate this into the current development stack. One of those ways can be a new polyfilling mode in plugins, let's call it `collected` — that will allow loading all collected polyfills of the application in one place and remove unnecessary (see below).

### Removing unnecessary third-party polyfills

Now it's typical to see, for example, a dozen copies of `Promise` polyfills with the same functionality on a website — you load only one `Promise` polyfill from `core-js`, but some of your dependencies load `Promise` polyfills by themself — `Promise` polyfill from one more `core-js` copy, `es6-promise`, `promise-polyfill`, `es6-promise-polyfill`, `native-promise-only`, etc. But it's just ES6 `Promise` which is already completely covered by `core-js` — and available in most browsers without polyfills. Sometimes, due to this, the size of all polyfills in the bundle swells to several megabytes.

It’s not an ideal illustration for this issue, many other examples would have been better, but since above we started to talk about the Bloomberg website, let’s take a look at this site one more time. We have no access to the source code, however, we have, for example, such an awesome tool as [`bundlescanner.com`](https://bundlescanner.com/website/bloomberg.com%2Feurope/all) (I hope that the Bloomberg team will fix it ASAP, so the result could be outdated).

<p align="center"><img alt="bundlescanner" width="720" src="https://user-images.githubusercontent.com/2213682/181242201-ec16dd17-f4dd-4706-abf5-36e764c72e22.png" /></p>

As shown in the practice, since such analysis it's not a simple work, this tool detects only about half of libraries' code. However, in addition to 4.5 hundred kilobytes of `core-js`, we see hundreds of kilobytes of other polyfills — many copies of `es6-promise`, `promise-polyfill`, `whatwg-fetch` ([for the above reason](#web-standards-polyfills), `core-js` *still* does not polyfill it), `string.prototype.codepointat`, `object-assign` (it's a *ponyfill* and about them the next section), `array-find-index`, etc.

But how many polyfills were not detected? What's the size of all polyfills that this website loads? It seems a couple of megabytes. However, even for *very* old browsers, maximally a hundred kilobytes more than be enough... And this situation is not something unique — it's a too common problem.

Since many of those polyfills contain just a subset of `core-js` functionality, in the scope of `@core-js/compat`, we could collect data that will show if a module is an unnecessary third-party polyfill or not and, if this functionality is contained in `core-js`, a transpiler or bundler plugin will remove the import of this module or will replace it to the import of suitable `core-js` modules.

The same approach could be applied to rid dependencies from old `core-js` versions.

### Globalization of pure version polyfills / ponyfills

One more popular and similar issue is a duplication of polyfills from global and pure `core-js` versions. The pure version of `core-js` / `babel-runtime` is intended for usage in libraries code, so it's a normal situation if you use a global version of `core-js` and your dependencies also load some copies of `core-js` without global namespace pollution. They use different internals and it's problematic to share similar code between them.

I’m thinking about resolving this issue on the transpiler or bundler plugins side similarly to the previous one (but, sure, a little more complex) — we could replace imports from the pure version with imports from the global version and remove polyfills unnecessary for the target engines.

That also could be applied to third-party ponyfills or obsolete libraries that implement something already available in the JS standard library. For example, usage of `has` package can be replaced by `Object.hasOwn`, `left-pad` by `String.prototype.padStart`, some `lodash` methods by related modern built-in JS methods, etc.

### Service

Loading the same polyfills, for example, in IE11, iOS Safari 14.8, and the latest Firefox is wrong — too much dead code will be loaded in modern browsers. At this moment, a popular pattern is a usage 2 bundles — for "modern" browsers that will be loaded if native modules are supported, `<script type="module">`, and for obsolete browsers which do not support native modules, `<script nomodule>` (a little harder in a practice). For example, Lighthouse can detect some cases of polyfills that are not required with the `esmodules` target, [let's check the long-suffering Bloomberg website](https://googlechrome.github.io/lighthouse/viewer/?psiurl=https%3A%2F%2Fwww.bloomberg.com%2Feurope&strategy=mobile&category=performance):

<p align="center"><img alt="lighthouse" width="720" src="https://user-images.githubusercontent.com/2213682/148652288-bd6e452a-f6ba-417d-8972-9d98d2f715a4.png" /></p>

Lighthouse shows just about 200KB in all resources, 0.56s. Let's remember that the site contains about a couple of megabytes of polyfills. [Now Lighthouse detects less than half of the features that it should](https://github.com/GoogleChrome/lighthouse/issues/13440), but even with another half, it's only a little part of all loaded polyfills. Where are the rest? Are they really required for a modern browser? The problem is that the lower bar of native modules support is too low — "modern" browsers, in this case, will need most of the polyfills of stable JS features that are required for old IE, so a part of polyfills is shown in the "unused JavaScript" section that takes 6.41s, a part is not shown at all...

From the very beginning of work on `core-js`, I'm thinking about creating a web service that gives only the polyfills that are needed for the requesting browser.

The availability of a such service is the only moment in which `core-js` have lagged behind another project. [`polyfill-service`](https://polyfill.io) project from Financial Times is based on this conception and it's a great service. The main problem with this project — it's a great service that uses bad polyfills. This project polyfill only a little part of ECMAScript features that `core-js` provides, the main part of polyfills are third-party and are not designed to work together, too many don’t properly follow specs, too raw or just dangerous for usage (for example, [`WeakMap` looks like a step-by-step implementation of the spec text](https://github.com/Financial-Times/polyfill-library/blob/554248173eae7554ef0a7776549d2901f02a7d51/polyfills/WeakMap/polyfill.js), but the absence of some non-spec magic cause memory leaking and linear access time that makes it harmful, more other — instead of patching, fixing and reusage of native implementation in engines like IE11 where it's available, but does not accept an iterable argument, [`WeakMap` will be completely replaced](https://github.com/Financial-Times/polyfill-library/blob/554248173eae7554ef0a7776549d2901f02a7d51/polyfills/WeakMap/detect.js)). Some good developers try to fix this from time to time, but polyfills themselves are given unforgivably little time, so it's still too far from something that could be recommended for usage.

Creating such a service in the proper form requires the creation and maintenance of many new components. I work on `core-js` alone, the project does not have the necessary support from any company, and the development is carried out with pure enthusiasm, I need to look for funds to feed myself and my family, so I have no time and other resources required for that. However, in the scope of other tasks, I already made some required components, and discussions with some users convinced me that creating a maximally simplified service that you could start on your own server could be enough.

We already have the best set of polyfills, the proper compatibility data, and the builder which already could create a bundle for a target browser. Already mentioned above `@core-js/collector` could be used for optimization — getting only the required subset of modules, plugins for transpilers / bundlers — for removing unnecessary polyfills. Missed a tool for the normalization of the user agent and a service that will bind those components together. Let's call it `@core-js/service`.

#### How should it look in the perfect world?

- You bundle your project. A plugin on the bundlers side removes all polyfills import (including third-party, without global pollution, from your dependencies, etc.). Your bundles will not contain any polyfills.
- You run `@core-js/service`. When you run it, `@core-js/collector` checks all your frontend codebase, all your entry points, including dependencies, and collects a list of all required polyfills.
- A user loads a page and requests a polyfill bundle from the service. The service gives the client a bundle compiled for the target browser that contains the required subset of polyfills and uses allowed syntax.

So, with this complex of tools, modern browsers will not load polyfills at all if they are not required, old browsers will load only required and maximally optimized polyfills.

---

Most of the above are about minimizing the size of polyfills sent to the client — but these are just a little subset of the concepts that it would be good to implement in the scope of `core-js`, however, I think that it's enough for understanding that still required a huge work and this work could significantly improve web development. Whether it will be implemented in practice and whether it will be available as FOSS or as a commercial project is up to you.

# Conclusion

This was the last attempt to keep `core-js` as a free open-source project with a proper quality and functionality level. It was the last attempt to convey that there are real people on the other side of open-source with families to feed and problems to solve.

If you or your company use `core-js` in one way or another and are interested in the quality of your supply chain, support the project:
- [**Open Collective**](https://opencollective.com/core-js)
- [**Patreon**](https://patreon.com/zloirock)
- **Bitcoin ( bc1qlea7544qtsmj2rayg0lthvza9fau63ux0fstcz )**

**Write me if you want to offer a good job on Web-standards and open-source.**

---

**Feel free to add comments to this post [here.](https://github.com/zloirock/core-js/issues/1179)**

**[Denis Pushkarev](https://github.com/zloirock), February 14th 2023**
