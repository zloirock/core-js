// `typeof` through a CHAIN of proxy-globals must surface the real ctor (Map), matching babel -
// unplugin previously surfaced only the first proxy hop and missed the constructor behind the chain
let m: typeof globalThis.self.Map;
