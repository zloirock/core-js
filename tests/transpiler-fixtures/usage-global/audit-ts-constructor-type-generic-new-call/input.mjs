type Factory<T> = new () => T;
declare function make(): Factory<string>;
new (make())().at(-1);
