const obj = { value: 'hi' as string };
declare const x: typeof obj;
x.value.at(0);
