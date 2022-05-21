const BG_COLOR = '#231f20';
const SNAKE_ONE_COLOR = '#c2c2c2';
const FOOD_COLOR = '#e66916';
// const {io} = require('socket.io-client');
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const socket = io('http://192.168.0.126:3000')
socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('nextRound', handleNextRound);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const exitGameBtn = document.getElementById('exitGameButton');


newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
exitGameBtn.addEventListener('click', exitGame);

function newGame() {
    socket.emit('newGame');
    init();
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}

function exitGame() {
    socket.emit('exitGame')
    reset()
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
    initialScreen.style.display = "none";
    gameScreen.style.display = 'block';

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0,0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);
    gameActive = true;
}

function keydown(e)
{
    console.log(e.keyCode);
    socket.emit('keydown', e.keyCode);
}


function paintGame(state) {

    const gridSize = state.gridSize;
    const size = canvas.width/gridSize;

    ctx.fillStyle = FOOD_COLOR;

    paintPlayer(state.players[0], size, state.players[0].color);
    paintPlayer(state.players[1], size, state.players[1].color);
}

function paintPlayer (playerState, size, colour) {
    const pos = playerState.pos;

    ctx.fillStyle = colour;
    ctx.fillRect(pos.x * size, pos.y *size, size, size);
}

function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState){
    if (!gameActive) {
        return;
    }

    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }
    data = JSON.parse(data);
    
    gameActive = false;

    console.log("Player " + data.winner.toString() + " wins!")
    
}

function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode(){
    reset();
    alert("Unknown game code");
}

function handleTooManyPlayers(){
    reset();
    alert("This game is already full");
}

function reset() {
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}

function handleNextRound(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0,0, canvas.width, canvas.height);
    gameActive = true;
}
