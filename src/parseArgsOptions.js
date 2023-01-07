const parseArgsOptions = {
    flags: [
        {
            long: `verbose`,
            short: `v`,
            type: `boolean`
        },
        {
            long: `name`,
            short: `n`,
            type: `string`
        },
        {
            long: `output`,
            short: `o`,
            type: `string`
        },
        {
            long: `input`,
            short: `i`,
            type: `string`
        },
        {
            long: `dest`,
            short: `d`,
            type: `string`
        },
        {
            long: `path`,
            short: `p`,
            type: `string`
        },
        {
            long: `port`,
            type: `number`
        }        
    ]
};

export default parseArgsOptions;
