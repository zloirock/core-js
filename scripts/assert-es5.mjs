// It must PARSE, not transform: esbuild's `target: 'es5'` LOWERS what it can and accepts arrows,
// `?.` and `??`, so a gate built on it reports success for ES2020 text.
import { parse } from 'acorn';

export function assertES5(code, label) {
  try {
    parse(code, { ecmaVersion: 5 });
  } catch (error) {
    throw new Error(`${ label }: not ES5 - ${ error.message }`);
  }
}
