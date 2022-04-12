import './tests.js';

var tests = globalThis.tests;
var result = Object.create(null);

for (const [name, test] of Object.entries(tests)) {
  try {
    result[name] = typeof test == 'function' ? !!test() : test.reduce((accumulator, subTest) => {
      return accumulator && !!subTest();
    }, true);
  } catch {
    result[name] = false;
  }
}

if (globalThis.Deno.args.includes('--mode=JSON')) {
  console.log(JSON.stringify(result, null, '  '));
} else for (const [name, test] of Object.entries(result)) {
  var filled = name + '                                             | '.slice(name.length);
  if (test) console.log('\u001B[32m' + filled + 'not required\u001B[0m');
  else console.log('\u001B[31m' + filled + 'required\u001B[0m');
}
