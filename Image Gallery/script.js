document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentItems = [];
    let currentIndex = 0;

    // --- Filter Functionality ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                // Remove show class for animation reset
                item.classList.remove('show');
                
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('hide');
                    // Add small delay for staggered animation effect
                    setTimeout(() => {
                        item.classList.add('show');
                    }, 50);
                } else {
                    item.classList.add('hide');
                }
            });
        });
    });

    // Initialize display with all items showing
    galleryItems.forEach(item => item.classList.add('show'));

    // --- Lightbox Functionality ---
    
    // Open Lightbox
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // Update currentItems based on active filter
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            if (activeFilter === 'all') {
                currentItems = Array.from(galleryItems);
            } else {
                currentItems = Array.from(galleryItems).filter(i => i.getAttribute('data-category') === activeFilter);
            }
            
            currentIndex = currentItems.indexOf(item);
            showLightbox(item);
        });
    });

    function showLightbox(item) {
        const img = item.querySelector('img').src;
        const title = item.querySelector('h3').textContent;
        const category = item.querySelector('p').textContent;

        lightboxImg.src = img;
        lightboxCaption.innerHTML = `<strong>${title}</strong> - ${category}`;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Close Lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    closeBtn.addEventListener('click', closeLightbox);
    
    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Navigation
    function showNext() {
        if (currentItems.length === 0) return;
        currentIndex = (currentIndex + 1) % currentItems.length;
        showLightbox(currentItems[currentIndex]);
    }

    function showPrev() {
        if (currentItems.length === 0) return;
        currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
        showLightbox(currentItems[currentIndex]);
    }

    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });
});
