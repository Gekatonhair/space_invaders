const FPS = 60;

const KEY_CODE = {
    'left': 37,
    'right': 39,
    'shot': 32
};

class Canvas {
    constructor() {
        this.width = 900;
        this.height = 700;
        this.offset = 20;
        this.bgcolor = 'black';
        this.game = true;
        this.level = 1;
        this.player;
        this.invadersArmy;
        this.bulletsArray = new Array();
        this.keyCodeArray = new Array();
        this.context;
    }

    objectsRender() {
        this.context.clearRect(0, 0, this.width, this.height);
        this.player.draw();
        this.invadersArmy.draw();
        for (var i = 0; i < this.bulletsArray.length; i++) {
            var bullet = this.bulletsArray[i];
            bullet.draw();
        };
    };
}

class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 50;
        this.height = 30;
        this.step = 10;//one step in px
        this.life = 3;
        this.score = 0;
        this.rateOfFire = 2;//shot per sec
        this.overcharge = false;
        this.x = (canvas.width - this.width) / 2;
        this.y = canvas.height - canvas.offset - this.height;
        this.image = new Image();
        //this.image.onload = function () {};
        this.image.src = 'images/player.png';
    }

    draw() {
        this.canvas.context.drawImage(this.image, this.x, this.y);
    };

    moveLeft() {
        if (this.x >= this.canvas.offset) {
            this.x -= this.step;
        }
    };

    moveRight() {
        if (this.x <= (this.canvas.width - this.canvas.offset - this.width)) {
            this.x += this.step;
        }
    };

    shot() {
        var audio = new Audio();
        audio.src = "sounds/shot.mp3";
        audio.play();
        this.overcharge = true;        
        var NewBullet = new Bullet(this);
        this.canvas.bulletsArray.push(NewBullet);
    };
}

class InvadersArmy {
    constructor(canvas) {
        this.canvas = canvas;
        this.countI = 11;//per ax x
        this.countJ = 5;//per ax y
        this.speed = 0.1;
        this.offset = 10;
        this.moveleft = false;
        this.array = new Array;
        for (var i = 0; i < this.countI; i++) {
            this.array[i] = new Array();
            for (var j = 0; j < this.countJ; j++) {
                var newInvader = new Invader(canvas);
                newInvader.x = canvas.offset + i * (newInvader.width + this.offset);
                newInvader.y = canvas.offset + j * (newInvader.height + this.offset);
                newInvader.masX = i;
                newInvader.masY = j;
                this.array[i][j] = newInvader;
            }//end for j
        }//end for i
    }

    draw() {
        for (var i = 0; i < this.countI; i++) {
            for (var j = 0; j < this.countJ; j++) {
                var invader = this.array[i][j];
                if (invader.live)
                    this.canvas.context.drawImage(invader.image, invader.x, invader.y);
            }//end for j
        }//end for i
    };

    behavior(offset, canvasW, canvasH) {
        var count = this.countI - 1;
        if (this.array[0][0].x <= offset) this.moveleft = false;//left element touch left border
        if (this.array[count][0].x + this.array[count][0].width >= canvasW - offset) this.moveleft = true;//right element touch right border
        for (var i = 0; i < this.countI; i++) {
            for (var j = 0; j < this.countJ; j++) {
                var invader = this.array[i][j];
                if (this.moveleft) invader.x -= invader.step;
                else invader.x += invader.step;
            }//end for j
        }//end for i
    };

    moveDown() {
        for (var i = 0; i < this.countI; i++) {
            for (var j = 0; j < this.countJ; j++) {
                var invader = this.array[i][j];
                if (invader.live) {
                    invader.y += invader.height;
                    if (invader.y + invader.height >= this.canvas.height - this.canvas.offset) {
                        this.canvas.game = false
                    };
                }
            }//end for j
        }//end for i
    };

    getRandomInvader() {
        var live = false, invader;
        var canvas = this.canvas;
        while (!live) {
            var randX = Math.round(Math.random() * (canvas.invadersArmy.countI - 1));
            var randY = Math.round(Math.random() * (canvas.invadersArmy.countJ - 1));
            invader = canvas.invadersArmy.array[randX][randY];
            live = invader.live;
        }
        return invader;
    }
}//#InvadersArmy class


class Invader {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 50;
        this.height = 35;
        this.step = 900 / 300;
        this.x;
        this.y;
        this.masX;//положение в массиве по оси Х
        this.masY;//положение в массиве по оси Y
        this.speed = 1;
        this.live = true;
        this.image = new Image();
        this.image.onload = function () { }
        this.image.src = 'images/invader.png';
    }

    shot() {
        var newBullet = new Bullet(this);
        newBullet.draw();
        this.canvas.bulletsArray.push(newBullet);
    };
}

class Bullet {
    constructor(owner) {//owner = player || invader
        this.owner = owner;
        this.width = 2;
        this.height = 10;
        this.step = 1;
        this.x = owner.x + owner.width / 2;
        this.y = owner.y + this.height;
        this.color = 'white';
        this.speed = 10;
    }

    draw() {        
        var context = this.owner.canvas.context;
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x, this.y - this.height);
        context.lineWidth = this.width;
        context.strokeStyle = this.color;
        context.stroke();
    };//draw
}

function playerHitInvader(bullet, canvas) {
    var result = false;
    for (var i = 0; i < canvas.invadersArmy.countI; i++) {
        for (var j = 0; j < canvas.invadersArmy.countJ; j++) {
            var invader = canvas.invadersArmy.array[i][j];
            if (invader.live) {
                if (bullet.y <= invader.y + invader.height) {
                    if ((bullet.x >= invader.x) && (bullet.x <= invader.x + invader.width)) {
                        var audio = new Audio();
                        audio.src = "sounds/invader_death.mp3";
                        audio.play();
                        canvas.player.score++;
                        $('#score')[0].innerHTML = 'score: ' + canvas.player.score;
                        invader.live = false;
                        result = true;
                        if (canvas.player.score == canvas.invadersArmy.countI * canvas.invadersArmy.countJ) alert('YOU WIN')
                        break;
                    }//axesX
                }//axesY
            }
        }//for j
    }//for i
    //console.log(result);
    return result;
}//end playerHitInvader

function invaderHitPlayer(bullet, canvas) {
    var result = false;
    if (bullet.y + bullet.height >= canvas.player.y) {
        if ((bullet.x >= canvas.player.x) && (bullet.x <= canvas.player.x + canvas.player.width)) {
            var audio = new Audio();
            audio.src = "sounds/player_death.mp3";
            audio.play();
            canvas.player.life--;
            $('#life')[0].innerHTML = 'life: ' + canvas.player.life;
            if (canvas.player.life == 0) canvas.game = false;
            result = true;
        }//axesX
    }//axesY
    return result;
}//end invaderHitPlayer

function update(canvas) {
    var bullet;
    canvas.invadersArmy.behavior(canvas.offset, canvas.width, canvas.height);

    for (var i = 0; i < canvas.bulletsArray.length;) {
        bullet = canvas.bulletsArray[i];
        //пулю выпустил игрок
        if (bullet.owner == canvas.player) {
            bullet.y -= bullet.step * bullet.speed;
            if (bullet.y < canvas.offset || playerHitInvader(bullet, canvas)) {
                canvas.bulletsArray.splice(i, 1);
            }
            else {
                i++;
            }
        }
        else {//пулю выпустил  враг
            bullet.y += bullet.step * bullet.speed;
            if (bullet.y > canvas.height - canvas.offset || invaderHitPlayer(bullet, canvas)) {
                canvas.bulletsArray.splice(i, 1);
            }
            else {
                i++;
            }
        }
    }//end for
    canvas.objectsRender();
}//end update

function keyboard(canvas) {
    $(window).keydown(function (event) {
        canvas.keyCodeArray[event.keyCode] = true;
    });
    $(window).keyup(function (event) {
        delete canvas.keyCodeArray[event.keyCode];
    });
}

function initGame() {
    var myCanvas = new Canvas();

    $('#canvas_div').append("<canvas id='space_invaders_canvas'></canvas>");
    $('#canvas_div').width(myCanvas.width);
    var canvasElement = $('#space_invaders_canvas');
    canvasElement.attr("height", myCanvas.height);
    canvasElement.attr("width", myCanvas.width);
    canvasElement.css("background-color", myCanvas.bgcolor);

    if (canvasElement && canvasElement[0].getContext) {
        var context = canvasElement[0].getContext('2d');
        if (context) {
            myCanvas.context = context;
            keyboard(myCanvas);
            newGame(myCanvas);
        }
    }
}

function newGame(canvas) {
    var timer = 0,
        plHitT = 0,//количесво кадров, прошедшее с момента последнего выстрела игрока
        enStepT = 0,//количесво кадров, прошедшее с момента "шага" армии захватчиков
        enHitT = 0;//количесво кадров, прошедшее с момента последнего выстрела захватчика


    function isPressed(keyCode) {
        return canvas.keyCodeArray[keyCode];
    }

    canvas.player = new Player(canvas);
    $('#life')[0].innerHTML = 'life: ' + canvas.player.life;
    canvas.invadersArmy = new InvadersArmy(canvas);
    $('#score')[0].innerHTML = 'score: ' + canvas.player.score;


    (function step() {
        if (canvas.game) {
            if (isPressed(KEY_CODE.left)) canvas.player.moveLeft(canvas);
            if (isPressed(KEY_CODE.right)) canvas.player.moveRight(canvas);
            if (isPressed(KEY_CODE.shot)) {
                if (!canvas.player.overcharge) {
                    plHitT = timer;
                    canvas.player.shot(canvas);
                }
            }
            //overchange of player - перезарядка
            if ((timer - plHitT) > FPS / canvas.player.rateOfFire) {
                console.log('overcharge = false');
                canvas.player.overcharge = false;
            }
            else {
                console.log('overcharge = true');
                canvas.player.overcharge = true;
            }

            //attack(move down) of invadersArmy
            if ((timer - enStepT) == FPS / canvas.invadersArmy.speed) {
                enStepT = timer;
                canvas.invadersArmy.moveDown(canvas);
            }

            //invader shot
            if ((timer - enHitT) == FPS) {
                enHitT = timer;
                const invader = canvas.invadersArmy.getRandomInvader();
                invader.shot(canvas);
            }

            update(canvas);
            timer++;

            window.requestAnimationFrame(step);
        }
        else alert('GAME OVER');
    }());   
}

$(document).ready(function () {
    initGame();
});

/*
(function () {//requestAnimationFrame
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame){
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame){
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());*/