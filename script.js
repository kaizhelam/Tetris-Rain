"use strict";
var phisics = {
    gravity: 900
}
function main() {
    self.canvas.width = window.innerWidth;
    self.canvas.height = window.innerHeight;
    Image.load("https://i.imgur.com/Lhyirum.png").then(function (spriteSheet) {
        Block.sprites = splitSpriteSheet(spriteSheet);
        startRainAnimation(self.canvas.getContext("2d"));
    });
}
window.onload = main;
function startRainAnimation(context) {
    var entities = [];
    var time = 0;

    function update(deltaTime) {
        context.clearRect(0, 0, innerWidth, innerHeight);
        time += deltaTime;
        if (time > 0.3) {
            pushRandomBlock(entities);
            time = 0;
        }
        entities.forEach((entity, i) => {
            entity.update(deltaTime);
            entity.render(context);

            if (entity.isUnderFloor()) {
                if (entity.isCollider) floorCollisionEffect(entity, entities);

                entities.splice(i, 1);
            }
        });
    }
    new Renderer(update).start();
}
function floorCollisionEffect(entity, entitiesArray) {
    for (var i = 0; i < randomInt(6, 12); ++i) {
        entitiesArray.push(new Block({
            velocity: new Vec2(randomInt(-100, 100), randomInt(-entity.velocity.y / 2 + 100, -entity.velocity.y / 2)),
            position: new Vec2(entity.position.x, entity.position.y),
            spriteIndex: entity.spriteIndex,
            isCollider: false,
            size: randomInt(5, 18)
        }))
    }
}
function pushRandomBlock(entitiesArray) {
    entitiesArray.push(new Block({
        velocity: new Vec2(randomInt(-18, 18), randomInt(100, 200)),
        position: new Vec2(randomInt(0, innerWidth - 30), - 30)
    }))
}
function splitSpriteSheet(spriteSheet) {
    var sprites = [];
    for (var i = 0; i < 500; ++i) {
        var buffer = document.createElement("canvas");
        buffer.width = 30;
        buffer.height = 30;

        var context = buffer.getContext("2d");
        context.drawImage(spriteSheet, i * 30, 0, 30, 30, 0, 0, 30, 30);
        sprites.push(buffer);
    }
    return sprites;
}
function randomInt(min, max) {
    return (Math.random() * (++max - min) + min) | 0;
}
Image.load = function (src) {
    return new Promise(resolve => {
        var img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
}
function Vec2(x = 0, y = 0) {
    this.x = x;
    this.y = y;
}
function Block({ velocity, position, spriteIndex = randomInt(0, 6), isCollider = true, size = 30 }) {
    this.position = position;
    this.size = new Vec2(size, size);
    this.spriteIndex = spriteIndex;
    this.velocity = velocity;

    this.isCollider = isCollider;
}
Block.prototype = {
    isUnderFloor() {
        return this.position.y + this.size.y > innerHeight;
    },

    update(deltaTime) {
        this.velocity.y += phisics.gravity * deltaTime;
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
    },

    render(context) {
        context.drawImage(Block.sprites[this.spriteIndex], this.position.x, this.position.y, this.size.x, this.size.y);
    }
}
Block.sprites = [];
function Renderer(callback) {
    this.lastTime = 0;
    this.deltaTime = 1 / 60;
    this.acumulatedTime = 0;

    this.updateProxy = ms => {
        this.acumulatedTime += (ms - this.lastTime) / 1000;

        if (this.acumulatedTime > 1) this.acumulatedTime = 1;
        while (this.acumulatedTime > this.deltaTime) {
            if (this.lastTime) callback(this.deltaTime);
            this.acumulatedTime -= this.deltaTime;
        }
        this.lastTime = ms;
        this.enqueue();
    }
}
Renderer.prototype = {
    enqueue() {
        requestAnimationFrame(this.updateProxy);
    },

    start() {
        this.enqueue();
    }
}
