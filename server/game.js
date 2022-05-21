const {GRID_SIZE} = require('./constants')

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity,
}
const {getColor,convertRGBToHex} = require('./ColorManager');
const {Config} = require('./config')

function initGame() {
    const state = createGameState();
    colorPlayers(state)
    // randomFood(state);
    return state;
}

function createGameState() {
    return {
        players: [{
            pos: {
                x:3,
                y:10,
            },
            vel: {
                x: 1,
                y: 0,
            },
            snake:[
            ],
            color:"",
            
        }, {
            pos: {
                x:3,
                y:70,
            },
            vel: {
                x: 1,
                y: 0,
            },
            snake:[
            ],
            color:"",
        }],
        food: {},
        gridSize:GRID_SIZE,
    };
}

function gameLoop(state) {
    if (!state){
        return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        console.log("a")
        return 2;
    }

    if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
        console.log("b")
        return 1;
    }


    
    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y){
        playerOne.snake.push({ ...playerOne.pos })
        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;
        // randomFood(state);
    }

    if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y){
        playerTwo.snake.push({ ...playerTwo.pos })
        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;
        // randomFood(state);
    }

    if (playerOne.vel.x || playerOne.vel.y) {
        for (let cell of playerOne.snake) {
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                console.log("c1")
                return 2;
            }
        }

        for (let cell of playerTwo.snake) {
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                console.log("c2")
                return 2;
            }
        }

        playerOne.snake.push({...playerOne.pos});
        // playerOne.snake.shift();
    }

    if (playerTwo.vel.x || playerTwo.vel.y) {
        for (let cell of playerTwo.snake) {
            if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                console.log("d1")
                return 1;
            }
        }
        for (let cell of playerOne.snake) {
            if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                console.log("d2")
                return 1;
            }
        }

        playerTwo.snake.push({...playerTwo.pos});
        // playerTwo.snake.shift();
    }

    return false;
}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    }

    for (let cell of state.players[0].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            return randomFood(state)
        }
    }

    for (let cell of state.players[1].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            return randomFood(state)
        }
    }

    state.food = food;
}

function colorPlayers(state) {
    state.players[0].color = convertRGBToHex(getColor())
    state.players[1].color = convertRGBToHex(getColor())
}

function getUpdatedVelocity(keyCode, state) {
    vel = state.vel
    switch (keyCode) {
        case 37: {//left
            return {x:vel.x-1, y:vel.y};
        }
        case 38: {//up
            return {x:vel.x, y:vel.y-1};
        }
        case 39: {//right
            return {x:vel.x+1, y:vel.y};
        }
        case 40: {//down
            return {x:vel.x, y:vel.y+1};
        }
        case 65: {//left
            return {x:vel.y, y:0-vel.x};
        }
        case 68: {//right
            return {x:0-vel.y, y:vel.x};
        }
    }
}