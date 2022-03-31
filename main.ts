import {ValidateIsLettersOnly, CacheGetters, Log } from './decorators';

@CacheGetters
// @NoMethodContainsStringCat
class Dog {
    @ValidateIsLettersOnly
    private name : string;
    // @ValidateNumber({lessThen : 15})
    private age : number;
    // @ValidateInRange(['golden','canaan'])
    private breed : string;

    constructor(name, age, breed) {
        this.name = name;
        this.age = age;
        this.breed = breed;
    }
    @Log()
    public getData() {
        return {
            name : this.name,
            age : this.age,
            breed : this.breed,
        }
    }

    // @AlertIfError
    public bark() {
        if (this.breed) {
            throw new Error(`golden is too cute to bark`);
        }
    }
}

const dog = new Dog('R2D2',20,'golden');
// const dog = new Dog('Zoey',1,'canaan');
// dog.getData();