// @ts-expect-error a tuple index tsc refuses is the shape under test
declare function get(): [number, ...string];
get().at(0).toFixed(2);
