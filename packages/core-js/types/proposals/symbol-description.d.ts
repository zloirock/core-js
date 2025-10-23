// proposal stage: 4
// https://github.com/tc39/proposal-Symbol-description

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/es2019.symbol.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

interface Symbol {
  readonly description: string | undefined;
}
