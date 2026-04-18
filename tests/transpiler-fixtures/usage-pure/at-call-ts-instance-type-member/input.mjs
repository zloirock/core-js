declare class Widget { value: string[] }
declare const x: InstanceType<typeof Widget>;
x.value.at(0);
