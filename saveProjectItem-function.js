// Función corregida para guardar ítem del proyecto
function saveProjectItem(category) {
    console.log('saveProjectItem called with category:', category);
    console.log('selectedArea:', selectedArea);
    console.log('selectedSubcategories:', selectedSubcategories);
    
    // Validar que se haya seleccionado un área
    if (!selectedArea) {
        alert('Por favor selecciona un área primero');
        return;
    }
    
    // Validar que se haya seleccionado al menos una subcategoría
    if (selectedSubcategories.length === 0) {
        alert('Por favor selecciona al menos una subcategoría');
        return;
    }
    
    // Validar que exista currentProjectManager
    if (!currentProjectManager) {
        alert('Error: No hay un proyecto activo');
        return;
    }
    
    // Obtener valores del formulario
    const materials = parseFloat(document.getElementById('item-materials').value) || 0;
    const labor = parseFloat(document.getElementById('item-labor').value) || 0;
    const other = parseFloat(document.getElementById('item-other').value) || 0;
    const markup = parseFloat(document.getElementById('item-markup').value) || 0;
    
    console.log('Form values - materials:', materials, 'labor:', labor, 'other:', other, 'markup:', markup);
    
    const subtotal = materials + labor + other;
    const markupAmount = subtotal * (markup / 100);
    const totalEstimated = subtotal + markupAmount;
    
    console.log('Calculated - subtotal:', subtotal, 'markupAmount:', markupAmount, 'totalEstimated:', totalEstimated);
    
    // Crear descripción combinada si hay múltiples subcategorías
    let description = document.getElementById('item-description').value;
    if (selectedSubcategories.length > 1 && (!description || description === '')) {
        description = selectedSubcategories.map(sub => sub.name).join(', ');
    } else if (!description || description === '') {
        description = 'Trabajo en ' + selectedArea;
    }
    
    // Obtener el tipo de trabajo del primer ítem seleccionado (o usar 'REPAIR' por defecto)
    const workType = selectedSubcategories.length > 0 ? 
        (selectedSubcategories[0].workType || 'REPAIR') : 'REPAIR';
    
    // Crear el nuevo ítem
    const newItem = {
        id: Date.now().toString(),
        category: category,
        area: selectedArea,
        description: description,
        workType: workType,
        priority: document.getElementById('item-priority').value,
        quantity: parseInt(document.getElementById('item-quantity').value) || 1,
        unit: document.getElementById('item-unit').value || 'EACH',
        materialsCost: materials,
        laborCost: labor,
        otherCosts: other,
        markup: markup,
        totalEstimated: totalEstimated,
        totalActual: 0,
        status: 'PLANNING',
        notes: document.getElementById('item-notes').value || '',
        created: new Date().toISOString(),
        subcategories: [...selectedSubcategories] // Copiar las subcategorías seleccionadas
    };
    
    console.log('New item to save:', newItem);
    
    // Agregar al project manager
    if (!currentProjectManager.projectData.items) {
        currentProjectManager.projectData.items = [];
    }
    
    currentProjectManager.projectData.items.push(newItem);
    currentProjectManager.projectData.lastUpdated = new Date().toISOString();
    
    console.log('Items after adding:', currentProjectManager.projectData.items.length);
    
    // Actualizar presupuesto
    updateBudget();
    
    // Guardar en localStorage
    try {
        localStorage.setItem(`pm_${currentProjectManager.dealId}`, JSON.stringify(currentProjectManager.projectData));
        console.log('Saved to localStorage successfully');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('Error al guardar el proyecto');
        return;
    }
    
    // Recargar la tabla
    renderModuleItems(category);
    
    // Cerrar modal
    closeItemModal();
    
    // Actualizar dashboard
    renderDashboard();
    
    // Limpiar variables
    selectedArea = '';
    selectedSubcategories = [];
    
    // Mostrar notificación
    showNotification('Ítem agregado exitosamente', 'success');
    
    console.log('Item saved successfully');
}
