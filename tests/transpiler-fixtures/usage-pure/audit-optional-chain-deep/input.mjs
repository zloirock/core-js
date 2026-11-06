// Deep optional chain mixing partial `?.` mid-chain.
// receiverType resolution should treat undefined returns from `?.` correctly.
declare const obj: { inner?: { items: string[] } };
obj?.inner?.items?.at(0);
