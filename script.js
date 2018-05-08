var gameOver = false;
var asteroidCount = 0;
var screenheight = 700; //default
var screenwidth = 300; //by default

var setIDspawn;
var setIDbullet;
var setIDmove;

var spawnSpeed = 2000; //spawn asteroid every 2 seconds
var spawnedMother = false;
$(document).ready(function() {
  screenheight = $(document).height();
  screenwidth = $(document).width();
  initGame();
  console.log('spaceship');
});
/*making the game awesome WIP*/
 function initKeyBoardTriggers() {
   $(document).keypress(function(event) {
     /* Act on the event */
     let key = event.keyCode;
     let keydirection;
     switch(key){
       case 38 : keydirection = 'up'; break;
       case 40 : keydirection = 'down'; break;
       case 37 : keydirection = 'left'; break;
       case 39 : keydirection = 'right'; break;
     }
     moveShip(keydirection);
   });
 }


function initGame(){
  var spaceship = $('#spaceship');
  initKeyBoardTriggers();
  $(document).on('tap', function(event){
    fireBullet();
  });

  $(document).on('swipeleft',function(event) {
    /* Act on the event */
    if(spaceship.offset().left > 16){
      console.log(spaceship.offset());
      moveShip('left');
    }
  });
  $(document).on('swiperight',function(event) {
    /* Act on the event */
    if(spaceship.offset().left+spaceship.width() < screenwidth){
      moveShip('right');
    }
  });
  setIDspawn = setInterval(function(){
    spawnAsteroids(asteroidCount++);
    if(boomCount > 15){
      spawnSpeed = 1000;
    }else if (boomCount >= 30 && !spawnedMother) {
      spawnedMother = true;
      spawnSpeed = 50;
      spawnMotherShip();
    }
  }, spawnSpeed);
}


function moveShip( direction){
  if(direction == 'right'){
    $('#spaceship').animate({'marginLeft': "+=100px"}, "fast");
  }else {
    $('#spaceship').animate({'marginLeft': "-=100px"}, "fast");
  }
}

function spawnAsteroids(asteroidCount){
  var asteroid = `<img src="img/ast.gif" alt="asteroid" class="asteroid" id="asteroid${asteroidCount}">`;
  $('#space-field').append(asteroid);
  var currentAsteroid = $(`#asteroid${asteroidCount}`);
  let offsetval = Math.random()*screenwidth;
  currentAsteroid.css('marginLeft', `+=${offsetval}px`);
  setIDmove = setInterval(function(){
    if(currentAsteroid.offset().top < screenheight){
      currentAsteroid.animate({'marginTop': "+=50px"}, "fast");
      checkShipCollision(currentAsteroid);
    }else{
      currentAsteroid.remove();
    }
  },200);

}
/*
*Checks to see if the asteroid has collided
*/
function checkShipCollision(asteroid){
  var spaceship = $('#spaceship');
  var spaceship_xLeft = spaceship.offset().left;
  var spaceship_xRight = spaceship.offset().left + spaceship.width();
  var spaceship_xTop = spaceship.offset().top;
  var spaceship_xBottom = spaceship.offset().top + spaceship.height();

  var asteroidBottom =  asteroid.offset().top + asteroid.height();
  var asteroidLeft = asteroid.offset().left;
  var asteroidRight = asteroid.offset().left + asteroid.width();

  //first condition is that the asteroid bottom must be more offset
  //than spaceship top
  if(asteroidBottom >= spaceship_xTop){
    //condition 2: the right or left of an asteroid
    //is in between the right and left of the spaceship
    let leftHit = asteroidLeft >= spaceship_xLeft && asteroidLeft <= spaceship_xRight;
    let rightHit = asteroidRight >= spaceship_xLeft && asteroidRight <= spaceship_xRight;
    if( leftHit || rightHit){
      endGame();
    }
  }
}
/*
* firing a bullet will occur from the center of the spaceship
* bullet will travel up using setInterval to change offset every .5 second.
* grab all asteroids and check to see if the bullet hits any of them.
* if it hits them then we get rid of the asteroid and bullet
*/
var bulletNum = 0;
function fireBullet(){
  var bullet = `<img src="img/laserbeam.png" alt="pews" class="pews" id="bullet${bulletNum}">`;
  let spaceship =$('#spaceship');
  let shipMiddleX = (spaceship.width()/2)+spaceship.offset().left -3;
  $('#space-ship-area').append(bullet);
  var currBullet = $(`#bullet${bulletNum++}`);
  currBullet.offset({left : shipMiddleX, top: spaceship.offset().top - currBullet.height() });

  var pewpew = document.getElementById("pewSound");
  pewpew.play();



  if(boomCount > 10){
    bulletNum++;
    let g1 = bulletNum;
    var greenlaser1 = `<img src="img/greenlaser.png" alt="pews" class="pews" id="bullet${g1}">`;
    bulletNum++;
    let g2 = bulletNum;
    var greenlaser2 = `<img src="img/greenlaser.png" alt="pews" class="pews" id="bullet${g2}">`;
    bulletNum++;

    $('#space-ship-area').append(greenlaser1);
    $('#space-ship-area').append(greenlaser2);

    var leftBullet = $(`#bullet${g1}`);
    var rightBullet = $(`#bullet${g2}`);

    leftBullet.offset({left: spaceship.offset().left, top: spaceship.offset().top - leftBullet.height()});
    rightBullet.offset({left: spaceship.offset().left+spaceship.width(), top: spaceship.offset().top - rightBullet.height()});
    moveMultipleBullets(leftBullet, currBullet, rightBullet);
  }else{
    moveBullet(currBullet);
  }
}
function moveBullet(currBullet){
  setIDbullet = setInterval(function(){
    moveBulletUp(currBullet);
  }, 10);
}
function moveBulletUp(currBullet){
  currBullet.offset({left: currBullet.offset().left, top: currBullet.offset().top-40});
  if(currBullet.offset().top < 0){
    currBullet.remove();
  }else{
    var bulletTip = currBullet.offset().top;
    var bulletBody = currBullet.offset().left+ (currBullet.width()/2);

    $(".asteroid").each(function(){
      var collision = checkCollision(bulletTip, bulletBody, $(this));

      if(collision){
        currBullet.remove();
        var topBoom = $(this).offset().top;
        var leftBoom = $(this).offset().left;
        $(this).remove();
        setBoom(topBoom, leftBoom);
      }
    });
    $(".mothership").each(function(){
      var collision = checkCollision(bulletTip, bulletBody, $(this));

      if(collision){
        currBullet.remove();
        mothershipHealth--;
        if(mothershipHealth == 0){
          var topBoom = $(this).offset().top;
          var leftBoom = $(this).offset().left;
          $(this).remove();
          setBoom(topBoom, leftBoom);
          boomCount += 30;
        }
      }
    });


  }
}
function checkCollision(bulletTip, bulletBody,asteroid){
  if(asteroid.offset().top >= bulletTip){
    let hit = bulletBody >= asteroid.offset().left && bulletBody <= asteroid.offset().left+ asteroid.width();
    if(hit){
      return true;
    }
  }
  return false;
}
var boomCount = 0;
var boomboom;
function setBoom(topB, leftB){
  boomboom = document.getElementById("boomSound");
  boomboom.play();
  var boom = `<image src="img/boomgif.gif" alt="boom" class="boom" id="boom${boomCount}">`;
  $('#space-field').append(boom);
  var explosion = $(`#boom${boomCount++}`);
  explosion.offset({top: topB, left: leftB});
  setTimeout(function(){
    explosion.remove();
  },1300);
}

function endGame(){
  if(!gameOver){
    explodeship();
    gameOver = true;
  }

  stopProcesses();
  $.mobile.changePage('#endgame');

  $('#score').html('Your Score is: '+boomCount );
  $('#playAgain').click(function(event) {
    /* Act on the event */
    $.mobile.changePage('#main-screen');
    location.reload(true);
  });
}

function explodeship(){
  var spaceship = $('#spaceship');
  var sTop = spaceship.offset().top;
  var sLeft = spaceship.offset().left;
  setBoom(sTop, sLeft);
}

//cleans up all processes
function stopProcesses(){
  clearInterval(setIDspawn);
  clearInterval(setIDmove);
  clearInterval(setIDbullet);

}
function moveMultipleBullets(leftNode, middleNode, rightNode){
  console.log(middleNode);
  setIDbullet = setInterval(function(){
    move3BulletUp(leftNode,middleNode,rightNode);
  }, 15);
}
function move3BulletUp(leftNode, middleNode, rightNode){
  moveBulletUp(leftNode);
  moveBulletUp(middleNode);
  moveBulletUp(rightNode);
}

/////////////////////////////////////////

/*
* we do the extra stuff now. spawn a mothership that while active
* spawns a shit ton of asteroids. spawn speed is at every .3 seconds.
*/
var mothershipHealth = 0;
function spawnMotherShip(){
  let mothershipImage = `<image src="img/Mothership.png"
   alt="mothership" class="mothership" id="mothership">`;
   $('#space-field').append(mothershipImage);
   mothershipHealth = 30;
  let mothership = $('#mothership');



}
