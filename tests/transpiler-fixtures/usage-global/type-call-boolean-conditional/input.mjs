// A naked boolean parameter distributes over true and false.
type Result<T> = T extends true ? number[] : string;
declare const value: Result<boolean>;
value.at(-1);
