// js/app.js
import { initializeTabListeners, switchTab } from './ui.js';
import { initializeInput } from './input.js';
import { initializeOutput } from './output.js';
import { initializeManage } from './manage.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI listeners (tab switching)
    initializeTabListeners();

    // Initialize Modules
    initializeInput();
    initializeOutput();
    initializeManage();

    // Ensure the default tab ('input') is active on load
    switchTab('input');
});