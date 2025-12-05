// Estado do aplicativo
const state = {
    currentTool: 'pen',
    currentColor: '#FF0000',
    strokeSize: 3,
    isDrawing: false,
    isDrawingMode: true,
    isSpotlightMode: false,
    history: [],
    redoStack: [],
    startX: 0,
    startY: 0,
    textPosition: { x: 0, y: 0 }
};

// Elementos do DOM
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const toolbar = document.getElementById('toolbar');
const toolbarDrag = document.getElementById('toolbarDrag');
const strokeSlider = document.getElementById('strokeSize');
const strokeSizeValue = document.getElementById('strokeSizeValue');
const customColor = document.getElementById('customColor');
const modeIndicator = document.getElementById('modeIndicator');
const modeText = document.getElementById('modeText');
const spotlightOverlay = document.getElementById('spotlightOverlay');
const spotlightHole = document.getElementById('spotlightHole');
const textInput = document.getElementById('textInput');

// Configurar canvas
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    redrawCanvas();
}

// Redesenhar canvas do histórico
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.history.forEach(item => {
        drawHistoryItem(item);
    });
}

// Desenhar um item do histórico
function drawHistoryItem(item) {
    ctx.save();

    switch (item.type) {
        case 'path':
            ctx.strokeStyle = item.color;
            ctx.lineWidth = item.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = item.alpha || 1;
            ctx.beginPath();
            if (item.points.length > 0) {
                ctx.moveTo(item.points[0].x, item.points[0].y);
                for (let i = 1; i < item.points.length; i++) {
                    ctx.lineTo(item.points[i].x, item.points[i].y);
                }
            }
            ctx.stroke();
            break;

        case 'rectangle':
            ctx.strokeStyle = item.color;
            ctx.lineWidth = item.size;
            ctx.globalAlpha = item.alpha || 1;
            ctx.strokeRect(item.x, item.y, item.width, item.height);
            break;

        case 'circle':
            ctx.strokeStyle = item.color;
            ctx.lineWidth = item.size;
            ctx.globalAlpha = item.alpha || 1;
            ctx.beginPath();
            ctx.ellipse(
                item.x + item.width / 2,
                item.y + item.height / 2,
                Math.abs(item.width / 2),
                Math.abs(item.height / 2),
                0, 0, Math.PI * 2
            );
            ctx.stroke();
            break;

        case 'line':
            ctx.strokeStyle = item.color;
            ctx.lineWidth = item.size;
            ctx.globalAlpha = item.alpha || 1;
            ctx.beginPath();
            ctx.moveTo(item.startX, item.startY);
            ctx.lineTo(item.endX, item.endY);
            ctx.stroke();
            break;

        case 'arrow':
            drawArrow(ctx, item.startX, item.startY, item.endX, item.endY, item.color, item.size, item.alpha || 1);
            break;

        case 'text':
            ctx.fillStyle = item.color;
            ctx.font = `${item.size * 5}px Arial`;
            ctx.globalAlpha = item.alpha || 1;
            ctx.fillText(item.text, item.x, item.y);
            break;

        case 'eraser':
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.lineWidth = item.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            if (item.points.length > 0) {
                ctx.moveTo(item.points[0].x, item.points[0].y);
                for (let i = 1; i < item.points.length; i++) {
                    ctx.lineTo(item.points[i].x, item.points[i].y);
                }
            }
            ctx.stroke();
            break;
    }

    ctx.restore();
}

// Desenhar seta
function drawArrow(ctx, fromX, fromY, toX, toY, color, size, alpha = 1) {
    const headLength = size * 4;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = size;
    ctx.globalAlpha = alpha;

    // Linha
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Ponta da seta
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
}

// Objeto de desenho atual
let currentDrawing = null;

// Iniciar desenho
function startDrawing(e) {
    if (!state.isDrawingMode || e.target !== canvas) return;

    state.isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    state.startX = e.clientX - rect.left;
    state.startY = e.clientY - rect.top;

    if (state.currentTool === 'text') {
        showTextInput(e.clientX, e.clientY);
        return;
    }

    if (state.currentTool === 'pen' || state.currentTool === 'highlighter' || state.currentTool === 'eraser') {
        currentDrawing = {
            type: state.currentTool === 'eraser' ? 'eraser' : 'path',
            color: state.currentColor,
            size: state.currentTool === 'eraser' ? state.strokeSize * 3 : state.strokeSize,
            alpha: state.currentTool === 'highlighter' ? 0.4 : 1,
            points: [{ x: state.startX, y: state.startY }]
        };
    }
}

// Continuar desenho
function draw(e) {
    if (!state.isDrawing || !state.isDrawingMode) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Limpar e redesenhar
    redrawCanvas();

    if (state.currentTool === 'pen' || state.currentTool === 'highlighter' || state.currentTool === 'eraser') {
        currentDrawing.points.push({ x, y });
        drawHistoryItem(currentDrawing);
    } else if (state.currentTool === 'rectangle') {
        currentDrawing = {
            type: 'rectangle',
            color: state.currentColor,
            size: state.strokeSize,
            x: Math.min(state.startX, x),
            y: Math.min(state.startY, y),
            width: Math.abs(x - state.startX),
            height: Math.abs(y - state.startY)
        };
        drawHistoryItem(currentDrawing);
    } else if (state.currentTool === 'circle') {
        currentDrawing = {
            type: 'circle',
            color: state.currentColor,
            size: state.strokeSize,
            x: Math.min(state.startX, x),
            y: Math.min(state.startY, y),
            width: Math.abs(x - state.startX),
            height: Math.abs(y - state.startY)
        };
        drawHistoryItem(currentDrawing);
    } else if (state.currentTool === 'line') {
        currentDrawing = {
            type: 'line',
            color: state.currentColor,
            size: state.strokeSize,
            startX: state.startX,
            startY: state.startY,
            endX: x,
            endY: y
        };
        drawHistoryItem(currentDrawing);
    } else if (state.currentTool === 'arrow') {
        currentDrawing = {
            type: 'arrow',
            color: state.currentColor,
            size: state.strokeSize,
            startX: state.startX,
            startY: state.startY,
            endX: x,
            endY: y
        };
        drawHistoryItem(currentDrawing);
    }
}

// Finalizar desenho
function stopDrawing() {
    if (!state.isDrawing) return;

    state.isDrawing = false;

    if (currentDrawing) {
        state.history.push(currentDrawing);
        state.redoStack = [];
        currentDrawing = null;
    }
}

// Mostrar input de texto
function showTextInput(x, y) {
    state.textPosition = { x, y };
    textInput.style.left = `${x}px`;
    textInput.style.top = `${y}px`;
    textInput.classList.remove('hidden');
    textInput.focus();
    textInput.value = '';
}

// Adicionar texto ao canvas
function addText(text) {
    if (text.trim()) {
        const item = {
            type: 'text',
            color: state.currentColor,
            size: state.strokeSize,
            text: text,
            x: state.textPosition.x,
            y: state.textPosition.y
        };
        state.history.push(item);
        state.redoStack = [];
        redrawCanvas();
    }
    textInput.classList.add('hidden');
    state.isDrawing = false;
}

// Desfazer
function undo() {
    if (state.history.length > 0) {
        const item = state.history.pop();
        state.redoStack.push(item);
        redrawCanvas();
    }
}

// Refazer
function redo() {
    if (state.redoStack.length > 0) {
        const item = state.redoStack.pop();
        state.history.push(item);
        redrawCanvas();
    }
}

// Limpar canvas
function clearCanvas() {
    if (state.history.length > 0) {
        state.redoStack = [...state.history];
        state.history = [];
        redrawCanvas();
    }
}

// Alternar spotlight
function toggleSpotlight() {
    state.isSpotlightMode = !state.isSpotlightMode;

    if (state.isSpotlightMode) {
        spotlightOverlay.classList.remove('hidden');
        document.getElementById('spotlightBtn').classList.add('active');
    } else {
        spotlightOverlay.classList.add('hidden');
        document.getElementById('spotlightBtn').classList.remove('active');
    }
}

// Mover spotlight
function moveSpotlight(e) {
    if (!state.isSpotlightMode) return;

    const size = 200;
    spotlightHole.style.left = `${e.clientX - size / 2}px`;
    spotlightHole.style.top = `${e.clientY - size / 2}px`;
}

// Alterar modo de desenho
function setDrawingMode(isDrawing) {
    state.isDrawingMode = isDrawing;

    document.body.classList.toggle('drawing-disabled', !isDrawing);

    const toggleBtn = document.getElementById('toggleDrawingBtn');
    toggleBtn.classList.toggle('inactive', !isDrawing);

    // Mostrar indicador
    modeText.textContent = isDrawing ? 'Modo: Desenho' : 'Modo: Visualização';
    modeIndicator.classList.add('visible');
    setTimeout(() => {
        modeIndicator.classList.remove('visible');
    }, 1500);
}

// Selecionar ferramenta
function selectTool(tool) {
    state.currentTool = tool;

    // Atualizar UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === tool);
    });

    // Cursor especial para borracha
    canvas.classList.toggle('eraser-cursor', tool === 'eraser');
}

// Selecionar cor
function selectColor(color) {
    state.currentColor = color;

    // Atualizar UI
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === color);
    });
}

// Configurar arrastar toolbar
function setupToolbarDrag() {
    let isDragging = false;
    let offsetX, offsetY;

    toolbarDrag.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = toolbar.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        toolbar.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        toolbar.style.left = `${x}px`;
        toolbar.style.top = `${y}px`;
        toolbar.style.transform = 'none';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        toolbar.style.transition = '';
    });
}

// Event Listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', (e) => {
    draw(e);
    moveSpotlight(e);
});
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

// Prevenir menu de contexto
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Ferramentas
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => selectTool(btn.dataset.tool));
});

// Cores
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => selectColor(btn.dataset.color));
});

customColor.addEventListener('input', (e) => {
    selectColor(e.target.value);
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('active');
    });
});

// Slider de espessura
strokeSlider.addEventListener('input', (e) => {
    state.strokeSize = parseInt(e.target.value);
    strokeSizeValue.textContent = state.strokeSize;
});

// Botões de ação
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);
document.getElementById('clearBtn').addEventListener('click', clearCanvas);
document.getElementById('spotlightBtn').addEventListener('click', toggleSpotlight);
document.getElementById('toggleDrawingBtn').addEventListener('click', () => {
    window.electronAPI.toggleDrawingMode();
});
document.getElementById('minimizeBtn').addEventListener('click', () => {
    window.electronAPI.minimizeToTray();
});

// Input de texto
textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addText(textInput.value);
    } else if (e.key === 'Escape') {
        textInput.classList.add('hidden');
        state.isDrawing = false;
    }
});

textInput.addEventListener('blur', () => {
    if (textInput.value.trim()) {
        addText(textInput.value);
    } else {
        textInput.classList.add('hidden');
        state.isDrawing = false;
    }
});

// IPC listeners
window.electronAPI.onClearCanvas(() => clearCanvas());
window.electronAPI.onUndo(() => undo());
window.electronAPI.onRedo(() => redo());
window.electronAPI.onSetTool((tool) => selectTool(tool));
window.electronAPI.onToggleSpotlight(() => toggleSpotlight());
window.electronAPI.onDrawingModeChanged((isDrawing) => setDrawingMode(isDrawing));

// Resize
window.addEventListener('resize', setupCanvas);

// Atalhos de teclado locais
document.addEventListener('keydown', (e) => {
    if (e.target === textInput) return;

    // Números para ferramentas
    if (e.key === '1') selectTool('pen');
    if (e.key === '2') selectTool('highlighter');
    if (e.key === '3') selectTool('rectangle');
    if (e.key === '4') selectTool('circle');
    if (e.key === '5') selectTool('arrow');
    if (e.key === '6') selectTool('line');
    if (e.key.toLowerCase() === 't') selectTool('text');
    if (e.key.toLowerCase() === 'e') selectTool('eraser');
});

// Inicialização
setupCanvas();
setupToolbarDrag();
