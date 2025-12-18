// Make copyShloka available globally for onclick handler
window.copyShloka = function () {
    if (typeof UIController !== 'undefined' && UIController.copyShloka) {
        UIController.copyShloka();
    }
};
