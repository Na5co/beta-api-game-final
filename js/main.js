var config = {
  type: Phaser.AUTO,
  width: 1100,
  height: 920,
  title: 'Postman Game',
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 100 },
      debug: true,
    },
  },
};

var game = new Phaser.Game(config);

game.state.add('Game', Game);
game.state.start('Game');
