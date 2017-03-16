function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    scaleBy = 3;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game, spritesheet) {
    this.spritesheet = spritesheet;
    Entity.call(this, game, 0, 0);
    this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.drawImage(this.spritesheet, 1845, 5, 325, 220, this.x, this.y,
        ctx.canvas.width, ctx.canvas.height);
    Entity.prototype.draw.call(this);
}

function Luigi(game) {
    this.animation = new Animation(AM.getAsset("./img/characters.png"), 80, 64, 17, 38, 0.1, 4, true, true);
    this.jumpAnimation = new Animation(AM.getAsset("./img/characters.png"), 356, 64, 18, 40, 0.15, 5, false, true);
    this.jumping = false;
    this.radius = 50;
    this.ground = 530;
    this.speed = 100;
    this.count = 0;
    Entity.call(this, game, 200, 530);
}

Luigi.prototype = new Entity();
Luigi.prototype.constructor = Luigi;

Luigi.prototype.draw = function (ctx) {
     if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34);
    }
    else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

Luigi.prototype.update = function () {
    if (this.game.space) this.jumping = true;
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 200;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }
    if ((this.count += 1) % 100 === 0) this.jumping = true;
    this.x += this.game.clockTick * this.speed;
    if (this.x > 1200) this.x = -230;
    Entity.prototype.update.call(this);
}

// Enemies
function Goomba(game) {
    this.animation = new Animation(AM.getAsset("./img/enemies.png"), 0, 0, 16, 40, 0.1, 2, true, true);
    this.splat = new Animation(AM.getAsset("./img/enemies.png"), 32, 0, 16, 40, 1.25, 1, false, true);
    this.dead = false;
    this.radius = 50;
    this.speed = 50;
    this.count = 0;
    Entity.call(this, game, 200, 530);
}

Goomba.prototype = new Entity();
Goomba.prototype.constructor = Goomba;

Goomba.prototype.draw = function (ctx) {
    if (this.dead) {
        this.splat.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

Goomba.prototype.update = function () {
    if (this.dead) {
        if (this.splat.isDone()) {
            this.splat.elapsedTime = 0;
            this.dead = false;
        }
        this.speed = 0;
    }
    else this.speed = 50;
    if ((this.count += 1) % 200 === 0) this.dead = true;
    this.x += this.game.clockTick * this.speed;
    if (this.x > 1200) this.x = -230;
    Entity.prototype.update.call(this);
}

function Plant(game) {
    this.animation = new Animation(AM.getAsset("./img/enemies.png"), 192, 70, 16, 30, 0.5, 2, true, true);
    this.radius = 50;
    Entity.call(this, game, 1040, 348);
}

Plant.prototype = new Entity();
Plant.prototype.constructor = Goomba;

Plant.prototype.draw = function (ctx) {
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

Plant.prototype.update = function () {
    Entity.prototype.update.call(this);
}


// the "main" code begins here

var AM = new AssetManager();

AM.queueDownload("./img/background.png");
AM.queueDownload("./img/characters.png");
AM.queueDownload("./img/enemies.png");

AM.downloadAll(function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var luigi = new Luigi(gameEngine);
    var goomba = new Goomba(gameEngine);
    var plant = new Plant(gameEngine);

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.png")));
    gameEngine.addEntity(luigi);
    gameEngine.addEntity(goomba);
    gameEngine.addEntity(plant);
 
    gameEngine.init(ctx);
    gameEngine.start();
    console.log("All Done!");
});