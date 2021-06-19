// seleccionar elemento de lienzo
const canvas = document.getElementById("pong");

// getContext of canvas = métodos y propiedades para dibujar y hacer muchas cosas en el lienzo
const ctx = canvas.getContext('2d');

// cargar sonidos
let hit = new Audio();
let wall = new Audio();
let userScore = new Audio();
let comScore = new Audio();

hit.src = "sonido/comienzo.mp3";
wall.src = "sonido/rebote.mp3";
comScore.src = "sonido/perdida.mp3";
userScore.src = "sonido/partida.mp3";

// Objeto de bola
const ball = {
    x : canvas.width/2,
    y : canvas.height/2,
    radius : 10,
    velocityX : 5,
    velocityY : 5,
    speed : 7,
    color : "WHITE"
}

// Paleta de usuario
const user = {
    x : 0, // lado izquierdo del lienzo
    y : (canvas.height - 100)/2, // -100 la altura de la paleta
    width : 10,
    height : 100,
    score : 0,
    color : "WHITE"
}

// Paleta COM
const com = {
    x : canvas.width - 10, // - ancho de la paleta
    y : (canvas.height - 100)/2, // -100 la altura de la paleta
    width : 10,
    height : 100,
    score : 0,
    color : "WHITE"
}

// NET
const net = {
    x : (canvas.width - 2)/2,
    y : 0,
    height : 10,
    width : 2,
    color : "WHITE"
}

// dibujar un rectángulo, se usará para dibujar paletas
function drawRect(x, y, w, h, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// dibujar círculo, se utilizará para dibujar la bola
function drawArc(x, y, r, color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
}

// escuchando el raton
canvas.addEventListener("mousemove", getMousePos);

function getMousePos(evt){
    let rect = canvas.getBoundingClientRect();
    
    user.y = evt.clientY - rect.top - user.height/2;
}

// cuando COM o USER marca, reiniciamos la pelota
function resetBall(){
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

// dibujar la red
function drawNet(){
    for(let i = 0; i <= canvas.height; i+=15){
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// dibujar texto
function drawText(text,x,y){
    ctx.fillStyle = "#FFF";
    ctx.font = "75px fantasy";
    ctx.fillText(text, x, y);
}

// detección de colisiones
function collision(b,p){
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;
    
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;
    
    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

// función de actualización, la función que hace todos los cálculos
function update(){
    
    // cambiar el puntaje de los jugadores, si la pelota va a la izquierda "ball.x <0" computadora gana, de lo contrario si "ball.x> canvas.width" el usuario gana
    if( ball.x - ball.radius < 0 ){
        com.score++;
        comScore.play();
        resetBall();
    }else if( ball.x + ball.radius > canvas.width){
        user.score++;
        userScore.play();
        resetBall();
    }
    
    // la pelota tiene una velocidad
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // la computadora juega por sí misma, y ​​debemos ser capaces de vencerla
    // IA simple
    com.y += ((ball.y - (com.y + com.height/2)))*0.1;
    
    // cuando la bola choca con las paredes superior e inferior, invertimos la velocidad y.
    if(ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height){
        ball.velocityY = -ball.velocityY;
        wall.play();
    }
    
    // comprobamos si la paleta golpea al usuario o la paleta com
    let player = (ball.x + ball.radius < canvas.width/2) ? user : com;
    
    // si la pelota golpea una paleta
    if(collision(ball,player)){
        // play sound
        hit.play();
        // comprobamos donde la pelota golpea la paleta
        let collidePoint = (ball.y - (player.y + player.height/2));
        // normalizar el valor de collidePoint, necesitamos obtener números entre -1 y 1.
        // -player.height / 2 <collide Point <player.height / 2
        collidePoint = collidePoint / (player.height/2);
        
        // cuando la pelota golpea la parte superior de una paleta, queremos que la pelota tome un ángulo de -45 grados
        // cuando la pelota golpea el centro de la paleta, queremos que la pelota tome un ángulo de 0 grados
        // cuando la pelota golpea la parte inferior de la paleta, queremos que la pelota tome 45 grados
        // Math.PI / 4 = 45 grados
        let angleRad = (Math.PI/4) * collidePoint;
        
        // cambiar la dirección de la velocidad X e Y
        let direction = (ball.x + ball.radius < canvas.width/2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
        // acelera la pelota cada vez que una paleta la golpea.
        ball.speed += 0.1;
    }
}

// función de render, la función que hace todo el dibujo
function render(){
    
    // limpiar el lienzo
    drawRect(0, 0, canvas.width, canvas.height, "#000");
    
    // dibuja la puntuación del usuario a la izquierda
    drawText(user.score,canvas.width/4,canvas.height/5);
    
    // dibuja la puntuación COM a la derecha
    drawText(com.score,3*canvas.width/4,canvas.height/5);
    
    // dibujar la red
    drawNet();
    
    // dibujar la paleta del usuario
    drawRect(user.x, user.y, user.width, user.height, user.color);
    
    // dibujar la paleta de la COM
    drawRect(com.x, com.y, com.width, com.height, com.color);
    
    // sacar la pelota
    drawArc(ball.x, ball.y, ball.radius, ball.color);
}
function game(){
    update();
    render();
}
// número de fotogramas por segundo
let framePerSecond = 50;

//llamar a la función del juego 50 veces cada 1 segundo
let loop = setInterval(game,1000/framePerSecond);

