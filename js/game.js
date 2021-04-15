const Game = {};

Game.init = function () {
  game.stage.disableVisibilityChange = true;
};

Game.preload = function () {
  game.load.tilemap(
    'map',
    'assets/map/serene/tilemap-serene.json',
    null,
    Phaser.Tilemap.TILED_JSON,
  );
  game.load.spritesheet(
    'tileset',
    'assets/map/serene/tilesheet.png',
    16,
    16,
  );
  game.load.spritesheet(
    'spaceman',
    'assets/sprites/spaceman.png',
    48,
    64,
    12,
  );

  game.load.spritesheet(
    'hero',
    'assets/sprites/Hero.png',
    16,
    16,
    24,
  );
  // game.load.image('sprite', 'assets/sprites/sprite.png');
};


Game.create = function () {
  Game.playerMap = {};

  map = game.add.tilemap('map');
  map.addTilesetImage('tilesheet', 'tileset');

  var layer;
  for (var i = 0; i < map.layers.length; i++) {
    layer = map.createLayer(i);
    layer.scale.set(3.45);
  }


  Client.askNewPlayer();
};

Game.update = function () { };

Game.addNewPlayer = function (id, x, y) {
  createAnims(id, x, y);
};

Game.createNPC = function (id, x, y) {
  createAnims(id, x, y);
};

Game.playAnimation = (id, direction) => {
  playAnims(id, direction);
};

Game.movePlayer = function (id, x, y) {
  let player = Game.playerMap[id];
  const distance = Phaser.Math.distance(player.x, player.y, x, y);
  const tween = game.add.tween(player);
  const duration = distance * 6;

  tween.to({ x: x, y: y }, duration);
  tween.start();
};

Game.drawText = (player, textPos, textColor) => {
  let playerPostion = Game.getPlayerPosition(player.id);
  var style = { font: '15pt Arial', fill: textColor, align: 'left', wordWrap: true, wordWrapWidth: 450 };

  let playerMSG = Game.add.text(
    playerPostion.x,
    playerPostion.y - textPos,
    player.message,
    style
  );
  setTimeout(hideText, 4500, playerMSG);
};

const hideText = (text) => {
  text.visible = false;
};
Game.getPlayerPosition = function (id) {
  const player = Game.playerMap[id];
  let playerPosition = {
    x: player.x,
    y: player.y,
  };
  return playerPosition;
};

Game.removePlayer = function (id) {
  Game.playerMap[id].destroy();
  delete Game.playerMap[id];
};

const createAnims = (id, x, y) => {
  if (id >= 1000) {
    Game.playerMap[id] = game.add.sprite(x, y, 'spaceman');
    Game.playerMap[id].animations.add('walkright', [3, 4, 5], true);
    Game.playerMap[id].animations.add('walkleft', [9, 10, 11], true);
    Game.playerMap[id].animations.add('walkup', [0, 1, 2], true);
    Game.playerMap[id].animations.add('walkdown', [6, 7, 8], true);
  }
  else {
    Game.playerMap[id] = game.add.sprite(x, y, 'hero');
    Game.playerMap[id].animations.add('walkright', [12, 13, 14, 15], true);
    Game.playerMap[id].animations.add('walkleft', [8, 9, 10, 11], true);
    Game.playerMap[id].animations.add('walkup', [0, 1, 2, 3], true);
    Game.playerMap[id].animations.add('walkdown', [4, 5, 6, 7], true)

    Game.playerMap[id].scale.setTo(2.5);
  }
};

const playAnims = (id, direction) => {
  switch (direction) {
    case 'up':
      Game.playerMap[id].animations.play('walkup');
      break;
    case 'right':
      Game.playerMap[id].animations.play('walkright');
      break;
    case 'left':
      Game.playerMap[id].animations.play('walkleft');
      break;
    case 'down':
      Game.playerMap[id].animations.play('walkdown');
    default:
      Game.playerMap[id].animations.play('walkdown');
  }
};
