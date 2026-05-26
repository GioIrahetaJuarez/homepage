//Making of visible divs for debugging --------------------------------------------------
// let elements = document.getElementsByClassName("vis");
// console.log(elements);
// console.log(elements[0].style.backgroundColor)

// for (let x of elements){
//     r = Math.random() * 255;
//     g = Math.random() * 255;
//     b = Math.random() * 255;
//     x.style.backgroundColor = `rgb(${r},${g},${b})`;
// }


//Populating --------------------------------------------------------------------------

function createSlideContent(obj) {
        const page = document.createElement('div');
        page.classList.add('page vis');
        const image_container = document.createElement('div');
        image_container.classList.add('vis image_container');
        const thumbnail = document.createElement('img');
        thumbnail.classList.add('thumbnail');
        const marker = document.add('marker vis');

        const info = document.createElement("vis info");

        text.classList.add('section-title');
        const grid = document.createElement('h2');
        grid.classList.add('photo-grid');
        section.append(text,grid);
        grid.id = obj.medium;
        container.append(section);
}

//Scrollable Gallery-------------------------------------------------------------------
let array = document.getElementById("array");
let position = 0;
let line_break = document.querySelector(".line_break");
let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0;
let isHorizontalSwipe = false;

// Start at 0-100 and move negatively
// +------+------+------+
// |      |      |      |
// |      |      |      |
// |      |      |      |
// +------+------+------+
// 0      100    200    300
const artworks_num = document.querySelectorAll(".page").length;
const maxarray_pos = -((artworks_num - 1) * 100);

function goToPosition(nextPosition) {
    position = Math.max(maxarray_pos, Math.min(0, nextPosition));
    array.style.transform = `translateX(${position}vw)`;
    updateProgressIndicator();
}

function goToPreviousSlide() {
    if (position < 0) goToPosition(position + 100);
}

function goToNextSlide() {
    if (position > maxarray_pos) goToPosition(position - 100);
}

//Scroll
document.addEventListener('keydown',function(event) {
    let key = event.key;
    if (position < 0 && (key=='ArrowLeft' || key=='a')){
        goToPreviousSlide();
    }else if (position > maxarray_pos && (key == 'ArrowRight' || key == 'd')){
        goToNextSlide();
    }
})

//Mouse Events------------------------------------------------------

function toggleFullScreen(element) {

    if (!document.fullscreenElement) {
        // Enter fullscreen mode
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { /* Safari */
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE11 */
            element.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen mode
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
    }


//God i want you bad
function createProgressIndicator() {
    let circle = document.createElement('div');
    circle.className = 'progress-circle';
    line_break.appendChild(circle);
}

// Update circle position based on scroll position
function updateProgressIndicator() {
    let circle = document.querySelector('.progress-circle');
    let currentIndex = Math.abs(position / 100);
    let progressPercent = (currentIndex / (artworks_num - 1)) * 100;
    circle.style.left = `${progressPercent}%`;
}

createProgressIndicator();

//Click Event Listener --- class name returns an HTML collection - multiple elements
const img_nodelist = document.querySelectorAll(".thumbnail");
const left_arrow = document.getElementById("left");
const right_arrow = document.getElementById("right");
console.log(img_nodelist);

img_nodelist.forEach((img) => {
    let text = img.parentNode.nextElementSibling;
    let img_container = img.parentNode;
    let marker = img.nextElementSibling;
    let isExpanded = false;

    marker.addEventListener('click', (event) => {
        if(!isExpanded) {
            img_container.style.width = '40%'
            img_container.style.left = '25vw'
            text.style.visibility = 'visible'
            isExpanded = true;
        } else{
            img_container.style.width = '80%'
            img_container.style.left = '50vw'
            text.style.visibility = 'hidden'
            isExpanded = false;
        }
    })

    //The expansion event listener might have to be 
    //larger area than image container
    img.addEventListener('click', (event) => {
        if(!isExpanded) {
            console.log("Child")
            img_container.style.width = '40%'
            img_container.style.left = '25vw'
            text.style.visibility = 'visible'
            isExpanded = true;
        } else{
            console.log('HELLOW WORLD')
            toggleFullScreen(img);
        }
    })

})

left_arrow.addEventListener('click', (event) => {
    goToPreviousSlide();
})
right_arrow.addEventListener('click', (event) => {
    goToNextSlide();
})

array.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchCurrentX = touchStartX;
    isHorizontalSwipe = false;
}, { passive: true });

array.addEventListener('touchmove', (event) => {
    touchCurrentX = event.touches[0].clientX;
    const dx = touchCurrentX - touchStartX;
    const dy = event.touches[0].clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        isHorizontalSwipe = true;
        event.preventDefault();
    }
}, { passive: false });

array.addEventListener('touchend', () => {
    if (!isHorizontalSwipe) return;

    const dx = touchCurrentX - touchStartX;
    const swipeThreshold = window.innerWidth * 0.15;

    if (dx < -swipeThreshold) {
        goToNextSlide();
    } else if (dx > swipeThreshold) {
        goToPreviousSlide();
    }
})
