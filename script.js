
document.addEventListener('DOMContentLoaded', function() {
    const track = document.getElementById('galleryTrack');
    const slides = document.querySelectorAll('.gallery-slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicatorsContainer = document.getElementById('galleryIndicators');
    const thumbnailsContainer = document.getElementById('galleryThumbnails');
    
    let currentIndex = 0;
    let startX = 0;
    let isDragging = false;
    
    // Crear indicadores y miniaturas
    slides.forEach((slide, index) => {
        // Crear indicadores
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(indicator);
        
        // Crear miniaturas
        const thumbnail = document.createElement('div');
        thumbnail.classList.add('thumbnail');
        if (index === 0) thumbnail.classList.add('active');
        
        const img = slide.querySelector('.slide-image').cloneNode(true);
        thumbnail.appendChild(img);
        
        thumbnail.addEventListener('click', () => goToSlide(index));
        thumbnailsContainer.appendChild(thumbnail);
    });
    
    const indicators = document.querySelectorAll('.indicator');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    // Función para ir a un slide específico
    function goToSlide(index) {
        currentIndex = index;
        updateGallery();
    }
    
    // Actualizar la galería
    function updateGallery() {
        const slideWidth = slides[0].offsetWidth + 25; // Ancho + gap
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        
        // Actualizar indicadores
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
        
        // Actualizar miniaturas
        thumbnails.forEach((thumbnail, index) => {
            thumbnail.classList.toggle('active', index === currentIndex);
        });
    }
    
    // Navegación con botones
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateGallery();
    });
    
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateGallery();
    });
    
    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevBtn.click();
        } else if (e.key === 'ArrowRight') {
            nextBtn.click();
        }
    });
    
    // Soporte para touch y drag
    track.addEventListener('mousedown', startDrag);
    track.addEventListener('touchstart', startDrag);
    
    track.addEventListener('mousemove', drag);
    track.addEventListener('touchmove', drag);
    
    track.addEventListener('mouseup', endDrag);
    track.addEventListener('touchend', endDrag);
    track.addEventListener('mouseleave', endDrag);
    
    function startDrag(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        track.style.cursor = 'grabbing';
        track.style.transition = 'none';
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const diffX = startX - currentX;
        
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                nextBtn.click();
            } else {
                prevBtn.click();
            }
            isDragging = false;
        }
    }
    
    function endDrag() {
        isDragging = false;
        track.style.cursor = 'grab';
        track.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
    
    // Auto-play opcional
    let autoPlayInterval;
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            nextBtn.click();
        }, 5000);
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }
    
    // Iniciar auto-play y pausar al interactuar
    startAutoPlay();
    
    track.addEventListener('mouseenter', stopAutoPlay);
    track.addEventListener('mouseleave', startAutoPlay);
    
    track.addEventListener('touchstart', stopAutoPlay);
    track.addEventListener('touchend', startAutoPlay);
    
    // Ajustar en resize
    window.addEventListener('resize', updateGallery);
});

