type Constructor = { new (...args: any[]): {} };
export function CacheGetters<T extends Constructor>(ctr: T) {
  Object.entries(Object.getOwnPropertyDescriptors(ctr.prototype)).forEach(
    ([method, descriptor]: [string, PropertyDescriptor]) => {
      const isGetter = 'get' in descriptor;
      if (isGetter) {
        Object.defineProperty(ctr.prototype, method, {
          get: function () {
            if (method in this.cache) {
              return this.cache[method];
            }
            const value = descriptor.get.apply(this);
            this.cache[method] = value;
            return value;
          }
        });
      }
    }
  );

  return class extends ctr {
    cache = {};
  };
}

export function ValidateIsLettersOnly (target: any, memberName: string) {
    let val: any = target[memberName];
    Object.defineProperty(target, memberName, {
        set: (newValue) => {
            if (!/^[a-zA-Z]+$/.test(newValue)) {
                throw new Error(`${memberName} must include letters only`);
            }
            val = newValue;
        },
        get: () => val,
        configurable : true
    });
}

export function Log() {
    return (
        target: any,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any> | any>
    ): void => {

        try {
            const { isAsync, isFunction } = getFunctionDetails(descriptor.value);
            const className = target.name || target.constructor.name;
            const oldFunc = descriptor.value;
            if (isAsync) {
                descriptor.value = async function () {
                    const start = process.hrtime.bigint();
                    console.log(`In ${className}::${propertyKey}`);
                    let res = null;
                    try {
                        // eslint-disable-next-line prefer-rest-params
                        res = await oldFunc.apply(this, arguments);
                    } finally {
                        const end: bigint = process.hrtime.bigint();
                        const calculatedTime = calculateTime(start, end);
                        console.log(`${res ? 'Out' : 'Failed'} ${className}::${propertyKey} took ${calculatedTime}`);
                    }
                    return res;
                };
            } else if (isFunction) {
                descriptor.value = function () {
                    const start = process.hrtime.bigint();
                    console.log(`In ${className}::${propertyKey}`);
                    let res = null;
                    try {
                        // eslint-disable-next-line prefer-rest-params
                        res = oldFunc.apply(this, arguments);
                    } finally {
                        const end: bigint = process.hrtime.bigint();
                        const calculatedTime = calculateTime(start, end);
                        console.log(`${res ? 'Out' : 'Failed'} ${className}::${propertyKey} took ${calculatedTime}`);
                    }
                    return res;
                };
            }
        } catch (e) {
            console.warn(`logging decorator failed : ${(e as Error).message}`);
            return;
        }
    };
}

function calculateTime(start: bigint, end: bigint): string {
    const time = Number(end - start) * 1e-6;
    return `${time.toPrecision(3)} ms`;
}

function getFunctionDetails(f: (...params: any[]) => Promise<any> | any) {
    const details = {
        isFunction: false,
        isAsync: false
    };
    try {
        const functionType = f.constructor.name;
        if (functionType === 'AsyncFunction') {
            details.isAsync = true;
            details.isFunction = true;
        } else if (functionType === 'Function') {
            details.isFunction = true;
        }
        return details;
    } catch (e) {
        return details;
    }
}
