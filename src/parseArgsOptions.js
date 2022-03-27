const parseArgsOptions = {
    flags: [
        {
            long: `verbose`,
            short: `v`,
            type: `boolean`,
        },
        {
            long: `name`,
            short: `n`,
            type: `string`,
        },
        {
            long: `output`,
            short: `o`,
            type: `string`,
        },
        {
            long: `input`,
            short: `i`,
            type: `string`,
        },
        {
            long: `dest`,
            short: `d`,
            type: `string`,
        },
    ],
};

export default parseArgsOptions;