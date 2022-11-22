export const LOAD_GAME_DATA = 'LOAD_GAME_DATA';
export const LOAD_GAME_LEVEL = 'LOAD_GAME_LEVEL';
export const GAME_OVER = 'GAME_OVER';
export const MAIN_MENU = 'MAIN_MENU';
export const PLAY = 'PLAY';
export const INSTRUCTIONS = 'INSTRUCTIONS';
export const CONTROLS = 'CONTROLS';
export const STOP = 'STOP';
export const NETWORK = 'NETWORK';

export const STATES = [
    LOAD_GAME_DATA,
    LOAD_GAME_LEVEL,
    GAME_OVER,
    PLAY,
    MAIN_MENU,
    NETWORK,
    CONTROLS,
    STOP,
    INSTRUCTIONS
];

export const COLORS = {
    WHITE: [
        '#FFFFFFFF', // 100 - 0
        '#FFFFFFE5', // 90  - 1
        '#FFFFFFCC', // 80  - 2
        '#FFFFFFB3', // 70  - 3
        '#FFFFFFA0', // 60  - 4
        '#FFFFFF8F', // 50  - 5
        '#FFFFFF7C', // 40  - 6
        '#FFFFFF66', // 30  - 7
        '#FFFFFF4D', // 20  - 8
        '#FFFFFF33', // 10  - 9
    ],
    BLACK: [
        '#000000FF', // 100 - 0
        '#000000E5', // 90  - 1
        '#000000CC', // 80  - 2
        '#000000B3', // 70  - 3
        '#000000A0', // 60  - 4
        '#0000008F', // 50  - 5
        '#0000007C', // 40  - 6
        '#00000066', // 30  - 7
        '#0000004D', // 20  - 8
        '#00000033', // 10  - 9
    ],
    GREEN: [
        '#82A91EFF',
    ],
    YELLOW: [
        '#D28B05FF',
        '#FFA600FF',
        '#FFBD4FFF',
    ],
    BROWN: [
        '#72604EFF'
    ]
};

export const gameSongs = [
    {
        name: 'ants_001',
        file: 'assets/audio/ants_001.mp3'
    }, {
        name: 'ants_002',
        file: 'assets/audio/ants_002.mp3'
    }, {
        name: 'ants_003',
        file: 'assets/audio/ants_003.mp3'
    }, {
        name: 'ants_004',
        file: 'assets/audio/ants_004.mp3'
    }
];

export const mainSong = 'ants_004';

export const gameInstructionsText = [
    'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum ',
    'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum ',
    'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum ',
    'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum ',
    'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum ',
    'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum ',
    'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum '
]