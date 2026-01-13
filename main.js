import { VibeKanbanWebCompanion } from 'vibe-kanban-web-companion';

document.addEventListener('DOMContentLoaded', () => {
    init();
    initVibeKanban();
});

function init() {
    console.log('App initialized');
}

function initVibeKanban() {
    const companion = new VibeKanbanWebCompanion();
    companion.render(document.body);
}
