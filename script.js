const categoryButtons = document.querySelectorAll('.category-item, .closet-section');
const cameraButton = document.getElementById('cameraButton');
const saveButton = document.getElementById('saveButton');
const generateButton = document.getElementById('generateButton');
const photoInput = document.getElementById('photoInput');
const messageBox = document.getElementById('messageBox');
const closetGrid = document.getElementById('closetGrid');

let selectedCategory = null;
let hasGeneratedFit = false;

const closetData = {
    Headwear: [],
    Tops: [],
    Bottoms: [],
    Layers: [],
    Shoes: []
};

let pulseTimeout = null;

categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
        selectedCategory = button.dataset.category || button.textContent.trim();
        hasGeneratedFit = false;
        categoryButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
        messageBox.textContent = `Selected ${selectedCategory}. Click Generate Fit to create an outfit.`;

        cameraButton.classList.remove('pulse');
        window.clearTimeout(pulseTimeout);
        cameraButton.classList.add('pulse');
        pulseTimeout = window.setTimeout(() => cameraButton.classList.remove('pulse'), 1800);
    });
});

cameraButton.addEventListener('click', () => {
    if (!selectedCategory) {
        messageBox.textContent = 'Pick a category first, then tap Add To Your Closet to take a photo.';
        return;
    }
    photoInput.click();
});

photoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file || !selectedCategory) return;

    const item = {
        name: file.name,
        url: URL.createObjectURL(file)
    };

    closetData[selectedCategory].push(item);
    updateClosetGrid();
    hasGeneratedFit = false;
    messageBox.textContent = `Added “${file.name}” to ${selectedCategory}.`;
    event.target.value = '';
});

function updateClosetGrid() {
    closetGrid.innerHTML = '';
    const categories = Object.keys(closetData);
    let hasItems = false;

    categories.forEach((category) => {
        const items = closetData[category];
        if (!items.length) return;

        hasItems = true;
        const categoryBlock = document.createElement('div');
        categoryBlock.className = 'closet-category';

        const heading = document.createElement('h3');
        heading.textContent = category;
        categoryBlock.appendChild(heading);

        const itemRow = document.createElement('div');
        itemRow.className = 'closet-items';

        items.forEach((item) => {
            const itemCard = document.createElement('div');
            itemCard.className = 'closet-item';

            const img = document.createElement('img');
            img.src = item.url;
            img.alt = item.name;
            itemCard.appendChild(img);

            const label = document.createElement('span');
            label.textContent = item.name;
            itemCard.appendChild(label);

            itemRow.appendChild(itemCard);
        });

        categoryBlock.appendChild(itemRow);
        closetGrid.appendChild(categoryBlock);
    });

    if (!hasItems) {
        const placeholder = document.createElement('p');
        placeholder.className = 'empty-closet';
        placeholder.textContent = 'No closet items yet. Tap a category, then Add To Your Closet to take a photo.';
        closetGrid.appendChild(placeholder);
    }
}

generateButton.addEventListener('click', () => {
    if (!selectedCategory) {
        messageBox.textContent = 'Choose a category first to generate a fit.';
        return;
    }
    hasGeneratedFit = true;
    messageBox.textContent = `Generated a fit using ${selectedCategory}. Tap Save Outfit to keep it.`;
});

saveButton.addEventListener('click', () => {
    if (!hasGeneratedFit) {
        messageBox.textContent = 'Generate a fit before saving it.';
        return;
    }
    messageBox.textContent = 'Your outfit has been saved to the virtual closet.';
});
