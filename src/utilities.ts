class Cacher<T> {
    private data: Array<T>;
    
    constructor(private readonly max: number = 100) {
        this.data = new Array<T>();
    }

    find(fn: (v: T) => boolean) {
        const result = [];
        for(const d of this.data) {
            if (fn(d)) {
                result.push(d);
            }
        }

        return result.length > 0 ? result : null;
    }

    add(...data: (T | null)[]) {
        for(const d of data) {
            if (d === null || this.data.find(v => v === d)) {
                continue;
            }
            
            this.data.push(d);
            if (this.data.length > this.max) {
                this.data.shift();
            }
        }
    }

    getAll() {
        return this.data;
    }
};

export type MakeOptional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;


export {
    Cacher
};