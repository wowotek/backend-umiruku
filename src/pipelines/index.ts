import Pipeline from "./engine";

const pipeline_Something = Pipeline<{ age: number }>("Something", "This is a pipeline that does something");
pipeline_Something.addSubroutine("AddOne", async (state) => {
    state.age += 1;
    return state;
});
pipeline_Something.addSubroutine("AddTwo", async (state) => {
    state.age += 2;
    return state;
});
pipeline_Something.addSubroutine("AddThree", async (state) => {
    state.age += 3;
    return state;
});

async function main() {
    const state = {
        age: 0
    };

    const result = await pipeline_Something.execute(state);
    console.log(result);
}

main();