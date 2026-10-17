let localAssigned;
[localAssigned] = [{ tags: 'yz', scan() { return this.tags.includes('y'); } }];
localAssigned.scan();
