// Fix & Flip Underwriting Calculator JavaScript - Project Manager Fixed Version

// Global variables
let projects = JSON.parse(localStorage.getItem('fixFlipProjects')) || [];
let currentCalculation = null;
let lastModifiedField = null;
let editingProjectId = null;
let currentProjectManager = null;

// Project Manager variables
let selectedArea = '';
let selectedCategory = '';
let selectedSubcategories = [];

// Base de datos de subcategorías con costos predefinidos
const subcategoryDatabase = {
    "Baños": {
        "Reemplazar inodoro": { materials: 150, labor: 200, unit: "EACH" },
        "Reemplazar lavamanos": { materials: 120, labor: 150, unit: "EACH" },
        "Reemplazar regadera": { materials: 300, labor: 400, unit: "EACH" },
        "Reemplazar tina": { materials: 400, labor: 500, unit: "EACH" },
        "Reemplazar accesorios": { materials: 80, labor: 100, unit: "EACH" },
        "Instalar mampara": { materials: 250, labor: 300, unit: "EACH" },
        "Reparar fuga": { materials: 50, labor: 150, unit: "EACH" },
        "Cambiar azulejos": { materials: 8, labor: 12, unit: "SQFT" },
        "Instalar gabinete": { materials: 200, labor: 250, unit: "EACH" },
        "Instalar espejo": { materials: 100, labor: 80, unit: "EACH" },
        "Instalar ventilador": { materials: 80, labor: 120, unit: "EACH" },
        "Pintar baño": { materials: 2, labor: 3, unit: "SQFT" }
    },
    "Cocina": {
        "Reemplazar gabinetes superiores": { materials: 150, labor: 200, unit: "LINEAR_FT" },
        "Reemplazar gabinetes inferiores": { materials: 200, labor: 250, unit: "LINEAR_FT" },
        "Instalar countertop": { materials: 40, labor: 60, unit: "SQFT" },
        "Reemplazar fregadero": { materials: 250, labor: 200, unit: "EACH" },
        "Instalar grifo": { materials: 120, labor: 150, unit: "EACH" },
        "Reemplazar electrodomésticos": { materials: 800, labor: 200, unit: "EACH" },
        "Instalar isla": { materials: 500, labor: 400, unit: "EACH" },
        "Instalar backsplash": { materials: 15, labor: 25, unit: "SQFT" },
        "Reemplazar piso": { materials: 5, labor: 8, unit: "SQFT" },
        "Instalar iluminación bajo gabinetes": { materials: 100, labor: 150, unit: "LINEAR_FT" },
        "Pintar cocina": { materials: 2, labor: 3, unit: "SQFT" }
    },
    "Pisos": {
        "Instalar piso flotante": { materials: 3, labor: 5, unit: "SQFT" },
        "Instalar baldosas": { materials: 4, labor: 8, unit: "SQFT" },
        "Instalar madera": { materials: 8, labor: 10, unit: "SQFT" },
        "Instalar alfombra": { materials: 3, labor: 4, unit: "SQFT" },
        "Nivelar piso": { materials: 2, labor: 6, unit: "SQFT" },
        "Instalar baseboards": { materials: 3, labor: 5, unit: "LINEAR_FT" },
        "Reparar piso existente": { materials: 50, labor: 100, unit: "SQFT" }
    },
    "Pintura": {
        "Pintar paredes": { materials: 1, labor: 2, unit: "SQFT" },
        "Pintar techo": { materials: 0.8, labor: 1.5, unit: "SQFT" },
        "Pintar molduras": { materials: 2, labor: 3, unit: "LINEAR_FT" },
        "Pintar puertas": { materials: 25, labor: 50, unit: "EACH" },
        "Preparar superficies": { materials: 0.5, labor: 3, unit: "SQFT" },
        "Remover papel pintado": { materials: 1, labor: 4, unit: "SQFT" }
    },
    "Eléctrico": {
        "Reemplazar panel eléctrico": { materials: 800, labor: 600, unit: "EACH" },
        "Instalar tomacorrientes": { materials: 20, labor: 80, unit: "EACH" },
        "Instalar interruptores": { materials: 15, labor: 60, unit: "EACH" },
        "Instalar plafones": { materials: 40, labor: 100, unit: "EACH" },
        "Instalar luces empotradas": { materials: 80, labor: 150, unit: "EACH" },
        "Cableado nuevo": { materials: 2, labor: 8, unit: "LINEAR_FT" },
        "Instalar breaker": { materials: 25, labor: 100, unit: "EACH" }
    },
    "Plomería": {
        "Reemplazar tuberías": { materials: 5, labor: 15, unit: "LINEAR_FT" },
        "Instalar calentador": { materials: 600, labor: 400, unit: "EACH" },
        "Reparar fuga": { materials: 50, labor: 200, unit: "EACH" },
        "Instalar válvulas": { materials: 80, labor: 120, unit: "EACH" },
        "Limpiar drenajes": { materials: 0, labor: 150, unit: "EACH" },
        "Instalar bomba de agua": { materials: 400, labor: 300, unit: "EACH" }
    },
    "Techo": {
        "Reemplazar tejas asfálticas": { materials: 2.5, labor: 3, unit: "SQFT" },
        "Reemplazar tejas metálicas": { materials: 4, labor: 4, unit: "SQFT" },
        "Reparar goteras": { materials: 100, labor: 300, unit: "EACH" },
        "Limpiar canaletas": { materials: 0, labor: 150, unit: "EACH" },
        "Reemplazar canaletas": { materials: 8, labor: 10, unit: "LINEAR_FT" },
        "Instalar ventilación": { materials: 200, labor: 250, unit: "EACH" }
    },
    "Paredes Exteriores/Fachada": {
        "Repintar fachada": { materials: 1.5, labor: 3, unit: "SQFT" },
        "Reparar estuco": { materials: 3, labor: 8, unit: "SQFT" },
        "Reemplazar siding": { materials: 4, labor: 6, unit: "SQFT" },
        "Limpiar fachada": { materials: 0.5, labor: 2, unit: "SQFT" },
        "Sellar grietas": { materials: 2, labor: 5, unit: "LINEAR_FT" },
        "Instalar aislamiento exterior": { materials: 2, labor: 4, unit: "SQFT" }
    }
};

// Format currency function
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

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

// Función para obtener opciones de subcategoría
function getSubcategoryOptions(category) {
    if (category === 'INTERIOR') {
        return `
            <option value="Demolición Interior">Demolición Interior</option>
            <option value="Estructura">Estructura</option>
            <option value="Plomería">Plomería</option>
            <option value="Eléctrico">Eléctrico</option>
            <option value="HVAC">HVAC</option>
            <option value="Aislamiento y Drywall">Aislamiento y Drywall</option>
            <option value="Pisos">Pisos</option>
            <option value="Cocina">Cocina</option>
            <option value="Baños">Baños</option>
            <option value="Dormitorios">Dormitorios</option>
            <option value="Areas Comunes">Areas Comunes</option>
            <option value="Puertas">Puertas</option>
            <option value="Ventanas">Ventanas</option>
            <option value="Pintura">Pintura</option>
            <option value="Molduras y Acabados">Molduras y Acabados</option>
            <option value="Lista Final Interior">Lista Final Interior</option>
        `;
    } else {
        return `
            <option value="Techo">Techo</option>
            <option value="Cimientos">Cimientos</option>
            <option value="Paredes Exteriores/Fachada">Paredes Exteriores/Fachada</option>
            <option value="Ventanas y Puertas Exteriores">Ventanas y Puertas Exteriores</option>
            <option value="Entrada de Vehículos">Entrada de Vehículos</option>
            <option value="Caminos">Caminos</option>
            <option value="Paisajismo">Paisajismo</option>
            <option value="Drenaje">Drenaje</option>
            <option value="Cerca/Puerta">Cerca/Puerta</option>
            <option value="Iluminación Exterior">Iluminación Exterior</option>
            <option value="Garaje/Cochera">Garaje/Cochera</option>
            <option value="Patio/Balcón/Terraza">Patio/Balcón/Terraza</option>
            <option value="Alberca">Alberca</option>
            <option value="Lista Final Exterior">Lista Final Exterior</option>
        `;
    }
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

// Función para actualizar subcategorías
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

// Función para guardar ítem del proyecto
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
    
    // Limpiar variables
    selectedArea = '';
    selectedSubcategories = [];
    
    // Mostrar notificación
    showNotification('Ítem agregado exitosamente', 'success');
    
    console.log('Item saved successfully');
}

// Funciones de soporte (placeholder)
function renderModuleItems(category) {
    console.log('renderModuleItems called for category:', category);
    // Implementar según necesidad
}

function updateBudget() {
    console.log('updateBudget called');
    // Implementar según necesidad
}

function renderDashboard() {
    console.log('renderDashboard called');
    // Implementar según necesidad
}

function showNotification(message, type) {
    console.log('Notification:', message, type);
    // Implementar según necesidad
}

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    console.log('Project Manager Fixed Version Loaded');
});
