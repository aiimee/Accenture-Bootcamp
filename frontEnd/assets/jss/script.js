document.addEventListener('DOMContentLoaded', function() {
    const bottomTextButton = document.getElementById('bottom-text');

    bottomTextButton.addEventListener('click', function() {
        window.location.href = 'services.html';
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const categoryCards = document.querySelectorAll('.category-card');
    const continueButton = document.getElementById('continueButton');
    let selectedServices = new Set();

    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const service = card.getAttribute('data-service');

            if (selectedServices.has(service)) {
                selectedServices.delete(service);
                card.classList.remove('selected');
            } else {
                selectedServices.add(service);
                card.classList.add('selected');
            }

            // Enable the continue button if any services are selected
            continueButton.disabled = selectedServices.size === 0;
        });
    });

    continueButton.addEventListener('click', function() {
        if (selectedServices.size > 0) {
            window.location.href = 'feedback.html';
        }
    });
});

  