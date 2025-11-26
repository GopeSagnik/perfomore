// js/ui.js

const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

/**
 * Handles switching between the three main tabs (Input, Output, Manage).
 * @param {string} targetTabId - The ID of the tab content to show (e.g., 'input', 'output').
 */
const switchTab = (targetTabId) => {
    // 1. Update Buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.tab-button[data-tab="${targetTabId}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // 2. Update Content visibility
    tabContents.forEach(content => content.classList.add('hidden'));
    const activeContent = document.getElementById(targetTabId);
    if (activeContent) activeContent.classList.remove('hidden');

    // 3. Trigger specific tab load functions
    // We dispatch a custom event so other modules can listen and react
    const event = new CustomEvent('tabChanged', { detail: { tabId: targetTabId } });
    document.dispatchEvent(event);
};

// Add listeners to tab buttons
const initializeTabListeners = () => {
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetTab = e.target.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
};

export { switchTab, initializeTabListeners };