// receiver substitution composed with intermediate-hop threading: a proxy-global receiver
// (`globalThis`) is substituted to `_globalThis` inside the memoized receiver while the `.map(...)`
// hop is threaded onto the inner result - both behaviors apply within one combine
globalThis.list.flat?.().map(x => x * 2).at?.(0);
