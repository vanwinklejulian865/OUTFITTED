let selectedCategory = null;
let hasGeneratedFit = false;
let selectedItems = [];
const STORAGE_KEY = 'outfittedCloset';

const closetData = {
    Accessories: [],
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
let stylePrompt;
let stylePromptGrid;
let stylePromptSkip;
let stylePromptSave;
let savedOutfitsPage;
let savedOutfitsList;
let noSavedOutfits;
let savedOutfitsBackButton;

const STYLE_STORAGE_KEY = 'outfittedStyles';
const SAVED_OUTFITS_KEY = 'outfittedSavedOutfits';
let selectedStyles = [];
let currentOutfitItems = [];

const styleOptions = [
    { name: 'Casual', description: 'Easy everyday looks with comfy, worn-in pieces.' },
    { name: 'Athleisure', description: 'Sporty clothes that feel good both in and out of the gym.' },
    { name: 'Streetwear', description: 'Urban-inspired fits with bold graphics and attitude.' },
    { name: 'Minimalist', description: 'Clean, pared-down shapes in quiet, neutral tones.' },
    { name: 'Vintage', description: 'Retro-inspired pieces with nostalgic textures and prints.' },
    { name: 'Boho', description: 'Free-spirited, flowy outfits with natural and layered details.' },
    { name: 'Preppy', description: 'Polished, tailored pieces with a smart, collegiate feel.' },
    { name: 'Gothic', description: 'Dark, dramatic looks with moody textures and contrast.' },
    { name: 'Professional', description: 'Sharp, office-ready styles that feel polished and refined.' },
    { name: 'Romantic', description: 'Soft, dreamy outfits with lace, florals, and gentle shapes.' },
    { name: 'Sporty', description: 'Active-inspired pieces built for movement and energy.' },
    { name: 'Grunge', description: 'Layered, edgy ensembles with worn textures and attitude.' },
    { name: 'Pastel', description: 'Soft, sweet color palettes for subtle and playful outfits.' },
    { name: 'Monochrome', description: 'Single-color looks with sophisticated tone-on-tone styling.' },
    { name: 'Bright', description: 'Vivid, attention-grabbing colors for bold statement outfits.' },
    { name: 'Neutral', description: 'Earthy, calm palettes that feel effortless and versatile.' },
    { name: 'Edgy', description: 'Sharp, bold outfits with a rebellious modern edge.' },
    { name: 'Classic', description: 'Timeless pieces that never go out of style.' },
    { name: 'Sophisticated', description: 'Luxurious shapes and rich textures with a refined finish.' },
    { name: 'Relaxed', description: 'Loose, easy silhouettes made for comfort and ease.' }
];

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
    stylePrompt = document.getElementById('stylePrompt');
    stylePromptGrid = document.getElementById('stylePromptGrid');
    stylePromptSkip = document.getElementById('stylePromptSkip');
    stylePromptSave = document.getElementById('stylePromptSave');
    savedOutfitsPage = document.getElementById('savedOutfitsPage');
    savedOutfitsList = document.getElementById('savedOutfitsList');
    noSavedOutfits = document.getElementById('noSavedOutfits');
    savedOutfitsBackButton = document.getElementById('savedOutfitsBackButton');

    loadStylePreferences();
    renderStylePrompt();
    openStylePromptIfNeeded();

    loadClosetData();
    updateClosetGrid();

    stylePromptSave.addEventListener('click', () => {
        saveStylePreferences();
        hideStylePrompt();
        messageBox.textContent = 'Style preferences saved. Your outfits will now match your chosen looks.';
    });

    stylePromptSkip.addEventListener('click', () => {
        hideStylePrompt();
        messageBox.textContent = 'Style preferences skipped. You can still generate outfits anytime.';
    });

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
        const files = Array.from(event.target.files);
        if (!files.length || !selectedCategory) return;

        let addedNames = [];
        let loadedCount = 0;

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                const item = {
                    name: file.name,
                    url: reader.result
                };

                closetData[selectedCategory].push(item);
                addedNames.push(file.name);
                loadedCount += 1;

                if (loadedCount === files.length) {
                    saveClosetData();
                    updateClosetGrid();
                    hasGeneratedFit = false;
                    const namesText = addedNames.length > 1 ? `${addedNames.length} photos` : `“${addedNames[0]}”`;
                    messageBox.textContent = `Added ${namesText} to ${selectedCategory}.`;
                    photoInput.value = '';
                }
            };
            reader.readAsDataURL(file);
        });
    });

    generateButton.addEventListener('click', () => {
        const vitalCategories = ['Tops', 'Bottoms', 'Shoes'];
        const missingVital = vitalCategories.filter(cat => !closetData[cat] || closetData[cat].length === 0);
        
        if (missingVital.length > 0) {
            messageBox.textContent = `Missing vital items: ${missingVital.join(', ')}. Add at least one to generate a complete outfit.`;
            return;
        }

        const outfitItems = buildOutfit();
        if (!outfitItems.length) {
            messageBox.textContent = 'Add at least one item to any category before generating an outfit.';
            return;
        }

        hasGeneratedFit = true;
        renderOutfit(outfitItems);
        messageBox.textContent = 'Generated a full outfit. Scroll down to preview it.';
    });

    saveButton.addEventListener('click', () => {
        if (!hasGeneratedFit) {
            messageBox.textContent = 'Generate a fit before saving it.';
            return;
        }
        
        const outfitToSave = {
            items: currentOutfitItems,
            timestamp: new Date().toISOString()
        };
        
        let savedOutfits = [];
        const raw = localStorage.getItem(SAVED_OUTFITS_KEY);
        if (raw) {
            try {
                savedOutfits = JSON.parse(raw);
            } catch (error) {
                console.warn('Unable to load saved outfits:', error);
            }
        }
        
        savedOutfits.unshift(outfitToSave);
        localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(savedOutfits));
        messageBox.textContent = 'Outfit saved! Opening saved outfits...';
        
        setTimeout(() => {
            showSavedOutfitsPage();
        }, 800);
    });

    detailBackButton.addEventListener('click', closeCategoryDetail);
    detailDeleteButton.addEventListener('click', performBulkDelete);
    savedOutfitsBackButton.addEventListener('click', closeSavedOutfitsPage);
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

const TREND_KEYWORDS = [
    'denim', 'leather', 'vintage', 'minimal', 'sporty', 'pastel',
    'earth', 'neon', 'check', 'stripe', 'floral', 'retro', 'oversized',
    'tailored', 'cropped', 'slim', 'monochrome', 'bold', 'classic', 'grunge',
    'boho', 'glam', 'elegant', 'street', 'cyber', 'funk', 'preppy', 'academic',
    'formal', 'utility', 'athletic', 'laid-back', 'cozy', 'rugged', 'edgy',
    'chic', 'smart', 'bold', 'dreamy', 'saturated', 'neutral', 'textured',
    'soft', 'clean', 'structured'
];

const styleKeywordMap = {
    Casual: ['casual', 'easy', 'comfy', 'relaxed', 'everyday', 'laid-back'],
    Athleisure: ['athleisure', 'sporty', 'sweat', 'track', 'active', 'performance'],
    Streetwear: ['street', 'hype', 'urban', 'graphic', 'oversized', 'bold'],
    Minimalist: ['minimal', 'simple', 'clean', 'streamlined', 'neutral', 'understated'],
    Vintage: ['vintage', 'retro', 'old-school', 'throwback', 'classic', 'distressed'],
    Boho: ['boho', 'bohemian', 'flowy', 'fringe', 'embroidered', 'earthy'],
    Preppy: ['preppy', 'polished', 'crisp', 'laid-back', 'classic', 'tucked'],
    Gothic: ['gothic', 'dark', 'black', 'leather', 'velvet', 'lace'],
    Professional: ['professional', 'tailored', 'sharp', 'office', 'polished', 'sleek'],
    Romantic: ['romantic', 'lace', 'soft', 'floral', 'dreamy', 'flowy'],
    Sporty: ['sporty', 'active', 'mesh', 'jersey', 'performance', 'runner'],
    Grunge: ['grunge', 'distressed', 'plaid', 'band', 'cover', 'layered'],
    Pastel: ['pastel', 'soft', 'powder', 'mint', 'lavender', 'blush'],
    Monochrome: ['monochrome', 'black', 'white', 'grey', 'tone', 'contrast'],
    Bright: ['bright', 'vivid', 'neon', 'bold', 'colorful', 'electric'],
    Neutral: ['neutral', 'earth', 'beige', 'taupe', 'sand', 'cream'],
    Edgy: ['edgy', 'spike', 'chunky', 'leather', 'graphic', 'ripped'],
    Classic: ['classic', 'elegant', 'timeless', 'heritage', 'refined', 'tailored'],
    Sophisticated: ['sophisticated', 'luxury', 'sleek', 'polished', 'structured', 'rich'],
    Relaxed: ['relaxed', 'loose', 'oversized', 'flowy', 'soft', 'easy']
};

function renderStylePrompt() {
    stylePromptGrid.innerHTML = '';
    styleOptions.forEach((style) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'style-item';

        const badge = document.createElement('span');
        badge.className = 'style-badge';
        badge.textContent = '';
        badge.setAttribute('aria-hidden', 'true');
        button.appendChild(badge);

        const label = document.createElement('span');
        label.className = 'style-label';
        label.textContent = style.name;
        button.appendChild(label);

        const description = document.createElement('span');
        description.className = 'style-description';
        description.textContent = style.description;
        button.appendChild(description);

        if (selectedStyles.includes(style.name)) {
            button.classList.add('active');
            badge.textContent = String(selectedStyles.indexOf(style.name) + 1);
        }

        button.addEventListener('click', () => {
            toggleStyleSelection(style.name);
            renderStylePrompt();
        });
        stylePromptGrid.appendChild(button);
    });
}

function toggleStyleSelection(style) {
    const index = selectedStyles.indexOf(style);
    if (index !== -1) {
        selectedStyles.splice(index, 1);
    } else {
        selectedStyles.push(style);
    }
}

function saveStylePreferences() {
    localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(selectedStyles));
}

function loadStylePreferences() {
    const raw = localStorage.getItem(STYLE_STORAGE_KEY);
    if (!raw) return;

    try {
        const stored = JSON.parse(raw);
        if (Array.isArray(stored)) {
            selectedStyles = stored;
        }
    } catch (error) {
        console.warn('Unable to load style preferences:', error);
    }
}

function openStylePromptIfNeeded() {
    if (!selectedStyles.length) {
        stylePrompt.classList.remove('hidden');
        stylePrompt.setAttribute('aria-hidden', 'false');
    }
}

function hideStylePrompt() {
    stylePrompt.classList.add('hidden');
    stylePrompt.setAttribute('aria-hidden', 'true');
}

function showSavedOutfitsPage() {
    const pageShell = document.querySelector('.page-shell');
    const bottomBar = document.querySelector('.bottom-bar');
    pageShell.style.display = 'none';
    bottomBar.style.display = 'none';
    savedOutfitsPage.classList.remove('hidden');
    savedOutfitsPage.setAttribute('aria-hidden', 'false');
    renderSavedOutfits();
}

function closeSavedOutfitsPage() {
    const pageShell = document.querySelector('.page-shell');
    const bottomBar = document.querySelector('.bottom-bar');
    pageShell.style.display = 'flex';
    bottomBar.style.display = 'flex';
    savedOutfitsPage.classList.add('hidden');
    savedOutfitsPage.setAttribute('aria-hidden', 'true');
}

function renderSavedOutfits() {
    const raw = localStorage.getItem(SAVED_OUTFITS_KEY);
    let savedOutfits = [];
    
    if (raw) {
        try {
            savedOutfits = JSON.parse(raw);
        } catch (error) {
            console.warn('Unable to load saved outfits:', error);
        }
    }
    
    savedOutfitsList.innerHTML = '';
    
    if (savedOutfits.length === 0) {
        noSavedOutfits.style.display = 'block';
        return;
    }
    
    noSavedOutfits.style.display = 'none';
    
    savedOutfits.forEach((outfit, index) => {
        const card = document.createElement('div');
        card.className = 'saved-outfit-card';
        
        const title = document.createElement('h3');
        const date = new Date(outfit.timestamp);
        title.textContent = `Outfit #${savedOutfits.length - index}`;
        card.appendChild(title);
        
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'saved-outfit-items';
        
        outfit.items.forEach(({ category, item }) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'saved-outfit-item';
            itemEl.textContent = `${category}: ${item.name}`;
            itemsContainer.appendChild(itemEl);
        });
        card.appendChild(itemsContainer);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'saved-outfit-delete';
        deleteBtn.type = 'button';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            deleteSavedOutfit(index);
        });
        card.appendChild(deleteBtn);
        
        savedOutfitsList.appendChild(card);
    });
}

function deleteSavedOutfit(index) {
    const raw = localStorage.getItem(SAVED_OUTFITS_KEY);
    if (!raw) return;
    
    try {
        let savedOutfits = JSON.parse(raw);
        savedOutfits.splice(index, 1);
        localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(savedOutfits));
        renderSavedOutfits();
    } catch (error) {
        console.warn('Unable to delete outfit:', error);
    }
}

function buildOutfit() {
    const categories = ['Accessories', 'Tops', 'Layers', 'Bottoms', 'Shoes'];
    return categories
        .map((category) => {
            const items = closetData[category];
            if (!items || !items.length) return null;
            return { category, item: chooseBestItem(category, items) };
        })
        .filter(Boolean);
}

function chooseBestItem(category, items) {
    const scoredItems = items.map((item, index) => ({
        item,
        score: scoreItemForTrend(category, item, index, items.length)
    }));
    scoredItems.sort((a, b) => b.score - a.score);
    return scoredItems[0].item;
}

function scoreItemForTrend(category, item, index, length) {
    const name = item.name ? item.name.toLowerCase() : '';
    let score = 10;

    score += index / Math.max(1, length) * 4;

    TREND_KEYWORDS.forEach((keyword) => {
        if (name.includes(keyword)) {
            score += 3;
        }
    });

    selectedStyles.forEach((style) => {
        const keywords = styleKeywordMap[style] || [];
        keywords.forEach((keyword) => {
            if (name.includes(keyword)) {
                score += 4;
            }
        });
    });

    if (!selectedStyles.length) {
        score += 2;
    }

    if (category === 'Tops' || category === 'Bottoms') {
        score += 1;
    }

    return score;
}

// If you want real trend-based outfit selection, replace scoreItemForTrend
// with a call to an API or model that can rank images by style compatibility.
// Example:
// async function scoreItemForTrend(category, item, index, length) {
//   const response = await fetch('/api/style-rank', {
//     method: 'POST',
//     body: JSON.stringify({ category, name: item.name }),
//   });
//   const result = await response.json();
//   return result.score;
// }

function renderOutfit(outfitItems) {
    currentOutfitItems = outfitItems;
    
    const outfitBuilder = document.getElementById('outfitBuilder');
    const outfitResult = document.getElementById('outfitResult');
    const selectedItems = document.getElementById('selectedItems');

    outfitResult.innerHTML = '';
    selectedItems.innerHTML = '';

    outfitItems.forEach(({ category, item }) => {
        const slot = document.createElement('div');
        slot.className = 'outfit-slot';

        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.name;
        slot.appendChild(img);

        const label = document.createElement('span');
        label.textContent = category;
        slot.appendChild(label);

        outfitResult.appendChild(slot);

        const chip = document.createElement('div');
        chip.className = 'selected-chip';
        chip.textContent = `${category}: ${item.name}`;
        selectedItems.appendChild(chip);
    });

    outfitBuilder.classList.remove('hidden');
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

