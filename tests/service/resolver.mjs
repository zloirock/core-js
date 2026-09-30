import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import createResolver from '../../packages/core-js-service/internals/domain/resolver.js';
import parseUserAgent from '../../packages/core-js-service/internals/infrastructure/ua-bowser.js';

const resolve = createResolver({ parseUserAgent });
// what these assertions are about is which engine and version a string identifies, so the pair is
// read back as `<engine> <version>` rather than spelled out at every one of them
function resolveUA(userAgent) {
  const target = resolve({ 'user-agent': userAgent });
  return target && `${ target.engine } ${ target.version }`;
}

const IOS_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 '
  + '(KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1';
// no `Version/` token: the browser writes its own instead
const IOS_CHROME = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 '
  + '(KHTML, like Gecko) CriOS/140.0.7339.100 Mobile/15E148 Safari/604.1';
const IOS_IN_APP = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 '
  + '(KHTML, like Gecko) Mobile/15E148 musical_ly_15.9.1 JsSdk/2.0 WKWebView/1';

// on iOS every browser is WKWebView, whatever it calls itself. the parsers answer `Chrome 140`
// here, and handing that to compat as real Chrome builds a bundle far thinner than WebKit needs - a
// broken page, not extra weight
strictEqual(resolveUA(IOS_CHROME), 'ios 18.7', 'resolver-5 #1');
strictEqual(resolveUA(IOS_SAFARI), 'ios 26.1', 'resolver-5 #2');

// the OS token is a lower bound, never a version - Apple froze it at 18_7 with iOS 26, so the live
// version lives in `Version/` alone. both cases above come out of this one rule: on a current device
// the token itself reads 18.7, on an old one it tells the truth
strictEqual(resolveUA(IOS_SAFARI.replace('Version/26.1 ', '')), 'ios 18.7', 'resolver-2 #1');
// and neither signal is taken on trust, because a string an app assembles itself is whatever the app
// wrote. `Version/` is WebKit's only where Safari writes it, straight after `(KHTML, like Gecko)` -
// a browser that writes one of its own puts it elsewhere. Without that, Edge's `Version/18.0` would
// be read as the WebKit of an iOS 17 device
strictEqual(resolveUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 '
  + '(KHTML, like Gecko) EdgiOS/150.0.3179.54 Version/18.0 Mobile/15E148 Safari/604.1'), 'ios 17.5', 'resolver-2 #2');
strictEqual(resolveUA('Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 '
  + '(KHTML, like Gecko) Mobile/15E148 YaBrowser/26.6.2.732.10 Safari/604.1 SA/3 Version/26.5'), 'ios 18.7', 'resolver-2 #3');
// and the OS token is a lower bound only where it is one of the values WebKit writes in place of the
// OS - `18_6`, `18_6_2`, `18_7`. Any other value is the OS itself, and on iOS the OS is the WebKit:
// a Safari-shaped `Version/` above it was not written by that WebKit
strictEqual(resolveUA(IOS_SAFARI.replace('18_7', '18_7_8').replace('26.1', '26.0')), 'ios 18.7.8', 'resolver-2 #4');
strictEqual(resolveUA(IOS_SAFARI.replace('18_7', '18_6')), 'ios 26.1', 'resolver-2 #5');
strictEqual(resolveUA(IOS_SAFARI.replace('18_7', '18_6_2')), 'ios 26.1', 'resolver-2 #6');
// Firefox writes `18_7` as a literal from 147 on, on every device down to iOS 15 - there the token
// is not a lower bound, it is not a signal at all, and the string carries nothing else
const IOS_FIREFOX = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 '
  + '(KHTML, like Gecko) FxiOS/147.0 Mobile/15E148 Safari/604.1';

strictEqual(resolveUA(IOS_FIREFOX), null, 'resolver-4 #3');
strictEqual(resolveUA(IOS_FIREFOX.replace('iPhone; CPU iPhone OS', 'iPad; CPU OS')), null, 'resolver-4 #4');
// before 147 it wrote the device's own version, which is the OS and so the WebKit
strictEqual(resolveUA(IOS_FIREFOX.replace('18_7', '16_7_10').replace('147.0', '146.1')), 'ios 16.7.10', 'resolver-4 #5');

// an app that assembles its own string may report the OS it read from the system beside the frozen
// token - and that is the OS itself, so the lower bound is not the answer there
const IOS_INSTAGRAM = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) '
  + 'Mobile/23G83 Instagram 423.1.0.30.69 (iPhone13,2; iOS 26_6_1; en_GB; en-GB; scale=3.00; 1170x2532; IABMV/1; '
  + '924167814) Safari/604.1';
const IOS_FACEBOOK = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) '
  + 'Mobile/22H217 Safari/604.1 [FBAN/FBIOS;FBAV/555.0.0.36.63;FBBV/923840166;FBDV/iPhone11,8;FBMD/iPhone;FBSN/iOS;'
  + 'FBSV/18.7.3;FBSS/2;FBID/phone;FBLC/en_GB;FBOP/5;FBRV/944867043;IABMV/1];FBNV/1';

strictEqual(resolveUA(IOS_INSTAGRAM), 'ios 26.6.1', 'resolver-6 #3');
strictEqual(resolveUA(IOS_FACEBOOK), 'ios 18.7.3', 'resolver-6 #4');
// the same segment on an iPad, whose model the app writes the same way
strictEqual(resolveUA(IOS_INSTAGRAM.replace('iPhone; CPU iPhone OS', 'iPad; CPU OS').replace('iPhone13,2', 'iPad13,4')),
  'ios 26.6.1', 'resolver-6 #5');
// and a report is an upper bound as much as an answer: where the string says two things about the
// OS, the lower one is the answer, because only the lower one cannot be above the truth
strictEqual(resolveUA(IOS_SAFARI.replace('Safari/604.1', 'Safari/604.1 [FBAN/FBIOS;FBSV/18.7.3]')), 'ios 18.7.3', 'resolver-6 #6');
strictEqual(resolveUA(IOS_FACEBOOK.replace('18_7', '17_5')), 'ios 17.5', 'resolver-6 #7');
strictEqual(resolveUA(IOS_FACEBOOK.replace('18_7', '26_1').replace('18.7.3', '26.0.1')), 'ios 26.0.1', 'resolver-6 #8');
// `iOS` inside a name of an app's own is not that segment: it has to sit behind a device model
strictEqual(resolveUA(IOS_IN_APP.replace('WKWebView/1', 'GNews iOS/5.104')), 'ios 13.3.1', 'resolver-6 #9');

// an in-app WKWebView carries no `Version/` at all. the OS token is all there is, and building a
// version up from it would hand a thin bundle to what may be an old engine
strictEqual(resolveUA(IOS_IN_APP), 'ios 13.3.1', 'resolver-4 #1');

// the engines the compat data counts separately on Android
const CHROME_DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/143.0.0.0 Safari/537.36';

strictEqual(resolveUA(CHROME_DESKTOP), 'chrome 143.0.0.0', 'resolver #1');
strictEqual(resolveUA('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/143.0.0.0 Mobile Safari/537.36'), 'chrome-android 143.0.0.0', 'resolver #2');
strictEqual(resolveUA('Mozilla/5.0 (Android 14; Mobile; rv:140.0) Gecko/140.0 Firefox/140.0'),
  'firefox-android 140.0', 'resolver #3');
strictEqual(resolveUA('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/140.0.0.0 Mobile Safari/537.36 OPR/95.0.0.0'), 'opera-android 95.0.0.0', 'resolver #4');
strictEqual(resolveUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'), 'edge 143.0.0.0', 'resolver #5');
strictEqual(resolveUA('Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S928B) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) SamsungBrowser/28.0 Chrome/136.0.0.0 Mobile Safari/537.36'),
'samsung 28.0', 'resolver #6');
strictEqual(resolveUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 '
  + '(KHTML, like Gecko) Version/26.2 Safari/605.1.15'), 'safari 26.2', 'resolver #7');
strictEqual(resolveUA('Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko'),
  'ie 11.0', 'resolver #8');

// the Quest UA ends in `SamsungBrowser/4.0`, which a parser that does not know the headset reads
// as Samsung Internet 4.0 - a decade-old engine for a current device
strictEqual(resolveUA('Mozilla/5.0 (X11; Linux x86_64; Quest 3) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'OculusBrowser/39.0.0.0.0 SamsungBrowser/4.0 Chrome/136.0.0.0 VR Safari/537.36'),
'quest 39.0.0.0.0', 'resolver #9');

// a Chromium build under a name of its own - an in-app Android WebView, a derivative browser. the
// `Chrome/` token is the engine's own version, so it outweighs the name we did not recognize
strictEqual(resolveUA('Mozilla/5.0 (Linux; Android 14; SM-A155F Build/UP1A) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Version/4.0 Chrome/139.0.7258.158 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/500.0.0.42.76;]'),
'chrome-android 139.0.7258.158', 'resolver #10');
strictEqual(resolveUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
  + 'Chrome/128.0.0.0 YaBrowser/24.10.0 Safari/537.36'), 'chrome 128.0.0.0', 'resolver #11');
// LG spells the token `Chr0me/` on its televisions, and it is the Chromium the set runs all the same
const LG_WEBOS = 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chr0me/87.0.4280.88 '
  + 'Safari/537.36 LG Browser/8.00.00(LGE; 0V50500; 04.41.33; 0x00000001; DTV_C22P); webOS.TV-2022; '
  + 'LG NetCast.TV-2013 Compatible (LGE, 0V50500, wireless)';

strictEqual(resolveUA(LG_WEBOS), 'chrome 87.0.4280.88', 'resolver #12');
strictEqual(resolveUA(LG_WEBOS.replace('Chr0me/87.0.4280.88', 'QtWebEngine/5.2.1 Chr0me/38.0.2125.122')),
  'chrome 38.0.2125.122', 'resolver #13');
// and only that spelling: a token that merely ends in the word is not the engine's
strictEqual(resolveUA(LG_WEBOS.replace('Chr0me/', 'XChr0me/')), null, 'resolver #14');

// Goanna is an engine of its own - forked from the Gecko of Firefox 52 and backported to since -
// and the compat data has no row for it. The `Firefox/68.9` beside it is a compatibility claim, and
// read as Firefox it hands a thin bundle to an engine that is not that Firefox - Mypal is what
// Windows XP runs today
const GOANNA = 'Mozilla/5.0 (Windows NT 6.2; Win64; x64; rv:68.9) Gecko/20100101 Goanna/4.5 Firefox/68.9 Mypal/28.9.0';

strictEqual(resolveUA(GOANNA), null, 'resolver-6 #10');
strictEqual(resolveUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:60.9) Gecko/20100101 Goanna/4.4 Firefox/60.9 '
  + 'Basilisk/20190912'), null, 'resolver-6 #11');
// a Gecko browser under a name nothing knows still carries the engine's own version in `rv:`, the
// way a Chromium carries its token - and on Android the row is the mobile one
strictEqual(resolveUA('Mozilla/5.0 (X11; Linux x86_64; rv:115.0) Gecko/20100101 MullvadBrowser/115.8.0'),
  'firefox 115.0', 'resolver-6 #13');
strictEqual(resolveUA('Mozilla/5.0 (Android 10; Mobile VR; rv:105.0) Gecko/105.0 Wolvic/1.2'),
  'firefox-android 105.0', 'resolver-6 #14');
strictEqual(resolveUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0 SeaMonkey/2.53.9'),
  'firefox 60.0', 'resolver-6 #15');
// but only beside a `Gecko/` token Gecko could have written - its build date or its version.
// `Gecko/2000000000` is neither, and the `rv:12.3` in front of it sits on an Iceape 1.1.5, a Gecko
// 1.8 - the string was rewritten, and nothing in it says which engine is underneath
strictEqual(resolveUA('Mozilla/5.0 (X11; Linux i686; en; rv:12.3) Gecko/2000000000 Iceape/1.1.5 '
  + '(Ubuntu-1.1.5-1ubuntu0.7.10)'), null, 'resolver-6 #16');
// and the `like Gecko` of Internet Explorer 11 is no Gecko token at all
strictEqual(resolveUA('Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko'), 'ie 11.0', 'resolver-6 #17');

// and a Firefox is still a Firefox: the rule is the token, not the `rv:` or the name
strictEqual(resolveUA(GOANNA.replace(' Goanna/4.5', '').replace(' Mypal/28.9.0', '')), 'firefox 68.9', 'resolver-6 #12');

// every failure to identify leads to the baseline, never past it. a confident wrong answer costs a
// missing module; "I do not know" costs a few kilobytes
strictEqual(resolveUA('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'),
  null, 'resolver-1 #1');
strictEqual(resolveUA('x'), null, 'resolver-1 #2');
// bowser throws on an empty user agent, which is a visitor, not an incident
strictEqual(resolveUA(''), null, 'resolver-1 #3');
strictEqual(resolve({}), null, 'resolver-1 #4');

// the OS token is read out of the string, so what it matches has to be the token and not a word that
// ends in one: `KaiOS/1.0` carries `iOS/1.0` inside it, and a phone running Gecko would be answered
// with a WebKit version. the parser is a port, so the case can be built rather than waited for
const onKaiOS = createResolver({
  parseUserAgent: () => ({ browser: { name: 'Firefox', version: '37.0' }, os: { name: 'iOS', version: null } }),
});

deepStrictEqual(onKaiOS({ 'user-agent': 'Mozilla/5.0 (Mobile; ALCATEL4044T; rv:37.0) Gecko/37.0 Firefox/37.0 KaiOS/1.0' }),
  { engine: 'firefox', version: '37.0' }, 'resolver-6 #1');
// and a real iOS string still resolves through the same branch
const onIOS = createResolver({
  parseUserAgent: () => ({ browser: { name: 'Safari', version: null }, os: { name: 'iOS', version: null } }),
});

deepStrictEqual(onIOS({ 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13.3.1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)' }),
  { engine: 'ios', version: '13.3.1' }, 'resolver-6 #2');

strictEqual(resolve(undefined), null, 'resolver-1 #5');

// the same rule on the size of what the visitor wrote. the string goes into a parser with three
// dozen patterns and this runs once per HTML response, so past the bound it is not read - the same
// answer as any other failure to identify, and it leads to the same baseline
strictEqual(resolveUA(CHROME_DESKTOP + 'x'.repeat(2000)), null, 'resolver-1 #7');
// and a user agent of an ordinary length is still read - real ones are far below the bound
strictEqual(resolveUA(`${ CHROME_DESKTOP } ${ 'x'.repeat(700) }`), 'chrome 143.0.0.0', 'resolver-1 #8');

// the parser is raw material, not the answer: whatever it fails to say, the resolver says nothing
const blind = createResolver({ parseUserAgent: () => null });
const nameless = createResolver({
  parseUserAgent: () => ({ browser: { name: 'Chrome', version: null }, os: { name: 'Windows', version: null } }),
});

strictEqual(blind({ 'user-agent': IOS_SAFARI }), null, 'resolver-1 #6');
strictEqual(nameless({ 'user-agent': 'whatever' }), null, 'resolver-4 #2');
