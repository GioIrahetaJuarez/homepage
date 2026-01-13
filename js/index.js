function resizeScreen() {
   centerHorz = canvasContainer.width() / 2 ; // Adjusted for drawing logic
   centerVert = canvasContainer.height()/ 2; // Adjusted for drawing logic
   console.log("Resizing...");
   resizeCanvas(canvasContainer.width(), canvasContainer.height());
}

//Difraction

//---------------------------------------------------------------
class Quad{
   constructor(tile_x, tile_y, tile_width, tile_height){
     this.x = tile_x;
     this.y = tile_y;
     this.w = tile_width;
     this.h = tile_height;
   }
 }

 //-------------------------------------------------------------------------------
 
 let pic;
 
 function preload() {
   pic = loadImage('../img/gallery/portrait_photo.jpg');
   console.log(pic);
 }
 
let imageOffsetX = 0; // Add at top of file
let imageOffsetY = 0;

function setup() {
  let scaleFactor = 5;
  canvasContainer = $("#canvas-container");
  w = canvasContainer.width();
  h = canvasContainer.height();
  let canvas = createCanvas(w, h);
  canvas.parent(canvasContainer[0]);
  resizeScreen();

  Tile = new Quad(0, 0, 50, 50);
  
  // NOW pic is loaded, so pic.width and pic.height are available
  let sourceSize = 100 * scaleFactor;
  let centerOffsetX = (pic.width - sourceSize) / 2;
  let centerOffsetY = (pic.height - sourceSize) / 2;
  
  Source = new Quad(centerOffsetX, centerOffsetY, sourceSize, sourceSize);
  Destination = new Quad(0, 0, 30, 30);
}

// Then you can adjust with arrow keys or mouse
function keyPressed() {
  if (keyCode === LEFT_ARROW) imageOffsetX -= 10;
  if (keyCode === RIGHT_ARROW) imageOffsetX += 10;
  if (keyCode === UP_ARROW) imageOffsetY -= 10;
  if (keyCode === DOWN_ARROW) imageOffsetY += 10;
}

 //Diffract part of image and place somewhere
 function diffract(Tile, Src, Dest){
   /*
   -----------
   | Q1 | Q2 |
   |----+----|  
   | Q3 | Q4 |
   -----------
   */
   let origin_x = Tile.x, origin_y = Tile.y;
   //Q1
   push()
     translate(origin_x, origin_y);
     image(pic, Dest.x, Dest.y, Dest.w, Dest.h, Src.x, Src.y, Src.w, Src.h, COVER);
   pop()
   
   //Q2
   push();
     translate(origin_x + Tile.w, origin_y);
     scale(-1, 1);
     image(pic, Dest.x, Dest.y, Dest.w, Dest.h, Src.x, Src.y, Src.w, Src.h, COVER);
   pop();
   
   //Q3
   push();
     translate(origin_x, origin_y + Tile.h);
     scale(1, -1);
     image(pic, Dest.x, Dest.y, Dest.w, Dest.h, Src.x, Src.y, Src.w, Src.h, COVER);
   pop();
   
   //Q4
   push();
     translate(origin_x + Tile.w, origin_y + Tile.h);
     scale(-1, -1);
     image(pic, Dest.x, Dest.y, Dest.w, Dest.h, Src.x, Src.y, Src.w, Src.h, COVER);
   pop();
 }
 
 function draw() {
   for(let i=0; i < w; i += Tile.w){
     for(let j=-0; j < h; j += Tile.h){
         movingSource = Source
         movingSource.y = Source.y + 2 * sin(mouseY * 0.01);
         movingSource.x = Source.x + 2 * sin(mouseX * 0.01);
         diffract(Tile, movingSource, Destination);
         Tile.y = j;
         Source.y = j;
     }
     Tile.x = i;
     Source.x = i;
   }
 }
 