const categories = document.querySelectorAll('.category-item');
const cameraButton = document.getElementById('cameraButton');
const photoInput = document.getElementById('photoInput');

cameraButton.addEventListener('click', () => {
    photoInput.click();
});

photoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    alert(`Photo selected: ${file.name}`);
});
