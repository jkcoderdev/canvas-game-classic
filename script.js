const canvas = document.querySelector("#canvas");
canvas.width = canvas.getBoundingClientRect().width;
canvas.height = canvas.getBoundingClientRect().height;
const ctx = canvas.getContext("2d");

const rand = function(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

var main = (function() {
    let executed = false;
    return function() {
        if (!executed) {
            executed = true;
            let boardSize, speed, playerPos, foodPos, moves, timer, timerrunning, score, level, direction, running, delta, time_before, time_now;
        
            const ZERO = { x: 0, y: 0 }
            const UP = { x: 0, y: -1 }
            const DOWN = { x: 0, y: 1 }
            const LEFT = { x: -1, y: 0 }
            const RIGHT = { x: 1, y: 0 }
        
            const boardMargin = 10;
            const boardTilesGap = 0.12;
            
            let foodImg = new Image();
            foodImg.src = "food.png";
        
            function resetVariables() {
                boardSize = 5;
                speed = 1;
                score = 0;
                level = 1;
                running = true;
        
                playerPos = { x: rand(1, boardSize-2), y: rand(1, boardSize-2) };

                do {
                    foodPos = { x: rand(1, boardSize-2), y: rand(1, boardSize-2) };
                } while(foodPos.x == playerPos.x && foodPos.y == playerPos.y)

                moves = [];
                direction = ZERO;
        
                timer = 1;
                timerrunning = false;

                delta = 0;
                time_before = Date.now();
                time_now = Date.now();
            }
        
            resetVariables();
            draw();
        
            function draw() {
                requestAnimationFrame(draw);

                time_now = Date.now();
                delta += (time_now - time_before) / 1000;
                time_before = time_now;

                if(delta < 1/speed) return;

                delta %= 1/speed;

                console.log("tick");

                drawBoard();
                if(moves.length>0) {
                    direction = moves[0];
                    moves.shift();
                }
                playerPos.x += direction.x;
                playerPos.y += direction.y;
                if((playerPos.x<0)||(playerPos.x>=boardSize)||(playerPos.y<0)||(playerPos.y>=boardSize)||(!running)) { gameSummary(); running = false; return; }
                if((playerPos.x==foodPos.x)&&(playerPos.y==foodPos.y)&&timerrunning) {
                    score += Math.round(1000*timer*level*2, 1);
                    level += 1;
                    boardSize += 2;
                    speed *= 1.2;
                    foodPos = { x: rand(1, boardSize-2), y: rand(1, boardSize-2) }
                    playerPos.x += 1;
                    playerPos.y += 1;
                    do {
                        foodPos = { x: rand(1, boardSize-2), y: rand(1, boardSize-2) }
                    } while((playerPos.x==foodPos.x)&&(playerPos.y==foodPos.y))
                    timer = 1;
                    drawBoard();
                }
                drawFood();
                drawPlayer();
                drawStatistics();

                // setTimeout(draw, 1000/speed);
            }

            function gameSummary() {      
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                let w = canvas.width;
                let h = canvas.height;
                let scale = 20;
                ctx.fillStyle = "#ddd";
                let text = "Press SPACE to start new game";
                ctx.font = "bold "+h/scale+"px Segoe UI";
                ctx.fillText(text, (w-ctx.measureText(text).width)/2, (scale-1)/scale*h);
                scale -= 10;
                text = "Your score: "+score;
                ctx.font = "bold "+h/scale+"px Segoe UI";
                ctx.fillText(text, (w-ctx.measureText(text).width)/2, (h-h/scale)/2+h/(scale+10)-h/scale/2);
                scale += 5;
                text = "LEVEL "+level;
                ctx.font = "bold "+h/scale+"px Segoe UI";
                ctx.fillText(text, (w-ctx.measureText(text).width)/2, (h-h/scale)/2+h/(scale+10)+h/scale/2);
            }
        
            function drawBoard() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "rgba(255, 255, 255, .3)";
                for(let i=0; i<boardSize; i++) {
                    for(let j=0; j<boardSize; j++) {
                        let margin = boardMargin;
                        let w = (canvas.width-2*margin)/boardSize;
                        let h = (canvas.height-2*margin)/boardSize;
                        let gap = boardTilesGap;
                        ctx.fillRect((j+gap)*w+margin, (i+gap)*h+margin, w*(1-2*gap), h*(1-2*gap));
                    }
                }
            }

            function drawStatistics() {
                let w = canvas.width;
                let h = canvas.height;
                let scale = 25;
                ctx.fillStyle = "rgba(255, 255, 255, .4)";
                let text = "LEVEL "+level;
                ctx.font = "bold "+h/scale+"px Segoe UI";
                ctx.fillText(text, h/50, h/scale);
                text = "Score: "+score;
                ctx.font = "bold "+h/scale+"px Segoe UI";
                ctx.fillText(text, 49/50*w-ctx.measureText(text).width, h/scale);
            }
        
            function drawPlayer() {
                ctx.fillStyle = "rgba(0, 255, 100, .5)";
                let margin = boardMargin;
                let w = (canvas.width-2*margin)/boardSize;
                let h = (canvas.height-2*margin)/boardSize;
                ctx.fillRect(playerPos.x*w+margin, playerPos.y*h+margin, w, h);
            }

            function drawFood() {
                let margin = boardMargin;
                let w = (canvas.width-2*margin)/boardSize;
                let h = (canvas.height-2*margin)/boardSize;
                let img = foodImg;
                ctx.drawImage(img, foodPos.x*w+margin, foodPos.y*h+margin, w, h);
            }
        
            document.body.addEventListener("keydown", (event) => {
                if(!timerrunning) {
                    timerrunning = true;
                    setInterval(() => {
                        if(timerrunning) {
                            if(timer<=0.1) { timer = 0.1; }
                            else { timer -= 0.01 }
                        }
                    }, 100);
                }
                let key = event.code;
                if(moves.length<2) {
                    switch(key) {
                        case "ArrowUp":
                        case "KeyW":
                            if(moves.length>0) { if(moves[0]!=UP) moves.push(UP); }
                            else { if(direction!=UP) moves.push(UP); }
                            if(!timerrunning) timerrunning = true;
                            break;
                        case "ArrowDown":
                        case "KeyS":
                            if(moves.length>0) { if(moves[0]!=DOWN) moves.push(DOWN); }
                            else { if(direction!=DOWN) moves.push(DOWN); }
                            if(!timerrunning) timerrunning = true;
                            break;
                        case "ArrowLeft":
                        case "KeyA":
                            if(moves.length>0) { if(moves[0]!=LEFT) moves.push(LEFT); }
                            else { if(direction!=LEFT) moves.push(LEFT); }
                            if(!timerrunning) timerrunning = true;
                            break;
                        case "ArrowRight":
                        case "KeyD":
                            if(moves.length>0) { if(moves[0]!=RIGHT) moves.push(RIGHT); }
                            else { if(direction!=RIGHT) moves.push(RIGHT); }
                            if(!timerrunning) timerrunning = true;
                            break;
                    }
                }
                if((key=="Space")&&(!running)) { resetVariables(); draw(); running = true; }
            });
        }
    };
})();

main();