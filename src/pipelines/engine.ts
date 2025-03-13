export class pipeline<tState> {
    private __name;
    private __description;
    private __subRoutineNames = new Array<string>();
    private __subRoutines = new Array<(args: tState) => Promise<tState>>();

    private constructor(name: string, description: string = "") {
        this.__name = name;
        this.__description = description;
    }

    public get name() {
        return this.__name;
    }

    public get description() {
        return this.__description;
    }

    public static __create<T>(name: string, description: string) {
        return new this<T>(name, description);
    }

    public addSubroutine(
        subRoutineName: string,
        subRoutine: (args: tState) => Promise<tState>
    ) {
        this.__subRoutineNames.push(subRoutineName);
        this.__subRoutines.push(subRoutine);
    }

    public async execute(state: tState): Promise<tState> {
        let result: tState = state;
        for await (const subRoutine of this.__subRoutines) {
            await subRoutine(result).then(newResult => { result = newResult });
        }

        return result;
    }
}

function Pipeline<T>(name: string, description: string = "") {
    return pipeline.__create<T>(name, description);
}

export default Pipeline;