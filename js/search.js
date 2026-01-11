import data from '../img/img.json' with {type: 'json'};

// Generating images ----------------------------------------------
function populate() {
    let unique_group = ['gallery'];
    for (let obj of data) {
        if (!(unique_group.includes(obj.medium))) {
            createSection(obj);
            unique_group.push(obj.medium);
            console.log(unique_group);
        }
        // Adding image
        let section = document.getElementById(obj.medium);
        let item = document.createElement('div');
        const img = document.createElement('img');
        img.src = '../' + obj.url;
        img.alt = obj.title;
        console.log(obj.url);
        
        // Add click event for fullscreen
        img.addEventListener('click', () => {
            const dialog = document.createElement('dialog');
            dialog.innerHTML = `
                <img src="${img.src}" alt="${obj.title}">
                <button class="close-dialog">×</button>
            `;
            document.body.appendChild(dialog);
            dialog.showModal();
            
            // Close on button click
            dialog.querySelector('.close-dialog').addEventListener('click', () => {
                dialog.close();
                dialog.remove();
            });
            
            // Close on click outside
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    dialog.close();
                    dialog.remove();
                }
            });
        });
        item.appendChild(img);
        item.classList.add('photo-item');
        section.append(item);
    }
}

function createSection(obj) {
        const section = document.createElement('div');
        section.classList.add('section');
        const text = document.createElement('h2');
        text.textContent = obj.medium;
        text.classList.add('section-title');
        const grid = document.createElement('h2');
        grid.classList.add('photo-grid');
        section.append(text,grid);
        grid.id = obj.medium;
        container.append(section);
}

populate()

// Group will be populated with Items according to tag: 
// Medium
// Color
// Date
// Similarity -- maybe
// Emotion? 

//----------------------------------------------------------------------------------------------------------------------------------
// // Toggle between different view modes
// const toggleButtons = document.querySelectorAll('.toggle-button');
// const helpGrid = document.getElementById('help-grid');
// const categoryGrid = document.getElementById('category-grid');
// const todoGrid = document.getElementById('todo-grid');

// // Function to set random positions for color mode
// function setRandomPositions() {
//     const container = document.querySelector('.container');
//     const containerWidth = container.offsetWidth;
//     const containerHeight = window.innerHeight - 200; // Adjust for bottom elements
    
//     // Clear any existing random positioned elements
//     const existingRandomItems = document.querySelectorAll('.random-position');
//     existingRandomItems.forEach(item => {
//         item.classList.remove('random-position');
//         item.style.left = '';
//         item.style.top = '';
//         item.style.transform = '';
//     });
    
//     // Create new set of random elements
//     const allPhotoItems = document.querySelectorAll('.photo-item');
    
//     if (currentMode === 'color') {
//         allPhotoItems.forEach(item => {
//             item.classList.add('random-position');
            
//             // Random position within container
//             const randomX = Math.floor(Math.random() * (containerWidth - 100));
//             const randomY = Math.floor(Math.random() * (containerHeight - 100));
//             const randomRotation = Math.floor(Math.random() * 30) - 15; // -15 to +15 degrees
            
//             item.style.left = `${randomX}px`;
//             item.style.top = `${randomY}px`;
//             item.style.width = '100px';
//             item.style.height = '100px';
//             item.style.paddingBottom = '0';
//             item.style.transform = `rotate(${randomRotation}deg)`;
//         });
//     } else {
//         allPhotoItems.forEach(item => {
//             item.style.width = '';
//             item.style.height = '';
//             item.style.paddingBottom = '100%';
//             item.style.transform = '';
//         });
//     }
// }

// // Function to arrange by categories
// function arrangeByCategoriesGrid() {
//     const grids = [helpGrid, categoryGrid, todoGrid];
    
//     grids.forEach(grid => {
//         grid.className = 'photo-grid-categories';
//     });
// }

// // Function for default grid
// function arrangeByDefaultGrid() {
//     const grids = [helpGrid, categoryGrid, todoGrid];
    
//     grids.forEach(grid => {
//         grid.className = 'photo-grid-default';
//     });
// }

// // Track current mode
// let currentMode = 'default';

// // Add click event listeners to toggle buttons
// toggleButtons.forEach(button => {
//     button.addEventListener('click', () => {
//         // Remove active class from all buttons
//         toggleButtons.forEach(btn => btn.classList.remove('active'));
        
//         // Add active class to clicked button
//         button.classList.add('active');
        
//         // Get the mode from button's data attribute
//         const mode = button.getAttribute('data-mode');
//         currentMode = mode;
        
//         // Apply the appropriate layout
//         if (mode === 'default') {
//             arrangeByDefaultGrid();
//         } else if (mode === 'categories') {
//             arrangeByCategoriesGrid();
//         } else if (mode === 'color') {
//             setRandomPositions();
//         }
//     });
// });

// // Initial layout
// arrangeByDefaultGrid();

// // Handle window resize for color layout
// window.addEventListener('resize', () => {
//     if (currentMode === 'color') {
//         setRandomPositions();
//     }
// });