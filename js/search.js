import data from '../img/img.json' with {type: 'json'};

let container = null;

// Generating images ----------------------------------------------
function populate() {

    //Creating the root
    container = document.createElement('div');
    container.id = 'container';
    document.body.append(container);

    let unique_group = ['gallery'];
    for (let obj of data) {
        if (!(unique_group.includes(obj.medium))) {
            createSection(obj);
            unique_group.push(obj.medium);
        }
        // Adding image
        let section = document.getElementById(obj.medium);
        let item = document.createElement('div');
        const img = document.createElement('img');
        img.src = '../' + obj.url;
        img.alt = obj.title;
        
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


// Group will be populated with Items according to tag: 
// Medium
// Color
// Date
// Similarity -- maybe
// Emotion? 

//----------------------------------------------------------------------------------------------------------------------------------
// Export the state object
export default {
    name: 'Gallery',
    enter() {
       populate();
    },
    update() {},
    exit() {
        container.remove();
    }
};