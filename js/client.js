var Client = {};
Client.socket = io.connect();

Client.askNewPlayer = function () {
  Client.socket.emit('newplayer');
};

Client.socket.on('private', function (msg) {
  document.getElementById('myText').innerHTML = msg;
});


Client.socket.on('createNPC', function (npcs) {
  let newNPC = npcs[npcs.length - 1]
  Game.createNPC(newNPC.id, newNPC.x, newNPC.y);

});

Client.socket.on('newplayer', function (data) {
  Game.addNewPlayer(data.id, data.x, data.y);
});

Client.socket.on('move', function (data) {
  Game.playAnimation(data.id, data.direction);

  let playerPosition = Game.getPlayerPosition(data.id),
    newPlayerPosition = {
      x: playerPosition.x,
      y: playerPosition.y,
    };

  if (data.direction == 'right') {
    newPlayerPosition['x'] = playerPosition.x + Number(data.steps);
  } else if (data.direction == 'left') {
    newPlayerPosition.x = playerPosition.x - data.steps;
  } else if (data.direction == 'up') {
    newPlayerPosition.y = playerPosition.y - Number(data.steps);
  } else if (data.direction == 'down') {
    newPlayerPosition.y = playerPosition.y + Number(data.steps);
  }

  Game.movePlayer(data.id, newPlayerPosition.x, newPlayerPosition.y);
});

Client.socket.on('reset', function (data) {

  // let playerPosition = Game.getPlayerPosition(data.id),
  //   newPlayerPosition = {
  //     x: playerPosition.x,
  //     y: playerPosition.y,
  //   };


  Game.movePlayer(data.id, 200, 300);
});

Client.socket.on('move-npc', function (data) {
  Game.playAnimation(data.id, data.direction);


  let playerPosition = Game.getPlayerPosition(data.id),
    newPlayerPosition = {
      x: playerPosition.x,
      y: playerPosition.y,
    };

  if (data.direction == 'right') {
    newPlayerPosition['x'] = playerPosition.x + Number(data.steps);
  } else if (data.direction == 'left') {
    newPlayerPosition.x = playerPosition.x - data.steps;
  } else if (data.direction == 'up') {
    newPlayerPosition.y = playerPosition.y - Number(data.steps);
  } else if (data.direction == 'down') {
    newPlayerPosition.y = playerPosition.y + Number(data.steps);
  }

  Game.movePlayer(data.id, newPlayerPosition.x, newPlayerPosition.y);
});

Client.socket.on('message', function (data) {
  Game.drawText(data, 25, "black");
});

Client.socket.on('joke', function (data) {
  console.log(data)
  Game.drawText(data, 130, "white");
});

Client.socket.on('allplayers', function (data) {
  for (var i = 0; i < data.length; i++) {
    Game.addNewPlayer(data[i].id, data[i].x, data[i].y);
  }
  Client.socket.on('remove', function (id) {
    Game.removePlayer(id);
  });
});

Client.socket.on('allNpcs', function (data) {
  for (var i = 0; i < data.length - 1; i++) {
    Game.createNPC(data[i].id, data[i].x, data[i].y);
  }

});
