const categoryButtons = document.querySelectorAll('.category-item, .closet-section');
const cameraButton = document.getElementById('cameraButton');
const saveButton = document.getElementById('saveButton');
const generateButton = document.getElementById('generateButton');
const photoInput = document.getElementById('photoInput');
const messageBox = document.getElementById('messageBox');

let selectedCategory = null;
let hasGeneratedFit = false;

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
    photoInput.click();
});

photoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    selectedCategory = 'New item';
    hasGeneratedFit = false;
    messageBox.textContent = `Added “${file.name}” to your closet. Pick a category or generate a fit.`;
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
