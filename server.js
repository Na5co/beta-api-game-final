const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const bodyParser = require('body-parser');
const axios = require('axios');
const { connected } = require('process');

require('dotenv').config();
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.use(bodyParser.json());
app.io = io;


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/joke', async (req, res) => {
  try {
    const decodedToken = await decodeToken(req.headers.authorization);
    let emitMessage = {
      id: decodedToken.id,
      message: await getJoke()
    };

    io.emit('joke', emitMessage);
    res.status(200).json({
      message: "Joke has been generated and sent to the rest of the players."
    })
  } catch (error) {
    res.status(400).json({
      message: "There was a problem generating your joke."
    })
  }
})

//MOVE ROUTE
app.post('/move', async (req, res) => {
  io.sockets.emit('allPlayersPos', getAllPlayers())
  try {
    const decodedToken = await decodeToken(req.headers.authorization);
    let emitMessage = {
      id: decodedToken.id,
      moveCommand: 'move',
      steps: req.query.steps,
      direction: req.query.direction
    };
    // getPlayerServerPosition(decodedToken.socketID);
    await updatePlayerServerPosition(decodedToken.socketID, req.query.direction, req.query.steps,);
    io.emit('move', emitMessage);
    res.status(200).json({
      message: 'Player ' + decodedToken.id + ' Moved succesfully!'
    });
  } catch {
    res.status(400).json({
      message: "Please double check your token"
    })
  }
});

app.post('/create-npc', async (req, res) => {
  if (!req.query.id) {
    res.send("Please specify valid ID")
  } else {
    createNPC(req.query.id)
    io.emit('createNPC', NPCS)
    console.log(NPCS, 'npcs');
    io.emit('allNpcs', NPCS);
  }

  res.send('NPC Created succesfully')
});

app.post('/move-npc', async (req, res) => {

  const emitMessage = {
    steps: req.query.steps,
    id: req.query.id,
    direction: req.query.direction
  }
  io.emit('move-npc', emitMessage);
  res.send('ok')
});


// SEND MESSAGE ROUTE
app.post('/send-message', async (req, res) => {
  try {
    const decodedToken = await decodeToken(req.headers.authorization);
    let emitMessage = {
      id: decodedToken.id,
      message: req.body.message,
    };

    io.emit('message', emitMessage);

    res.status(200).json({
      message: 'Message sent succesfully.'
    })
  } catch {
    res.status(400).json({
      message: "Please double check your token"
    })
  }
});
const NPCS = []

server.lastPlayderID = 0;

server.listen(process.env.PORT || 8081, () => {
  console.log('Listening on ' + server.address().port);
});

io.on('connection', async (socket) => {
  const message = await creteTokenEmitMessage(socket.id);

  io.to(socket.id).emit('private', message); // add secret code

  socket.on('message', async function(data){
    var decodedMessage = await decodeToken(data.token);
    console.log(decodedMessage);
    var playerPos = await getPlayerServerPosition(decodedMessage.socketID)
    console.log("playerpos", playerPos)
    io.sockets.emit("position", playerPos)
  })

  socket.on('newplayer', async () => {
    const name = await generateName()
    socket.player = {
      id: server.lastPlayderID++,
      x: 200,
      y: 300,
      name: name
    };

    let allPlayers = getAllPlayers()

    socket.emit('allplayers', allPlayers);
    socket.broadcast.emit('newplayer', socket.player);
    if (NPCS.length > 0) {
      socket.emit('allNpcs', NPCS);
      socket.broadcast.emit('createNPC', NPCS);

    }
    socket.on('disconnect', () => {
      io.emit('remove', socket.player.id);
    });
  });
});

const generateName = async () => {
  let name = await axios.get("https://random-word-api.herokuapp.com/word");

  while (!name.data) {
    name = await axios.get("https://random-word-api.herokuapp.com/word");
  }
  return name.data[0]
}

const getAllPlayers = () => {
  let players = [];
  Object.keys(io.sockets.connected).forEach((socketID) => {
    const player = io.sockets.connected[socketID].player;
    if (player) players.push(player);
  });
  console.log(players)
  return players;
};

const decodeToken = async (token) => {
  return await jwt_decode(token);
};

const creteTokenEmitMessage = async (socketID) => {
  const player = { id: server.lastPlayderID, socketID: socketID };
  const playerToken = jwt.sign(
    player,
    process.env.PLAYER_TOKEN_SECRET,
  );
  return playerToken;
};

const updatePlayerServerPosition = async (player, direction, range) => {
  var connectedPlayer = io.sockets.connected[player];
  if (connectedPlayer == null)
    return;

  switch (direction) {
    case 'up':
      connectedPlayer.player.y -= range;
      break;
    case 'down':
      connectedPlayer.player.y += Number(range);
      break;
    case 'right':
      connectedPlayer.player.x += Number(range);
      break;
    case 'left':
      connectedPlayer.player.x -= Number(range);
      break;
    default:
      break;
  }
};

const getPlayerServerPosition = async (player) => {
  var connectedPlayer = io.sockets.connected[player];
  console.log(connectedPlayer);
  var playerPos = {
    "x": connectedPlayer.player.x,
    "y": connectedPlayer.player.y
  }
  return playerPos;
};

const getJoke = async () => {
  let jokeResponse = await axios.get(process.env.JOKE_URL);

  while (!jokeResponse.data.joke) {
    jokeResponse = await axios.get(process.env.JOKE_URL);
  }
  return jokeResponse.data.joke
}

const createNPC = (queryID) => {
  const newNPC = {
    id: 1000 + queryID,
    x: 400,
    y: 500
  }

  NPCS.push(newNPC);
}
