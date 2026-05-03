// `Map` global referenced both as JSX tag (`<Map />`) and as a runtime constructor
// (`new Map()`) in the same file. JSXIdentifier reference must NOT be renamed (would
// invoke polyfill as a React component); plain runtime reference must polyfill.
const el = <Map data={x} />;
const m = new Map();
