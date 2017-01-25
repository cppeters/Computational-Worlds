var AM = new AssetManager();

function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth,
					frameDuration, frames, loop, scale) {
	this.spriteSheet = spriteSheet;
	this.frameWidth = frameWidth;
	this.frameDuration = frameDuration;
	this.frameHeight = frameHeight;
	this.sheetWidth = sheetWidth;
	this.frames = frames;
	this.totalTime = frameDuration * frames;
	this.elapsedTime = 0;
	this.loop = loop;
	this.scale = scale;
}

Animation.prototype.currentFrame = function() {
	return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
	return (this.elapsedTime >= this.totalTime);
}

Animation.prototype.drawFrame = function(tick, ctx, x, y) {
	this.elapsedTime += tick;
	if (this.isDone()) {
		if(this.loop) this.elapsedTime = 0;
	}
	var frame = this.currentFrame();
	var xindex = 0;
	var yindex = 0;
	xindex = frame % this.sheetWidth;
	yindex = Math.floor(frame / this.sheetWidth);

	ctx.drawImage(this.spriteSheet,
		xindex * this.frameWidth, yindex * this.frameHeight,
		this.frameWidth, this.frameHeight,
		x, y, 
		this.frameWidth * this.scale,
		this.frameHeight * this.scale);
}

// inheritence
function Skeleton(game, spritesheet) {
	this.animation = new Animation(spritesheet, 256, 258, 35, 0.1, 175,
		true, 0.5);
	this.speed = 150;
	this.ctx = game.ctx;
	Entity.call(this, game, 300, 150);
}

Skeleton.prototype = new Entity();
Skeleton.prototype.constructor = Skeleton;

Skeleton.prototype.update = function() {
	//this.x += this.game.clockTick * this.speed;
	//if (this.x > 800) this.x = -230;
	Entity.prototype.update.call(this);
}

Skeleton.prototype.draw = function() {
	this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
	Entity.prototype.draw.call(this);
}

AM.queueDownload("./img/background.png");
AM.queueDownload("./img/SkeletonArcher.png");

AM.downloadAll(function() {
	var canvas = document.getElementById("gameWorld");
	var ctx = canvas.getContext("2d");

	var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Skeleton(gameEngine, AM.getAsset("./img/SkeletonArcher.png")));

    console.log("All Done!");
});