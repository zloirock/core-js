import './tests.js';
/* global Deno -- it's Deno */
const data = JSON.parse(await Deno.readTextFile('packages/core-js-compat/data.json'));

const tests = globalThis.tests;
const result = Object.create(null);
let difference = false;

for (const [name, test] of Object.entries(tests)) {
  try {
    result[name] = typeof test == 'function' ? !!test() : test.reduce((accumulator, subTest) => {
      return accumulator && !!subTest();
    }, true);
  } catch {
    result[name] = false;
  }
}

function logResults(showDifference) {
  for (const [name, test] of Object.entries(result)) {
    const filled = name + '                                             | '.slice(name.length);
    if (!data[name]) continue;
    if (!!data[name].deno === result[name]) {
      if (showDifference) continue;
    } else difference = true;
    if (test) console.log('\u001B[32m' + filled + 'not required\u001B[0m');
    else console.log('\u001B[31m' + filled + 'required\u001B[0m');
  }
}

if (globalThis.Deno.args.includes('--mode=JSON')) {
  console.log(JSON.stringify(result, null, '  '));
} else {
  logResults(false);

  if (difference) {
    console.log('\n\u001B[36mchanges:\u001B[0m\n');
    logResults(true);
  } else console.log('\n\u001B[36mno changes\u001B[0m');
}
