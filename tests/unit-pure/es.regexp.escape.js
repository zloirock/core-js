/* eslint-disable @stylistic/max-len -- ok*/
import escape from '@core-js/pure/es/regexp/escape';

QUnit.test('RegExp.escape', assert => {
  assert.isFunction(escape);
  assert.arity(escape, 1);
  assert.name(escape, 'escape');

  assert.same(escape('10$'), '\\x310\\$', '10$');
  assert.same(escape('abcdefg_123456'), '\\x61bcdefg_123456', 'abcdefg_123456');
  assert.same(escape('Привет'), 'Привет', 'Привет');
  assert.same(
    escape('(){}[]|,.?*+-^$=<>\\/#&!%:;@~\'"`'),
    '\\(\\)\\{\\}\\[\\]\\|\\x2c\\.\\?\\*\\+\\x2d\\^\\$\\x3d\\x3c\\x3e\\\\\\/\\x23\\x26\\x21\\x25\\x3a\\x3b\\x40\\x7e\\x27\\x22\\x60',
    '(){}[]|,.?*+-^$=<>\\/#&!%:;@~\'"`',
  );
  assert.same(
    escape('\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF'),
    '\\t\\n\\v\\f\\r\\x20\\xa0\\u1680\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000\\u2028\\u2029\\ufeff',
    'whitespaces and control',
  );

  assert.same(escape('💩'), '💩', '💩');
  assert.same(escape('\uD83D'), '\\ud83d', '\\ud83d');
  assert.same(escape('\uDCA9'), '\\udca9', '\\udca9');
  assert.same(escape('\uDCA9\uD83D'), '\\udca9\\ud83d', '\\udca9\\ud83d');

  assert.throws(() => escape(42), TypeError, 'throws on non-string #1');
  assert.throws(() => escape({}), TypeError, 'throws on non-string #2');

  // Test262
  // Copyright 2024 Leo Balter. All rights reserved.
  // This code is governed by the BSD license found in the https://github.com/tc39/test262/blob/main/LICENSE file.
  assert.same(escape('\u2028'), '\\u2028', 'line terminator \\u2028 is escaped correctly to \\\\u2028');
  assert.same(escape('\u2029'), '\\u2029', 'line terminator \\u2029 is escaped correctly to \\\\u2029');
  assert.same(escape('\u2028\u2029'), '\\u2028\\u2029', 'line terminators are escaped correctly');
  assert.same(escape('\u2028a\u2029a'), '\\u2028a\\u2029a', 'mixed line terminators are escaped correctly');

  assert.same(escape('.a/b'), '\\.a\\/b', 'mixed string with solidus character is escaped correctly');
  assert.same(escape('/./'), '\\/\\.\\/', 'solidus character is escaped correctly - regexp similar');
  assert.same(escape('./a\\/*b+c?d^e$f|g{2}h[i]j\\k'), '\\.\\/a\\\\\\/\\*b\\+c\\?d\\^e\\$f\\|g\\{2\\}h\\[i\\]j\\\\k', 'complex string with multiple special characters is escaped correctly');

  assert.same(escape('/'), '\\/', 'solidus character is escaped correctly');
  assert.same(escape('//'), '\\/\\/', 'solidus character is escaped correctly - multiple occurrences 1');
  assert.same(escape('///'), '\\/\\/\\/', 'solidus character is escaped correctly - multiple occurrences 2');
  assert.same(escape('////'), '\\/\\/\\/\\/', 'solidus character is escaped correctly - multiple occurrences 3');

  assert.same(escape('.'), '\\.', 'dot character is escaped correctly');
  assert.same(escape('*'), '\\*', 'asterisk character is escaped correctly');
  assert.same(escape('+'), '\\+', 'plus character is escaped correctly');
  assert.same(escape('?'), '\\?', 'question mark character is escaped correctly');
  assert.same(escape('^'), '\\^', 'caret character is escaped correctly');
  assert.same(escape('$'), '\\$', 'dollar character is escaped correctly');
  assert.same(escape('|'), '\\|', 'pipe character is escaped correctly');
  assert.same(escape('('), '\\(', 'open parenthesis character is escaped correctly');
  assert.same(escape(')'), '\\)', 'close parenthesis character is escaped correctly');
  assert.same(escape('['), '\\[', 'open bracket character is escaped correctly');
  assert.same(escape(']'), '\\]', 'close bracket character is escaped correctly');
  assert.same(escape('{'), '\\{', 'open brace character is escaped correctly');
  assert.same(escape('}'), '\\}', 'close brace character is escaped correctly');
  assert.same(escape('\\'), '\\\\', 'backslash character is escaped correctly');

  const codePoints = String.fromCharCode(0x100, 0x200, 0x300);
  assert.same(escape(codePoints), codePoints, 'characters are correctly not escaped');

  assert.same(escape('你好'), '你好', 'Chinese characters are correctly not escaped');
  assert.same(escape('こんにちは'), 'こんにちは', 'Japanese characters are correctly not escaped');
  assert.same(escape('안녕하세요'), '안녕하세요', 'Korean characters are correctly not escaped');
  assert.same(escape('Привет'), 'Привет', 'Cyrillic characters are correctly not escaped');
  assert.same(escape('مرحبا'), 'مرحبا', 'Arabic characters are correctly not escaped');
  assert.same(escape('हेलो'), 'हेलो', 'Devanagari characters are correctly not escaped');
  assert.same(escape('Γειά σου'), 'Γειά\\x20σου', 'Greek characters are correctly not escaped');
  assert.same(escape('שלום'), 'שלום', 'Hebrew characters are correctly not escaped');
  assert.same(escape('สวัสดี'), 'สวัสดี', 'Thai characters are correctly not escaped');
  assert.same(escape('नमस्ते'), 'नमस्ते', 'Hindi characters are correctly not escaped');
  assert.same(escape('ሰላም'), 'ሰላም', 'Amharic characters are correctly not escaped');
  assert.same(escape('हैलो'), 'हैलो', 'Hindi characters with diacritics are correctly not escaped');
  assert.same(escape('안녕!'), '안녕\\x21', 'Korean character with special character is correctly escaped');
  assert.same(escape('.hello\uD7FFworld'), '\\.hello\uD7FFworld', 'Mixed ASCII and Unicode characters are correctly escaped');

  assert.same(escape('\uFEFF'), '\\ufeff', 'whitespace \\uFEFF is escaped correctly to \\uFEFF');
  assert.same(escape('\u0020'), '\\x20', 'whitespace \\u0020 is escaped correctly to \\x20');
  assert.same(escape('\u00A0'), '\\xa0', 'whitespace \\u00A0 is escaped correctly to \\xA0');
  assert.same(escape('\u202F'), '\\u202f', 'whitespace \\u202F is escaped correctly to \\u202F');
  assert.same(escape('\u0009'), '\\t', 'whitespace \\u0009 is escaped correctly to \\t');
  assert.same(escape('\u000B'), '\\v', 'whitespace \\u000B is escaped correctly to \\v');
  assert.same(escape('\u000C'), '\\f', 'whitespace \\u000C is escaped correctly to \\f');
  assert.same(escape('\uFEFF\u0020\u00A0\u202F\u0009\u000B\u000C'), '\\ufeff\\x20\\xa0\\u202f\\t\\v\\f', 'whitespaces are escaped correctly');

  // Escaping initial digits
  assert.same(escape('1111'), '\\x31111', 'Initial decimal digit 1 is escaped');
  assert.same(escape('2222'), '\\x32222', 'Initial decimal digit 2 is escaped');
  assert.same(escape('3333'), '\\x33333', 'Initial decimal digit 3 is escaped');
  assert.same(escape('4444'), '\\x34444', 'Initial decimal digit 4 is escaped');
  assert.same(escape('5555'), '\\x35555', 'Initial decimal digit 5 is escaped');
  assert.same(escape('6666'), '\\x36666', 'Initial decimal digit 6 is escaped');
  assert.same(escape('7777'), '\\x37777', 'Initial decimal digit 7 is escaped');
  assert.same(escape('8888'), '\\x38888', 'Initial decimal digit 8 is escaped');
  assert.same(escape('9999'), '\\x39999', 'Initial decimal digit 9 is escaped');
  assert.same(escape('0000'), '\\x30000', 'Initial decimal digit 0 is escaped');

  // Escaping initial ASCII letters
  assert.same(escape('aaa'), '\\x61aa', 'Initial ASCII letter a is escaped');
  assert.same(escape('bbb'), '\\x62bb', 'Initial ASCII letter b is escaped');
  assert.same(escape('ccc'), '\\x63cc', 'Initial ASCII letter c is escaped');
  assert.same(escape('ddd'), '\\x64dd', 'Initial ASCII letter d is escaped');
  assert.same(escape('eee'), '\\x65ee', 'Initial ASCII letter e is escaped');
  assert.same(escape('fff'), '\\x66ff', 'Initial ASCII letter f is escaped');
  assert.same(escape('ggg'), '\\x67gg', 'Initial ASCII letter g is escaped');
  assert.same(escape('hhh'), '\\x68hh', 'Initial ASCII letter h is escaped');
  assert.same(escape('iii'), '\\x69ii', 'Initial ASCII letter i is escaped');
  assert.same(escape('jjj'), '\\x6ajj', 'Initial ASCII letter j is escaped');
  assert.same(escape('kkk'), '\\x6bkk', 'Initial ASCII letter k is escaped');
  assert.same(escape('lll'), '\\x6cll', 'Initial ASCII letter l is escaped');
  assert.same(escape('mmm'), '\\x6dmm', 'Initial ASCII letter m is escaped');
  assert.same(escape('nnn'), '\\x6enn', 'Initial ASCII letter n is escaped');
  assert.same(escape('ooo'), '\\x6foo', 'Initial ASCII letter o is escaped');
  assert.same(escape('ppp'), '\\x70pp', 'Initial ASCII letter p is escaped');
  assert.same(escape('qqq'), '\\x71qq', 'Initial ASCII letter q is escaped');
  assert.same(escape('rrr'), '\\x72rr', 'Initial ASCII letter r is escaped');
  assert.same(escape('sss'), '\\x73ss', 'Initial ASCII letter s is escaped');
  assert.same(escape('ttt'), '\\x74tt', 'Initial ASCII letter t is escaped');
  assert.same(escape('uuu'), '\\x75uu', 'Initial ASCII letter u is escaped');
  assert.same(escape('vvv'), '\\x76vv', 'Initial ASCII letter v is escaped');
  assert.same(escape('www'), '\\x77ww', 'Initial ASCII letter w is escaped');
  assert.same(escape('xxx'), '\\x78xx', 'Initial ASCII letter x is escaped');
  assert.same(escape('yyy'), '\\x79yy', 'Initial ASCII letter y is escaped');
  assert.same(escape('zzz'), '\\x7azz', 'Initial ASCII letter z is escaped');
  assert.same(escape('AAA'), '\\x41AA', 'Initial ASCII letter A is escaped');
  assert.same(escape('BBB'), '\\x42BB', 'Initial ASCII letter B is escaped');
  assert.same(escape('CCC'), '\\x43CC', 'Initial ASCII letter C is escaped');
  assert.same(escape('DDD'), '\\x44DD', 'Initial ASCII letter D is escaped');
  assert.same(escape('EEE'), '\\x45EE', 'Initial ASCII letter E is escaped');
  assert.same(escape('FFF'), '\\x46FF', 'Initial ASCII letter F is escaped');
  assert.same(escape('GGG'), '\\x47GG', 'Initial ASCII letter G is escaped');
  assert.same(escape('HHH'), '\\x48HH', 'Initial ASCII letter H is escaped');
  assert.same(escape('III'), '\\x49II', 'Initial ASCII letter I is escaped');
  assert.same(escape('JJJ'), '\\x4aJJ', 'Initial ASCII letter J is escaped');
  assert.same(escape('KKK'), '\\x4bKK', 'Initial ASCII letter K is escaped');
  assert.same(escape('LLL'), '\\x4cLL', 'Initial ASCII letter L is escaped');
  assert.same(escape('MMM'), '\\x4dMM', 'Initial ASCII letter M is escaped');
  assert.same(escape('NNN'), '\\x4eNN', 'Initial ASCII letter N is escaped');
  assert.same(escape('OOO'), '\\x4fOO', 'Initial ASCII letter O is escaped');
  assert.same(escape('PPP'), '\\x50PP', 'Initial ASCII letter P is escaped');
  assert.same(escape('QQQ'), '\\x51QQ', 'Initial ASCII letter Q is escaped');
  assert.same(escape('RRR'), '\\x52RR', 'Initial ASCII letter R is escaped');
  assert.same(escape('SSS'), '\\x53SS', 'Initial ASCII letter S is escaped');
  assert.same(escape('TTT'), '\\x54TT', 'Initial ASCII letter T is escaped');
  assert.same(escape('UUU'), '\\x55UU', 'Initial ASCII letter U is escaped');
  assert.same(escape('VVV'), '\\x56VV', 'Initial ASCII letter V is escaped');
  assert.same(escape('WWW'), '\\x57WW', 'Initial ASCII letter W is escaped');
  assert.same(escape('XXX'), '\\x58XX', 'Initial ASCII letter X is escaped');
  assert.same(escape('YYY'), '\\x59YY', 'Initial ASCII letter Y is escaped');
  assert.same(escape('ZZZ'), '\\x5aZZ', 'Initial ASCII letter Z is escaped');

  // Mixed case with special characters
  assert.same(escape('1+1'), '\\x31\\+1', 'Initial decimal digit 1 with special character is escaped');
  assert.same(escape('2+2'), '\\x32\\+2', 'Initial decimal digit 2 with special character is escaped');
  assert.same(escape('3+3'), '\\x33\\+3', 'Initial decimal digit 3 with special character is escaped');
  assert.same(escape('4+4'), '\\x34\\+4', 'Initial decimal digit 4 with special character is escaped');
  assert.same(escape('5+5'), '\\x35\\+5', 'Initial decimal digit 5 with special character is escaped');
  assert.same(escape('6+6'), '\\x36\\+6', 'Initial decimal digit 6 with special character is escaped');
  assert.same(escape('7+7'), '\\x37\\+7', 'Initial decimal digit 7 with special character is escaped');
  assert.same(escape('8+8'), '\\x38\\+8', 'Initial decimal digit 8 with special character is escaped');
  assert.same(escape('9+9'), '\\x39\\+9', 'Initial decimal digit 9 with special character is escaped');
  assert.same(escape('0+0'), '\\x30\\+0', 'Initial decimal digit 0 with special character is escaped');

  assert.same(escape('a*a'), '\\x61\\*a', 'Initial ASCII letter a with special character is escaped');
  assert.same(escape('b*b'), '\\x62\\*b', 'Initial ASCII letter b with special character is escaped');
  assert.same(escape('c*c'), '\\x63\\*c', 'Initial ASCII letter c with special character is escaped');
  assert.same(escape('d*d'), '\\x64\\*d', 'Initial ASCII letter d with special character is escaped');
  assert.same(escape('e*e'), '\\x65\\*e', 'Initial ASCII letter e with special character is escaped');
  assert.same(escape('f*f'), '\\x66\\*f', 'Initial ASCII letter f with special character is escaped');
  assert.same(escape('g*g'), '\\x67\\*g', 'Initial ASCII letter g with special character is escaped');
  assert.same(escape('h*h'), '\\x68\\*h', 'Initial ASCII letter h with special character is escaped');
  assert.same(escape('i*i'), '\\x69\\*i', 'Initial ASCII letter i with special character is escaped');
  assert.same(escape('j*j'), '\\x6a\\*j', 'Initial ASCII letter j with special character is escaped');
  assert.same(escape('k*k'), '\\x6b\\*k', 'Initial ASCII letter k with special character is escaped');
  assert.same(escape('l*l'), '\\x6c\\*l', 'Initial ASCII letter l with special character is escaped');
  assert.same(escape('m*m'), '\\x6d\\*m', 'Initial ASCII letter m with special character is escaped');
  assert.same(escape('n*n'), '\\x6e\\*n', 'Initial ASCII letter n with special character is escaped');
  assert.same(escape('o*o'), '\\x6f\\*o', 'Initial ASCII letter o with special character is escaped');
  assert.same(escape('p*p'), '\\x70\\*p', 'Initial ASCII letter p with special character is escaped');
  assert.same(escape('q*q'), '\\x71\\*q', 'Initial ASCII letter q with special character is escaped');
  assert.same(escape('r*r'), '\\x72\\*r', 'Initial ASCII letter r with special character is escaped');
  assert.same(escape('s*s'), '\\x73\\*s', 'Initial ASCII letter s with special character is escaped');
  assert.same(escape('t*t'), '\\x74\\*t', 'Initial ASCII letter t with special character is escaped');
  assert.same(escape('u*u'), '\\x75\\*u', 'Initial ASCII letter u with special character is escaped');
  assert.same(escape('v*v'), '\\x76\\*v', 'Initial ASCII letter v with special character is escaped');
  assert.same(escape('w*w'), '\\x77\\*w', 'Initial ASCII letter w with special character is escaped');
  assert.same(escape('x*x'), '\\x78\\*x', 'Initial ASCII letter x with special character is escaped');
  assert.same(escape('y*y'), '\\x79\\*y', 'Initial ASCII letter y with special character is escaped');
  assert.same(escape('z*z'), '\\x7a\\*z', 'Initial ASCII letter z with special character is escaped');
  assert.same(escape('A*A'), '\\x41\\*A', 'Initial ASCII letter A with special character is escaped');
  assert.same(escape('B*B'), '\\x42\\*B', 'Initial ASCII letter B with special character is escaped');
  assert.same(escape('C*C'), '\\x43\\*C', 'Initial ASCII letter C with special character is escaped');
  assert.same(escape('D*D'), '\\x44\\*D', 'Initial ASCII letter D with special character is escaped');
  assert.same(escape('E*E'), '\\x45\\*E', 'Initial ASCII letter E with special character is escaped');
  assert.same(escape('F*F'), '\\x46\\*F', 'Initial ASCII letter F with special character is escaped');
  assert.same(escape('G*G'), '\\x47\\*G', 'Initial ASCII letter G with special character is escaped');
  assert.same(escape('H*H'), '\\x48\\*H', 'Initial ASCII letter H with special character is escaped');
  assert.same(escape('I*I'), '\\x49\\*I', 'Initial ASCII letter I with special character is escaped');
  assert.same(escape('J*J'), '\\x4a\\*J', 'Initial ASCII letter J with special character is escaped');
  assert.same(escape('K*K'), '\\x4b\\*K', 'Initial ASCII letter K with special character is escaped');
  assert.same(escape('L*L'), '\\x4c\\*L', 'Initial ASCII letter L with special character is escaped');
  assert.same(escape('M*M'), '\\x4d\\*M', 'Initial ASCII letter M with special character is escaped');
  assert.same(escape('N*N'), '\\x4e\\*N', 'Initial ASCII letter N with special character is escaped');
  assert.same(escape('O*O'), '\\x4f\\*O', 'Initial ASCII letter O with special character is escaped');
  assert.same(escape('P*P'), '\\x50\\*P', 'Initial ASCII letter P with special character is escaped');
  assert.same(escape('Q*Q'), '\\x51\\*Q', 'Initial ASCII letter Q with special character is escaped');
  assert.same(escape('R*R'), '\\x52\\*R', 'Initial ASCII letter R with special character is escaped');
  assert.same(escape('S*S'), '\\x53\\*S', 'Initial ASCII letter S with special character is escaped');
  assert.same(escape('T*T'), '\\x54\\*T', 'Initial ASCII letter T with special character is escaped');
  assert.same(escape('U*U'), '\\x55\\*U', 'Initial ASCII letter U with special character is escaped');
  assert.same(escape('V*V'), '\\x56\\*V', 'Initial ASCII letter V with special character is escaped');
  assert.same(escape('W*W'), '\\x57\\*W', 'Initial ASCII letter W with special character is escaped');
  assert.same(escape('X*X'), '\\x58\\*X', 'Initial ASCII letter X with special character is escaped');
  assert.same(escape('Y*Y'), '\\x59\\*Y', 'Initial ASCII letter Y with special character is escaped');
  assert.same(escape('Z*Z'), '\\x5a\\*Z', 'Initial ASCII letter Z with special character is escaped');

  assert.same(escape('_'), '_', 'Single underscore character is not escaped');
  assert.same(escape('__'), '__', 'Thunderscore character is not escaped');
  assert.same(escape('hello_world'), '\\x68ello_world', 'String starting with ASCII letter and containing underscore is not escaped');
  assert.same(escape('1_hello_world'), '\\x31_hello_world', 'String starting with digit and containing underscore is correctly escaped');
  assert.same(escape('a_b_c'), '\\x61_b_c', 'String starting with ASCII letter and containing multiple underscores is correctly escaped');
  assert.same(escape('3_b_4'), '\\x33_b_4', 'String starting with digit and containing multiple underscores is correctly escaped');
  assert.same(escape('_hello'), '_hello', 'String starting with underscore and containing other characters is not escaped');
  assert.same(escape('_1hello'), '_1hello', 'String starting with underscore and digit is not escaped');
  assert.same(escape('_a_1_2'), '_a_1_2', 'String starting with underscore and mixed characters is not escaped');

  // Specific surrogate points
  assert.same(escape('\uD800'), '\\ud800', 'High surrogate \\uD800 is correctly escaped');
  assert.same(escape('\uDBFF'), '\\udbff', 'High surrogate \\uDBFF is correctly escaped');
  assert.same(escape('\uDC00'), '\\udc00', 'Low surrogate \\uDC00 is correctly escaped');
  assert.same(escape('\uDFFF'), '\\udfff', 'Low surrogate \\uDFFF is correctly escaped');

  // Leading Surrogates
  const highSurrogatesGroup1 = '\uD800\uD801\uD802\uD803\uD804\uD805\uD806\uD807\uD808\uD809\uD80A\uD80B\uD80C\uD80D\uD80E\uD80F';
  const highSurrogatesGroup2 = '\uD810\uD811\uD812\uD813\uD814\uD815\uD816\uD817\uD818\uD819\uD81A\uD81B\uD81C\uD81D\uD81E\uD81F';
  const highSurrogatesGroup3 = '\uD820\uD821\uD822\uD823\uD824\uD825\uD826\uD827\uD828\uD829\uD82A\uD82B\uD82C\uD82D\uD82E\uD82F';
  const highSurrogatesGroup4 = '\uD830\uD831\uD832\uD833\uD834\uD835\uD836\uD837\uD838\uD839\uD83A\uD83B\uD83C\uD83D\uD83E\uD83F';
  const highSurrogatesGroup5 = '\uD840\uD841\uD842\uD843\uD844\uD845\uD846\uD847\uD848\uD849\uD84A\uD84B\uD84C\uD84D\uD84E\uD84F';
  const highSurrogatesGroup6 = '\uD850\uD851\uD852\uD853\uD854\uD855\uD856\uD857\uD858\uD859\uD85A\uD85B\uD85C\uD85D\uD85E\uD85F';
  const highSurrogatesGroup7 = '\uD860\uD861\uD862\uD863\uD864\uD865\uD866\uD867\uD868\uD869\uD86A\uD86B\uD86C\uD86D\uD86E\uD86F';
  const highSurrogatesGroup8 = '\uD870\uD871\uD872\uD873\uD874\uD875\uD876\uD877\uD878\uD879\uD87A\uD87B\uD87C\uD87D\uD87E\uD87F';
  const highSurrogatesGroup9 = '\uD880\uD881\uD882\uD883\uD884\uD885\uD886\uD887\uD888\uD889\uD88A\uD88B\uD88C\uD88D\uD88E\uD88F';
  const highSurrogatesGroup10 = '\uD890\uD891\uD892\uD893\uD894\uD895\uD896\uD897\uD898\uD899\uD89A\uD89B\uD89C\uD89D\uD89E\uD89F';
  const highSurrogatesGroup11 = '\uD8A0\uD8A1\uD8A2\uD8A3\uD8A4\uD8A5\uD8A6\uD8A7\uD8A8\uD8A9\uD8AA\uD8AB\uD8AC\uD8AD\uD8AE\uD8AF';
  const highSurrogatesGroup12 = '\uD8B0\uD8B1\uD8B2\uD8B3\uD8B4\uD8B5\uD8B6\uD8B7\uD8B8\uD8B9\uD8BA\uD8BB\uD8BC\uD8BD\uD8BE\uD8BF';
  const highSurrogatesGroup13 = '\uD8C0\uD8C1\uD8C2\uD8C3\uD8C4\uD8C5\uD8C6\uD8C7\uD8C8\uD8C9\uD8CA\uD8CB\uD8CC\uD8CD\uD8CE\uD8CF';
  const highSurrogatesGroup14 = '\uD8D0\uD8D1\uD8D2\uD8D3\uD8D4\uD8D5\uD8D6\uD8D7\uD8D8\uD8D9\uD8DA\uD8DB\uD8DC\uD8DD\uD8DE\uD8DF';
  const highSurrogatesGroup15 = '\uD8E0\uD8E1\uD8E2\uD8E3\uD8E4\uD8E5\uD8E6\uD8E7\uD8E8\uD8E9\uD8EA\uD8EB\uD8EC\uD8ED\uD8EE\uD8EF';
  const highSurrogatesGroup16 = '\uD8F0\uD8F1\uD8F2\uD8F3\uD8F4\uD8F5\uD8F6\uD8F7\uD8F8\uD8F9\uD8FA\uD8FB\uD8FC\uD8FD\uD8FE\uD8FF';

  assert.same(escape(highSurrogatesGroup1), '\\ud800\\ud801\\ud802\\ud803\\ud804\\ud805\\ud806\\ud807\\ud808\\ud809\\ud80a\\ud80b\\ud80c\\ud80d\\ud80e\\ud80f', 'High surrogates group 1 are correctly escaped');
  assert.same(escape(highSurrogatesGroup2), '\\ud810\\ud811\\ud812\\ud813\\ud814\\ud815\\ud816\\ud817\\ud818\\ud819\\ud81a\\ud81b\\ud81c\\ud81d\\ud81e\\ud81f', 'High surrogates group 2 are correctly escaped');
  assert.same(escape(highSurrogatesGroup3), '\\ud820\\ud821\\ud822\\ud823\\ud824\\ud825\\ud826\\ud827\\ud828\\ud829\\ud82a\\ud82b\\ud82c\\ud82d\\ud82e\\ud82f', 'High surrogates group 3 are correctly escaped');
  assert.same(escape(highSurrogatesGroup4), '\\ud830\\ud831\\ud832\\ud833\\ud834\\ud835\\ud836\\ud837\\ud838\\ud839\\ud83a\\ud83b\\ud83c\\ud83d\\ud83e\\ud83f', 'High surrogates group 4 are correctly escaped');
  assert.same(escape(highSurrogatesGroup5), '\\ud840\\ud841\\ud842\\ud843\\ud844\\ud845\\ud846\\ud847\\ud848\\ud849\\ud84a\\ud84b\\ud84c\\ud84d\\ud84e\\ud84f', 'High surrogates group 5 are correctly escaped');
  assert.same(escape(highSurrogatesGroup6), '\\ud850\\ud851\\ud852\\ud853\\ud854\\ud855\\ud856\\ud857\\ud858\\ud859\\ud85a\\ud85b\\ud85c\\ud85d\\ud85e\\ud85f', 'High surrogates group 6 are correctly escaped');
  assert.same(escape(highSurrogatesGroup7), '\\ud860\\ud861\\ud862\\ud863\\ud864\\ud865\\ud866\\ud867\\ud868\\ud869\\ud86a\\ud86b\\ud86c\\ud86d\\ud86e\\ud86f', 'High surrogates group 7 are correctly escaped');
  assert.same(escape(highSurrogatesGroup8), '\\ud870\\ud871\\ud872\\ud873\\ud874\\ud875\\ud876\\ud877\\ud878\\ud879\\ud87a\\ud87b\\ud87c\\ud87d\\ud87e\\ud87f', 'High surrogates group 8 are correctly escaped');
  assert.same(escape(highSurrogatesGroup9), '\\ud880\\ud881\\ud882\\ud883\\ud884\\ud885\\ud886\\ud887\\ud888\\ud889\\ud88a\\ud88b\\ud88c\\ud88d\\ud88e\\ud88f', 'High surrogates group 9 are correctly escaped');
  assert.same(escape(highSurrogatesGroup10), '\\ud890\\ud891\\ud892\\ud893\\ud894\\ud895\\ud896\\ud897\\ud898\\ud899\\ud89a\\ud89b\\ud89c\\ud89d\\ud89e\\ud89f', 'High surrogates group 10 are correctly escaped');
  assert.same(escape(highSurrogatesGroup11), '\\ud8a0\\ud8a1\\ud8a2\\ud8a3\\ud8a4\\ud8a5\\ud8a6\\ud8a7\\ud8a8\\ud8a9\\ud8aa\\ud8ab\\ud8ac\\ud8ad\\ud8ae\\ud8af', 'High surrogates group 11 are correctly escaped');
  assert.same(escape(highSurrogatesGroup12), '\\ud8b0\\ud8b1\\ud8b2\\ud8b3\\ud8b4\\ud8b5\\ud8b6\\ud8b7\\ud8b8\\ud8b9\\ud8ba\\ud8bb\\ud8bc\\ud8bd\\ud8be\\ud8bf', 'High surrogates group 12 are correctly escaped');
  assert.same(escape(highSurrogatesGroup13), '\\ud8c0\\ud8c1\\ud8c2\\ud8c3\\ud8c4\\ud8c5\\ud8c6\\ud8c7\\ud8c8\\ud8c9\\ud8ca\\ud8cb\\ud8cc\\ud8cd\\ud8ce\\ud8cf', 'High surrogates group 13 are correctly escaped');
  assert.same(escape(highSurrogatesGroup14), '\\ud8d0\\ud8d1\\ud8d2\\ud8d3\\ud8d4\\ud8d5\\ud8d6\\ud8d7\\ud8d8\\ud8d9\\ud8da\\ud8db\\ud8dc\\ud8dd\\ud8de\\ud8df', 'High surrogates group 14 are correctly escaped');
  assert.same(escape(highSurrogatesGroup15), '\\ud8e0\\ud8e1\\ud8e2\\ud8e3\\ud8e4\\ud8e5\\ud8e6\\ud8e7\\ud8e8\\ud8e9\\ud8ea\\ud8eb\\ud8ec\\ud8ed\\ud8ee\\ud8ef', 'High surrogates group 15 are correctly escaped');
  assert.same(escape(highSurrogatesGroup16), '\\ud8f0\\ud8f1\\ud8f2\\ud8f3\\ud8f4\\ud8f5\\ud8f6\\ud8f7\\ud8f8\\ud8f9\\ud8fa\\ud8fb\\ud8fc\\ud8fd\\ud8fe\\ud8ff', 'High surrogates group 16 are correctly escaped');

  // Trailing Surrogates
  const lowSurrogatesGroup1 = '\uDC00\uDC01\uDC02\uDC03\uDC04\uDC05\uDC06\uDC07\uDC08\uDC09\uDC0A\uDC0B\uDC0C\uDC0D\uDC0E\uDC0F';
  const lowSurrogatesGroup2 = '\uDC10\uDC11\uDC12\uDC13\uDC14\uDC15\uDC16\uDC17\uDC18\uDC19\uDC1A\uDC1B\uDC1C\uDC1D\uDC1E\uDC1F';
  const lowSurrogatesGroup3 = '\uDC20\uDC21\uDC22\uDC23\uDC24\uDC25\uDC26\uDC27\uDC28\uDC29\uDC2A\uDC2B\uDC2C\uDC2D\uDC2E\uDC2F';
  const lowSurrogatesGroup4 = '\uDC30\uDC31\uDC32\uDC33\uDC34\uDC35\uDC36\uDC37\uDC38\uDC39\uDC3A\uDC3B\uDC3C\uDC3D\uDC3E\uDC3F';
  const lowSurrogatesGroup5 = '\uDC40\uDC41\uDC42\uDC43\uDC44\uDC45\uDC46\uDC47\uDC48\uDC49\uDC4A\uDC4B\uDC4C\uDC4D\uDC4E\uDC4F';
  const lowSurrogatesGroup6 = '\uDC50\uDC51\uDC52\uDC53\uDC54\uDC55\uDC56\uDC57\uDC58\uDC59\uDC5A\uDC5B\uDC5C\uDC5D\uDC5E\uDC5F';
  const lowSurrogatesGroup7 = '\uDC60\uDC61\uDC62\uDC63\uDC64\uDC65\uDC66\uDC67\uDC68\uDC69\uDC6A\uDC6B\uDC6C\uDC6D\uDC6E\uDC6F';
  const lowSurrogatesGroup8 = '\uDC70\uDC71\uDC72\uDC73\uDC74\uDC75\uDC76\uDC77\uDC78\uDC79\uDC7A\uDC7B\uDC7C\uDC7D\uDC7E\uDC7F';
  const lowSurrogatesGroup9 = '\uDC80\uDC81\uDC82\uDC83\uDC84\uDC85\uDC86\uDC87\uDC88\uDC89\uDC8A\uDC8B\uDC8C\uDC8D\uDC8E\uDC8F';
  const lowSurrogatesGroup10 = '\uDC90\uDC91\uDC92\uDC93\uDC94\uDC95\uDC96\uDC97\uDC98\uDC99\uDC9A\uDC9B\uDC9C\uDC9D\uDC9E\uDC9F';
  const lowSurrogatesGroup11 = '\uDCA0\uDCA1\uDCA2\uDCA3\uDCA4\uDCA5\uDCA6\uDCA7\uDCA8\uDCA9\uDCAA\uDCAB\uDCAC\uDCAD\uDCAE\uDCAF';
  const lowSurrogatesGroup12 = '\uDCB0\uDCB1\uDCB2\uDCB3\uDCB4\uDCB5\uDCB6\uDCB7\uDCB8\uDCB9\uDCBA\uDCBB\uDCBC\uDCBD\uDCBE\uDCBF';
  const lowSurrogatesGroup13 = '\uDCC0\uDCC1\uDCC2\uDCC3\uDCC4\uDCC5\uDCC6\uDCC7\uDCC8\uDCC9\uDCCA\uDCCB\uDCCC\uDCCD\uDCCE\uDCCF';
  const lowSurrogatesGroup14 = '\uDCD0\uDCD1\uDCD2\uDCD3\uDCD4\uDCD5\uDCD6\uDCD7\uDCD8\uDCD9\uDCDA\uDCDB\uDCDC\uDCDD\uDCDE\uDCDF';
  const lowSurrogatesGroup15 = '\uDCE0\uDCE1\uDCE2\uDCE3\uDCE4\uDCE5\uDCE6\uDCE7\uDCE8\uDCE9\uDCEA\uDCEB\uDCEC\uDCED\uDCEE\uDCEF';
  const lowSurrogatesGroup16 = '\uDCF0\uDCF1\uDCF2\uDCF3\uDCF4\uDCF5\uDCF6\uDCF7\uDCF8\uDCF9\uDCFA\uDCFB\uDCFC\uDCFD\uDCFE\uDCFF';

  assert.same(escape(lowSurrogatesGroup1), '\\udc00\\udc01\\udc02\\udc03\\udc04\\udc05\\udc06\\udc07\\udc08\\udc09\\udc0a\\udc0b\\udc0c\\udc0d\\udc0e\\udc0f', 'Low surrogates group 1 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup2), '\\udc10\\udc11\\udc12\\udc13\\udc14\\udc15\\udc16\\udc17\\udc18\\udc19\\udc1a\\udc1b\\udc1c\\udc1d\\udc1e\\udc1f', 'Low surrogates group 2 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup3), '\\udc20\\udc21\\udc22\\udc23\\udc24\\udc25\\udc26\\udc27\\udc28\\udc29\\udc2a\\udc2b\\udc2c\\udc2d\\udc2e\\udc2f', 'Low surrogates group 3 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup4), '\\udc30\\udc31\\udc32\\udc33\\udc34\\udc35\\udc36\\udc37\\udc38\\udc39\\udc3a\\udc3b\\udc3c\\udc3d\\udc3e\\udc3f', 'Low surrogates group 4 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup5), '\\udc40\\udc41\\udc42\\udc43\\udc44\\udc45\\udc46\\udc47\\udc48\\udc49\\udc4a\\udc4b\\udc4c\\udc4d\\udc4e\\udc4f', 'Low surrogates group 5 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup6), '\\udc50\\udc51\\udc52\\udc53\\udc54\\udc55\\udc56\\udc57\\udc58\\udc59\\udc5a\\udc5b\\udc5c\\udc5d\\udc5e\\udc5f', 'Low surrogates group 6 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup7), '\\udc60\\udc61\\udc62\\udc63\\udc64\\udc65\\udc66\\udc67\\udc68\\udc69\\udc6a\\udc6b\\udc6c\\udc6d\\udc6e\\udc6f', 'Low surrogates group 7 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup8), '\\udc70\\udc71\\udc72\\udc73\\udc74\\udc75\\udc76\\udc77\\udc78\\udc79\\udc7a\\udc7b\\udc7c\\udc7d\\udc7e\\udc7f', 'Low surrogates group 8 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup9), '\\udc80\\udc81\\udc82\\udc83\\udc84\\udc85\\udc86\\udc87\\udc88\\udc89\\udc8a\\udc8b\\udc8c\\udc8d\\udc8e\\udc8f', 'Low surrogates group 9 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup10), '\\udc90\\udc91\\udc92\\udc93\\udc94\\udc95\\udc96\\udc97\\udc98\\udc99\\udc9a\\udc9b\\udc9c\\udc9d\\udc9e\\udc9f', 'Low surrogates group 10 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup11), '\\udca0\\udca1\\udca2\\udca3\\udca4\\udca5\\udca6\\udca7\\udca8\\udca9\\udcaa\\udcab\\udcac\\udcad\\udcae\\udcaf', 'Low surrogates group 11 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup12), '\\udcb0\\udcb1\\udcb2\\udcb3\\udcb4\\udcb5\\udcb6\\udcb7\\udcb8\\udcb9\\udcba\\udcbb\\udcbc\\udcbd\\udcbe\\udcbf', 'Low surrogates group 12 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup13), '\\udcc0\\udcc1\\udcc2\\udcc3\\udcc4\\udcc5\\udcc6\\udcc7\\udcc8\\udcc9\\udcca\\udccb\\udccc\\udccd\\udcce\\udccf', 'Low surrogates group 13 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup14), '\\udcd0\\udcd1\\udcd2\\udcd3\\udcd4\\udcd5\\udcd6\\udcd7\\udcd8\\udcd9\\udcda\\udcdb\\udcdc\\udcdd\\udcde\\udcdf', 'Low surrogates group 14 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup15), '\\udce0\\udce1\\udce2\\udce3\\udce4\\udce5\\udce6\\udce7\\udce8\\udce9\\udcea\\udceb\\udcec\\udced\\udcee\\udcef', 'Low surrogates group 15 are correctly escaped');
  assert.same(escape(lowSurrogatesGroup16), '\\udcf0\\udcf1\\udcf2\\udcf3\\udcf4\\udcf5\\udcf6\\udcf7\\udcf8\\udcf9\\udcfa\\udcfb\\udcfc\\udcfd\\udcfe\\udcff', 'Low surrogates group 16 are correctly escaped');

  assert.same(escape('.a.b'), '\\.a\\.b', 'mixed string with dot character is escaped correctly');
  assert.same(escape('.1+2'), '\\.1\\+2', 'mixed string with plus character is escaped correctly');
  assert.same(escape('.a(b)c'), '\\.a\\(b\\)c', 'mixed string with parentheses is escaped correctly');
  assert.same(escape('.a*b+c'), '\\.a\\*b\\+c', 'mixed string with asterisk and plus characters is escaped correctly');
  assert.same(escape('.a?b^c'), '\\.a\\?b\\^c', 'mixed string with question mark and caret characters is escaped correctly');
  assert.same(escape('.a{2}'), '\\.a\\{2\\}', 'mixed string with curly braces is escaped correctly');
  assert.same(escape('.a|b'), '\\.a\\|b', 'mixed string with pipe character is escaped correctly');
  assert.same(escape('.a\\b'), '\\.a\\\\b', 'mixed string with backslash is escaped correctly');
  assert.same(escape('.a\\\\b'), '\\.a\\\\\\\\b', 'mixed string with backslash is escaped correctly');
  assert.same(escape('.a^b'), '\\.a\\^b', 'mixed string with caret character is escaped correctly');
  assert.same(escape('.a$b'), '\\.a\\$b', 'mixed string with dollar sign is escaped correctly');
  assert.same(escape('.a[b]'), '\\.a\\[b\\]', 'mixed string with square brackets is escaped correctly');
  assert.same(escape('.a.b(c)'), '\\.a\\.b\\(c\\)', 'mixed string with dot and parentheses is escaped correctly');
  assert.same(escape('.a*b+c?d^e$f|g{2}h[i]j\\k'), '\\.a\\*b\\+c\\?d\\^e\\$f\\|g\\{2\\}h\\[i\\]j\\\\k', 'complex string with multiple special characters is escaped correctly');

  assert.same(escape('^$\\.*+?()[]{}|'), '\\^\\$\\\\\\.\\*\\+\\?\\(\\)\\[\\]\\{\\}\\|', 'Syntax characters are correctly escaped');

  assert.throws(() => escape(123), TypeError, 'non-string input (number) throws TypeError');
  assert.throws(() => escape({}), TypeError, 'non-string input (object) throws TypeError');
  assert.throws(() => escape([]), TypeError, 'non-string input (array) throws TypeError');
  assert.throws(() => escape(null), TypeError, 'non-string input (null) throws TypeError');
  assert.throws(() => escape(undefined), TypeError, 'non-string input (undefined) throws TypeError');
});
