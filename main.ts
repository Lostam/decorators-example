import {ValidateStringShorterThen15, CacheGetters, Log } from './decorators';

@CacheGetters
@NoMethodContainsStringCat
class Dog {
    @ValidateStringShorterThen15
    private name : string;
    @ValidateNumber({lessThen : 15})
    private age : number;
    @ValidateInRange(['golden','canaan'])
    private breed : string;

    constructor(name) {
        this.name = name;
    }
    @Log()
    public getData() {
        return {
            name : this.name,
            age : this.age,
            breed : this.breed,
        }
    }

    @AlertIfError
    public bark() {
        if (this.breed) {
            throw new Error(`golden is too cute to bark`);
        }
    }
}