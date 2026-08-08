document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Form Submissions
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = form.querySelector('.submit-btn');
            const apiUrl = form.getAttribute('data-api');
            
            // Gather form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // UI Loading state
            btn.classList.add('loading');
            
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showToast('Success', result.message, 'success');
                    form.reset(); // Clear form on success
                } else {
                    showToast('Error', result.message, 'error');
                }
            } catch (error) {
                showToast('Connection Error', 'Failed to connect to the server. Make sure it is running.', 'error');
            } finally {
                // Remove loading state
                btn.classList.remove('loading');
            }
        });
    });

    // Toast Notification Logic
    const toast = document.getElementById('toast');
    const toastClose = document.getElementById('toast-close');
    let toastTimeout;

    function showToast(title, message, type) {
        const titleEl = document.getElementById('toast-title');
        const msgEl = document.getElementById('toast-message');
        const iconEl = document.getElementById('toast-icon');
        
        titleEl.textContent = title;
        msgEl.textContent = message;
        
        // Update Icon based on type
        if (type === 'error') {
            iconEl.innerHTML = '<i class="ph ph-warning-circle"></i>';
            iconEl.classList.add('error');
        } else {
            iconEl.innerHTML = '<i class="ph ph-check-circle"></i>';
            iconEl.classList.remove('error');
        }
        
        toast.classList.add('show');
        
        // Auto hide after 5 seconds
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            hideToast();
        }, 5000);
    }

    function hideToast() {
        toast.classList.remove('show');
    }

    toastClose.addEventListener('click', hideToast);
});
