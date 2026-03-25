// Funciones corregidas para el Project Manager

// Variables globales para el modal
let selectedArea = '';
let selectedCategory = '';
let selectedSubcategories = [];

// Función para agregar ítem al proyecto
function addProjectItem(category) {
    console.log('addProjectItem called with category:', category);
    
    // Reiniciar variables
    selectedArea = '';
    selectedCategory = category;
    selectedSubcategories = [];
    
    console.log('Variables reset - selectedArea:', selectedArea, 'selectedCategory:', selectedCategory);
    
    // Crear modal para agregar ítem
    const modal = document.createElement('div');
    modal.id = 'pm-item-modal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
            <div style="background: #1a1f2e; color: white; padding: 30px; border-radius: 10px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto; border: 2px solid #d4af37;">
                <div style="background: #007bff; color: white; padding: 15px; margin: -30px -30px 20px -30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h3 style="margin: 0; color: white;">🔧 Agregar Ítem - ${category === 'INTERIOR' ? 'Interior' : 'Exterior'}</h3>
                    <button onclick="closeItemModal()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
                </div>
                
                <form id="pm-item-form">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <label style="color: #d4af37;">Área/Subcategoría</label>
                                <button type="button" class="btn btn-sm btn-outline-primary" onclick="addNewCategory()">
                                    <i class="bi bi-plus-circle me-1"></i>Agregar Categoría
                                </button>
                            </div>
                            <select class="form-control" id="item-area-search" onchange="selectArea(this.value)" oninput="filterAreas(this.value, '${category}')">
                                <option value="">Seleccionar...</option>
                                ${getSubcategoryOptions(category)}
                            </select>
                            <div id="filtered-areas" style="position: absolute; z-index: 1000; background: #2c3440; border: 1px solid #d4af37; border-radius: 5px; max-height: 200px; overflow-y: auto; width: 100%; display: none;">
                                <!-- Se llenará dinámicamente -->
                            </div>
                        </div>
                        <div class="col-md-6">
                            <!-- Eliminado el tipo de trabajo general -->
                        </div>
                    </div>
                    
                    <!-- Subcategorías Detalladas -->
                    <div class="row mb-3" id="subcategory-row" style="display: none;">
                        <div class="col-md-12">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <label style="color: #d4af37;">Subcategorías Detalladas</label>
                                <button type="button" class="btn btn-sm btn-outline-success" onclick="addNewSubcategory()">
                                    <i class="bi bi-plus-circle me-1"></i>Agregar Subcategoría
                                </button>
                            </div>
                            <div id="subcategory-options" style="max-height: 300px; overflow-y: auto; border: 1px solid #d4af37; border-radius: 5px; padding: 10px; background: #2c3440;">
                                <!-- Se llenará dinámicamente -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label style="color: #d4af37;">Descripción del Trabajo</label>
                        <textarea class="form-control" id="item-description" rows="3" required placeholder="Describe el trabajo a realizar..."></textarea>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Cantidad</label>
                            <input type="number" class="form-control" id="item-quantity" value="1" min="1" required>
                        </div>
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Unidad</label>
                            <select class="form-control" id="item-unit" required>
                                <option value="EACH">Cada uno</option>
                                <option value="SQFT">Pie Cuadrado</option>
                                <option value="LINEAR_FT">Pie Lineal</option>
                                <option value="HOUR">Hora</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Prioridad</label>
                            <select class="form-control" id="item-priority" required>
                                <option value="HIGH">Alta</option>
                                <option value="MEDIUM">Media</option>
                                <option value="LOW">Baja</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Estado</label>
                            <select class="form-control" id="item-status" required>
                                <option value="PLANNING">Planificación</option>
                                <option value="IN_PROGRESS">En Progreso</option>
                                <option value="COMPLETED">Completado</option>
                                <option value="ON_HOLD">En Espera</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Materiales</label>
                            <input type="number" class="form-control" id="item-materials" value="0" step="100" readonly>
                            <small class="text-muted">Suma automática de subcategorías</small>
                        </div>
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Mano de Obra</label>
                            <input type="number" class="form-control" id="item-labor" value="0" step="100" readonly>
                            <small class="text-muted">Suma automática de subcategorías</small>
                        </div>
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Otros Costos</label>
                            <input type="number" class="form-control" id="item-other" value="0" step="100">
                            <small class="text-muted">Permisos, impuestos, etc.</small>
                        </div>
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Margen (%)</label>
                            <input type="number" class="form-control" id="item-markup" value="15" step="5">
                            <small class="text-muted">% para ganancia del contratista</small>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label style="color: #d4af37;">Notas</label>
                        <textarea class="form-control" id="item-notes" rows="2" placeholder="Notas adicionales..."></textarea>
                    </div>
                    
                    <div class="text-center">
                        <button type="button" class="btn btn-success" onclick="saveProjectItem('${category}')">
                            <i class="bi bi-save me-2"></i>Guardar Ítem
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="closeItemModal()">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Esperar un momento para que el DOM se actualice
    setTimeout(() => {
        console.log('Modal added to DOM');
    }, 100);
}

// Función para filtrar áreas por búsqueda
function filterAreas(searchTerm, category) {
    selectedCategory = category;
    const select = document.getElementById('item-area-search');
    const options = select.options;
    
    if (!searchTerm) {
        // Si no hay búsqueda, mostrar todas las opciones
        for (let i = 1; i < options.length; i++) {
            options[i].style.display = '';
        }
        return;
    }
    
    // Filtrar opciones según búsqueda
    for (let i = 1; i < options.length; i++) {
        const option = options[i];
        const matches = option.text.toLowerCase().includes(searchTerm.toLowerCase());
        option.style.display = matches ? '' : 'none';
    }
}

// Función para seleccionar área
function selectArea(area) {
    selectedArea = area;
    updateSubcategories(area, selectedCategory);
}

// Función para actualizar subcategorías con edición de costos
function updateSubcategories(area, category) {
    const subcategoryRow = document.getElementById('subcategory-row');
    const subcategoryOptions = document.getElementById('subcategory-options');
    
    if (!area || !subcategoryDatabase[area]) {
        subcategoryRow.style.display = 'none';
        subcategoryOptions.innerHTML = '';
        return;
    }
    
    subcategoryRow.style.display = 'block';
    
    const subcategories = subcategoryDatabase[area];
    let html = '';
    
    for (const [name, costs] of Object.entries(subcategories)) {
        const total = costs.materials + costs.labor;
        const safeName = name.replace(/[^a-zA-Z0-9]/g, '');
        html += `
            <div class="form-check mb-2" style="padding: 8px; border: 1px solid #444; border-radius: 5px; cursor: pointer;">
                <label class="form-check-label" style="cursor: pointer; width: 100%;">
                    <div class="row align-items-center">
                        <div class="col-md-5">
                            <input type="checkbox" class="form-check-input" id="sub-${safeName}" onchange="toggleSubcategory('${name}', ${costs.materials}, ${costs.labor}, '${costs.unit}', this.checked)">
                            <span style="font-weight: normal;">${name}</span>
                        </div>
                        <div class="col-md-2">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text" style="font-size: 11px;">Mat:</span>
                                <input type="number" class="form-control form-control-sm" value="${costs.materials}" step="10" style="width: 70px;" onchange="updateSubcategoryCost('${name}', 'materials', this.value)">
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text" style="font-size: 11px;">MO:</span>
                                <input type="number" class="form-control form-control-sm" value="${costs.labor}" step="10" style="width: 70px;" onchange="updateSubcategoryCost('${name}', 'labor', this.value)">
                            </div>
                        </div>
                        <div class="col-md-3 text-end">
                            <small class="text-success">Total: <span id="total-${safeName}">${formatCurrency(total)}</span></small>
                            <button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="deleteSubcategory('${name}', event)" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-md-12">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text" style="font-size: 11px;">Tipo:</span>
                                <select class="form-control form-control-sm" id="worktype-${safeName}" onchange="updateWorkType('${name}', this.value)">
                                    <option value="REPAIR">Reparar</option>
                                    <option value="REPLACE">Reemplazar</option>
                                    <option value="NEW">Nuevo</option>
                                    <option value="UPGRADE">Mejorar</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </label>
            </div>
        `;
    }
    
    subcategoryOptions.innerHTML = html;
}

// Función para manejar selección de subcategoría
function toggleSubcategory(name, materials, labor, unit, isChecked) {
    if (isChecked) {
        // Agregar a seleccionados
        selectedSubcategories.push({
            name: name,
            materials: materials,
            labor: labor,
            unit: unit,
            workType: document.getElementById(`worktype-${name.replace(/[^a-zA-Z0-9]/g, '')}`)?.value || 'REPAIR'
        });
    } else {
        // Remover de seleccionados
        selectedSubcategories = selectedSubcategories.filter(sub => sub.name !== name);
    }
    
    // Actualizar sumas automáticas
    updateAutomaticTotals();
    
    // Actualizar descripción si es necesario
    const description = document.getElementById('item-description');
    if (selectedSubcategories.length > 0 && (!description.value || description.value === '')) {
        if (selectedSubcategories.length === 1) {
            description.value = selectedSubcategories[0].name;
        } else {
            description.value = selectedSubcategories.map(sub => sub.name).join(', ');
        }
    } else if (selectedSubcategories.length === 0) {
        // Limpiar campos si no hay selección
        document.getElementById('item-materials').value = 0;
        document.getElementById('item-labor').value = 0;
        document.getElementById('item-unit').value = 'EACH';
        document.getElementById('item-description').value = '';
    }
}

// Función para actualizar sumas automáticas
function updateAutomaticTotals() {
    if (selectedSubcategories.length === 0) {
        document.getElementById('item-materials').value = 0;
        document.getElementById('item-labor').value = 0;
        return;
    }
    
    // Sumar materiales y mano de obra de todas las subcategorías seleccionadas
    const totalMaterials = selectedSubcategories.reduce((sum, sub) => sum + sub.materials, 0);
    const totalLabor = selectedSubcategories.reduce((sum, sub) => sum + sub.labor, 0);
    
    // Actualizar campos readonly
    document.getElementById('item-materials').value = totalMaterials;
    document.getElementById('item-labor').value = totalLabor;
    
    // Actualizar unidad si hay una sola subcategoría seleccionada
    if (selectedSubcategories.length === 1) {
        document.getElementById('item-unit').value = selectedSubcategories[0].unit;
    }
}

// Función para actualizar tipo de trabajo
function updateWorkType(name, workType) {
    const subcategory = selectedSubcategories.find(sub => sub.name === name);
    if (subcategory) {
        subcategory.workType = workType;
    }
}

// Función para actualizar costo de subcategoría
function updateSubcategoryCost(name, costType, value) {
    if (!subcategoryDatabase[selectedArea]) return;
    
    const numValue = parseFloat(value) || 0;
    subcategoryDatabase[selectedArea][name][costType] = numValue;
    
    // Actualizar total en la subcategoría
    const costs = subcategoryDatabase[selectedArea][name];
    const total = costs.materials + costs.labor;
    const totalElement = document.getElementById(`total-${name.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (totalElement) {
        totalElement.textContent = formatCurrency(total);
    }
    
    // Si esta subcategoría está seleccionada, actualizar las sumas automáticas
    const selectedSub = selectedSubcategories.find(sub => sub.name === name);
    if (selectedSub) {
        selectedSub[costType] = numValue;
        updateAutomaticTotals();
    }
}

// Función para eliminar subcategoría
function deleteSubcategory(name, event) {
    event.stopPropagation();
    
    if (confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) {
        delete subcategoryDatabase[selectedArea][name];
        updateSubcategories(selectedArea, selectedCategory);
    }
}

// Función para agregar nueva categoría
function addNewCategory() {
    const categoryName = prompt('Nombre de la nueva categoría:');
    if (!categoryName) return;
    
    // Agregar a la base de datos como categoría vacía
    subcategoryDatabase[categoryName] = {};
    
    alert(`Categoría "${categoryName}" agregada. Ahora puedes agregarle subcategorías.`);
    
    // Seleccionar la nueva categoría automáticamente
    selectArea(categoryName);
}

// Función para agregar nueva subcategoría
function addNewSubcategory() {
    if (!selectedArea) {
        alert('Por favor selecciona un área primero');
        return;
    }
    
    const name = prompt('Nombre de la nueva subcategoría:');
    if (!name) return;
    
    const materials = parseFloat(prompt('Costo de Materiales:')) || 0;
    const labor = parseFloat(prompt('Costo de Mano de Obra:')) || 0;
    const unit = prompt('Unidad (EACH, SQFT, LINEAR_FT, HOUR):') || 'EACH';
    
    if (!subcategoryDatabase[selectedArea]) {
        subcategoryDatabase[selectedArea] = {};
    }
    
    subcategoryDatabase[selectedArea][name] = {
        materials: materials,
        labor: labor,
        unit: unit
    };
    
    updateSubcategories(selectedArea, selectedCategory);
}

// Función para cerrar modal
function closeItemModal() {
    const modal = document.getElementById('pm-item-modal');
    if (modal) {
        modal.remove();
    }
}
