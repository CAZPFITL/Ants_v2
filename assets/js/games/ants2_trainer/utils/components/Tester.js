export default class Tester {
    static oscillate(x, y, amplitude, frequency) {
        return amplitude * Math.cos(frequency * x) * Math.sin(frequency * y);
    }

    static randomOscillation(x, y, amplitude, frequency) {
        return amplitude * Math.cos(frequency * x) * Math.sin(frequency * y) + Math.random() * amplitude;
    }
}