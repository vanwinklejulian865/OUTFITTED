let selectedCategory = null;
let hasGeneratedFit = false;
let selectedItems = [];
const STORAGE_KEY = 'outfittedCloset';

const closetData = {
    Headwear: [],
    Tops: [],
    Bottoms: [],
    Layers: [],
    Shoes: []
};

let pulseTimeout = null;
let categoryButtons;
let cameraButton;
let saveButton;
let generateButton;
let photoInput;
let messageBox;
let closetGrid;
let categoryDetailScreen;
let detailBackButton;
let detailCategoryTitle;
let detailGallery;
let detailEmpty;
let detailDeleteButton;

document.addEventListener('DOMContentLoaded', () => {
    categoryButtons = document.querySelectorAll('.category-item');
    cameraButton = document.getElementById('cameraButton');
    saveButton = document.getElementById('saveButton');
    generateButton = document.getElementById('generateButton');
    photoInput = document.getElementById('photoInput');
    messageBox = document.getElementById('messageBox');
    closetGrid = document.getElementById('closetGrid');
    categoryDetailScreen = document.getElementById('categoryDetailScreen');
    detailBackButton = document.getElementById('detailBackButton');
    detailCategoryTitle = document.getElementById('detailCategoryTitle');
    detailGallery = document.getElementById('detailGallery');
    detailEmpty = document.getElementById('detailEmpty');
    detailDeleteButton = document.getElementById('detailDeleteButton');

    loadClosetData();
    updateClosetGrid();

    categoryButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const category = button.dataset.category || button.textContent.trim();
            if (selectedCategory === category) {
                openCategoryDetail(category);
                return;
            }

            selectedCategory = category;
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

        const reader = new FileReader();
        reader.onload = () => {
            const item = {
                name: file.name,
                url: reader.result
            };

            closetData[selectedCategory].push(item);
            saveClosetData();
            updateClosetGrid();
            hasGeneratedFit = false;
            messageBox.textContent = `Added “${file.name}” to ${selectedCategory}.`;
            photoInput.value = '';
        };
        reader.readAsDataURL(file);
    });

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

    detailBackButton.addEventListener('click', closeCategoryDetail);
    detailDeleteButton.addEventListener('click', performBulkDelete);
});

function openCategoryDetail(category) {
    selectedItems = [];
    updateDeleteButtonState();
    detailCategoryTitle.textContent = category;
    detailGallery.innerHTML = '';
    const items = closetData[category];
    const hasItems = items.length > 0;

    detailEmpty.style.display = hasItems ? 'none' : 'block';

    items.forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'closet-item';

        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.name;
        itemCard.appendChild(img);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-item-btn';
        deleteButton.type = 'button';
        deleteButton.textContent = '×';
        deleteButton.dataset.itemKey = `${category}-${index}`;
        deleteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleItemSelection(category, index, itemCard, deleteButton);
        });
        itemCard.appendChild(deleteButton);

        detailGallery.appendChild(itemCard);
    });

    categoryDetailScreen.classList.remove('hidden');
    categoryDetailScreen.setAttribute('aria-hidden', 'false');
}

function toggleItemSelection(category, itemIndex, itemCard, deleteButton) {
    const itemKey = `${category}-${itemIndex}`;
    const selectedIndex = selectedItems.indexOf(itemKey);

    if (selectedIndex !== -1) {
        selectedItems.splice(selectedIndex, 1);
    } else {
        selectedItems.push(itemKey);
    }

    updateSelectionButtons();
    updateDeleteButtonState();
}

function updateSelectionButtons() {
    const buttons = detailGallery.querySelectorAll('.delete-item-btn');
    buttons.forEach((button) => {
        const itemKey = button.dataset.itemKey;
        const index = selectedItems.indexOf(itemKey);
        const itemCard = button.closest('.closet-item');
        if (index !== -1) {
            button.textContent = String(index + 1);
            itemCard?.classList.add('selected');
        } else {
            button.textContent = '×';
            itemCard?.classList.remove('selected');
        }
    });
}

function updateDeleteButtonState() {
    const selectedCount = selectedItems.length;
    if (selectedCount > 0) {
        detailDeleteButton.classList.remove('hidden');
        detailDeleteButton.classList.add('active');
        detailDeleteButton.textContent = `Delete ${selectedCount} selected`;
    } else {
        detailDeleteButton.classList.add('hidden');
        detailDeleteButton.classList.remove('active');
        detailDeleteButton.textContent = 'Delete selected';
    }
}

function performBulkDelete() {
    if (!selectedCategory || selectedItems.length === 0) return;

    const indexes = selectedItems
        .map((itemKey) => Number(itemKey.split('-')[1]))
        .sort((a, b) => b - a);

    indexes.forEach((itemIndex) => {
        closetData[selectedCategory].splice(itemIndex, 1);
    });

    selectedItems = [];
    saveClosetData();
    updateClosetGrid();
    openCategoryDetail(selectedCategory);
    messageBox.textContent = `${indexes.length} item${indexes.length === 1 ? '' : 's'} deleted from ${selectedCategory}.`;
}

function closeCategoryDetail() {
    categoryDetailScreen.classList.add('hidden');
    categoryDetailScreen.setAttribute('aria-hidden', 'true');
}

detailBackButton.addEventListener('click', closeCategoryDetail);
detailDeleteButton.addEventListener('click', performBulkDelete);

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
        closetGrid.innerHTML = '';
    }
}

function saveClosetData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(closetData));
}

function loadClosetData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
        const stored = JSON.parse(raw);
        Object.keys(closetData).forEach((category) => {
            if (Array.isArray(stored[category])) {
                closetData[category] = stored[category];
            }
        });
    } catch (error) {
        console.warn('Unable to load closet data:', error);
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
