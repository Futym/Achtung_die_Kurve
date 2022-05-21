const {initGame, gameLoop, getUpdatedVelocity} = require('./game');
const {FRAME_RATE } = require('./constants');
const {makeId} = require('./utils');
const io = require("socket.io")({
    cors: {
      origin: "*",
      credentials: true,
      methods: ["GET", "POST"],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
    }
});
const state = {};
const clientRooms = {};

io.on('connection', client => {

  client.on('keydown', handleKeydown);
  client.on('newGame', handleNewGame);
  client.on('exitGame', handleExitGame);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms.get(roomName);
    console.log(room)
    let numClients = 0;

    if (room) {
      numClients = room ? room.size : 0;
      console.log(room.size);
    }


    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } else if (numClients > 1) {
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    client.join(roomName);
    client.number = 2;
    client.emit('init', 2);
    
    startGameInterval(roomName);
    
  }

  function handleNewGame() {
    let roomName = makeId(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
    console.log(clientRooms)
    console.log(state)
    
  }

  function handleExitGame() {
    const roomName = clientRooms[client.id]
    state[roomName].players = state[roomName].players.splice(client.number - 1, 1);
    clearInterval(intervalId);
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode,state[roomName].players[client.number - 1]);

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);
    
    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner);
    //   state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
    setTimeout(() => {nextRound(room)}, 5000);
}

function nextRound(roomName) {
    io.sockets.in(roomName)
    .emit('nextRound')
    resetGameState(state[roomName]);
    startGameInterval(roomName);
    console.log(state[roomName])
    console.log(state[roomName].players[0])
    console.log(state[roomName].players[1])
}

function resetGameState(state) {
    state.players[0].pos = {
        x:3,
        y:10,
    }
    state.players[1].pos = {
        x:3,
        y:70,
    }

    state.players[0].vel = {
        x: 1,
        y: 0,
    }
    state.players[1].vel = {
        x: 1,
        y: 0,
    }

    state.players[0].snake = [
    ]
    state.players[1].snake = [
    ]
}


io.listen(process.env.PORT || 3000);