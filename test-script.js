// SCRIPT DE PRUEBA - VERIFICACIÓN DE FUNCIONALIDADES

console.log('=== INICIANDO PRUEBA DE MÓDULO MIS DEALS ===');

// 1. Verificar que las variables globales existan
if (typeof projects === 'undefined') {
    projects = [];
    console.log('✅ Variable projects inicializada');
}

if (typeof currentCalculation === 'undefined') {
    currentCalculation = null;
    console.log('✅ Variable currentCalculation inicializada');
}

// 2. Función de prueba para guardar un deal
function testSaveProject() {
    console.log('🧪 Probando guardar deal...');
    
    // Crear un deal de prueba
    const testDeal = {
        id: Date.now(),
        projectName: 'TEST DEAL',
        propertyAddress: '123 Test Street',
        projectMonths: 6,
        arv: 150000,
        purchasePrice: 100000,
        rehabBudget: 30000,
        closingCosts: 3000,
        holdingCosts: 6000,
        tpcPlusCost: 139000,
        roi: 27.2,
        projection: 21000,
        dealDecision: true,
        date: new Date().toISOString()
    };
    
    // Guardar en localStorage
    projects.push(testDeal);
    localStorage.setItem('fixFlipProjects', JSON.stringify(projects));
    
    console.log('✅ Deal de prueba guardado:', testDeal);
    showNotification('Deal de prueba guardado exitosamente', 'success');
    
    // Cargar proyectos
    loadProjects();
}

// 3. Función de prueba para limpiar
function testClearProjects() {
    console.log('🧹 Limpiando todos los deals...');
    projects = [];
    localStorage.setItem('fixFlipProjects', JSON.stringify(projects));
    loadProjects();
    showNotification('Todos los deals eliminados', 'info');
}

// 4. Función de prueba para verificar colores
function testColors() {
    console.log('🎨 Verificando colores...');
    
    const tbody = document.getElementById('projects-tbody');
    if (tbody) {
        console.log('✅ projects-tbody encontrado');
        
        // Verificar estilos
        const computedStyle = window.getComputedStyle(tbody);
        console.log('Color de texto:', computedStyle.color);
        console.log('Background:', computedStyle.backgroundColor);
    } else {
        console.log('❌ projects-tbody NO encontrado');
    }
}

// 5. Agregar botones de prueba al DOM
window.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, agregando botones de prueba...');
    
    // Crear panel de prueba
    const testPanel = document.createElement('div');
    testPanel.innerHTML = `
        <div style="position: fixed; top: 10px; right: 10px; z-index: 9999; background: #1a1f2e; border: 2px solid #d4af37; padding: 10px; border-radius: 5px;">
            <h5 style="color: #d4af37; margin: 0 0 10px 0;">🧪 PANEL DE PRUEBA</h5>
            <button onclick="testSaveProject()" class="btn btn-sm btn-success" style="margin: 2px;">Guardar Test Deal</button>
            <button onclick="testClearProjects()" class="btn btn-sm btn-danger" style="margin: 2px;">Limpiar Todo</button>
            <button onclick="testColors()" class="btn btn-sm btn-info" style="margin: 2px;">Verificar Colores</button>
            <button onclick="console.log('Projects:', projects)" class="btn btn-sm btn-primary" style="margin: 2px;">Ver Projects</button>
        </div>
    `;
    
    document.body.appendChild(testPanel);
    
    console.log('✅ Panel de prueba agregado');
});

// 6. Forzar recarga de estilos
function forceReloadStyles() {
    console.log('🔄 Forzando recarga de estilos...');
    
    // Recargar CSS
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
        const href = link.href;
        link.href = href + '?t=' + Date.now();
    });
    
    console.log('✅ Estilos recargados');
}

// Agregar al contexto global
window.testSaveProject = testSaveProject;
window.testClearProjects = testClearProjects;
window.testColors = testColors;
window.forceReloadStyles = forceReloadStyles;

console.log('=== SCRIPT DE PRUEBA CARGADO ===');
