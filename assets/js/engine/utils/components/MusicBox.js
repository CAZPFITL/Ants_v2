import States from "../patterns/State.js";

export const PLAY = 'PLAY';
export const PAUSE = 'PAUSE';
export const STOP = 'STOP';

export default class MusicBox {
    constructor(app) {
        this.app = app;
        this.state = new States(this, STOP, [PLAY, PAUSE, STOP]);
        this.song = { volume: 1 };
        this.volume = 1;
        this.songs = []
        app.factory.addGameEntity(this);
    }

    /**
     * Class methods
     */
    addSong({name, file}) {
        const song = new Audio(file);
        song.loop = true;

        this.songs[name] = song;
    }

    changeSong(song) {
        this.song = this.songs[song];
    }

    changeVolume(volume) {
        this.volume = volume;
    }

    toggle() {
        this.state.setState(this.song.paused ? PLAY : PAUSE);
        this.state.state === PLAY ? this.song.play() : this.song.pause();
    }

    /**
     * Draw and Update methods
     */
    update() {
        this.song.volume = this.volume <= 1 && this.volume >= 0 ? this.volume : 1;
    }
}