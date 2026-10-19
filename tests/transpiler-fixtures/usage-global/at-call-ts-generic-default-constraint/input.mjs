function wrap<T extends string[] = string[]>(items: T): T { return items; }
// @ts-expect-error the call supplies nothing, which is what the type parameter default is for
wrap().at(-1);
