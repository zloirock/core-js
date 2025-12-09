declare namespace CoreJS {
  export type CoreJSDecoratorMetadataObject = typeof globalThis extends { DecoratorMetadataObject: infer O } // from ts 5.2
    ? O
    : Record<PropertyKey, unknown> & object;
}
