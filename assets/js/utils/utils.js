export const createCanvas = () => {
    const canvas = document.getElementById('gameCanvas');
    // set the canvas with to the width of the window
    canvas.width = window.innerWidth;
    // add canvas id to the canvas
    canvas.id = 'gameCanvas';
    // add the canvas to the body
    return {
        canvas,
        ctx: canvas.getContext('2d')
    }
}