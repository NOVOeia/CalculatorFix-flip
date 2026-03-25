// Fix & Flip Underwriting Calculator JavaScript - Complete Version

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

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM Loaded - Initializing calculator...');

    // Load projects and setup
    loadProjects();
    initializeCharts();

    // Setup event listeners for real-time updates
    setupEventListeners();

    // Initial calculation
    setTimeout(() => {
        calculateUnderwriting();
        showSection('home');
    }, 500);

    console.log('Initialization complete');
});

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Add listeners to all input fields
    const inputs = document.querySelectorAll('input[type="number"], input[type="text"], select');
    console.log(`Found ${inputs.length} input fields`);

    inputs.forEach((input, index) => {
        input.addEventListener('focus', function () {
            // Track which field is being edited
            lastModifiedField = input.id;
            console.log(`Field focused: ${input.id}`);
        });

        input.addEventListener('input', function () {
            console.log(`Input ${index} (${input.id}) changed to: ${input.value}`);
            // Don't auto-calculate during editing to allow free typing
            // Only calculate when user finishes (change event or blur)
        });

        input.addEventListener('change', function () {
            console.log(`Input ${index} (${input.id}) changed (change event): ${input.value}`);
            calculateUnderwriting();
        });

        input.addEventListener('blur', function () {
            console.log(`Input ${index} (${input.id}) blurred with value: ${input.value}`);
            // Calculate when user leaves the field
            calculateUnderwriting();
        });
    });

    console.log('Event listeners setup complete');
}

// Main calculation function
function calculateUnderwriting() {
    console.log('=== CALCULATION STARTED ===');

    try {
        // Get all input values with error handling
        const getInputValue = (id, defaultValue = 0) => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element not found: ${id}`);
                return defaultValue;
            }
            const value = parseFloat(element.value) || defaultValue;
            console.log(`${id}: ${value}`);
            return value;
        };

        const getInputText = (id, defaultValue = '') => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element not found: ${id}`);
                return defaultValue;
            }
            return element.value || defaultValue;
        };

        // Property Info
        const propertyAddress = getInputText('property-address', 'Property Address');
        const projectMonths = getInputValue('project-months', 0);
        const arv = getInputValue('arv', 0);
        const purchasePrice = getInputValue('purchase-price', 0);
        const rehabBudget = getInputValue('rehab-budget', 0);
        const closingCosts = getInputValue('closing-costs', 0);
        const holdingCosts = getInputValue('holding-costs', 0);

        // HML Financing
        const hmlLoanAmount = getInputValue('hml-loan-amount', 0);
        const hmlLoanPercent = getInputValue('hml-loan-percent', 0);
        const downPaymentAmount = getInputValue('down-payment-amount', 0);
        const downPaymentPercent = getInputValue('down-payment-percent', 0);
        const hmlPointsRate = getInputValue('hml-points-rate', 0);
        const hmlInterestRate = getInputValue('hml-interest-rate', 0);
        const interestType = getInputText('interest-type', 'monthly');
        const hmlAdminFees = getInputValue('hml-admin-fees', 0);

        // Selling Costs
        const reCommissions = getInputValue('re-commissions', 0);
        const resaleClosingCosts = getInputValue('resale-closing-costs', 0);

        // Profit Criteria
        const profitMinPercent = getInputValue('profit-min-percent', 0);
        const profitMinAmount = getInputValue('profit-min-amount', 0);

        console.log('All inputs retrieved successfully');

        // CALCULATIONS
        console.log('Starting calculations...');

        // 1. Project Costs
        const totalHoldingCosts = holdingCosts * projectMonths;
        const totalProjectCosts = purchasePrice + rehabBudget + closingCosts + totalHoldingCosts;
        console.log(`Total Project Costs: Purchase=$${purchasePrice}, Rehab=$${rehabBudget}, Closing=$${closingCosts}, Holding=$${totalHoldingCosts} (${holdingCosts}×${projectMonths} meses), Total=$${totalProjectCosts}`);

        // 2. HML Financing Calculations
        let calculatedDownPaymentAmount = downPaymentAmount;
        let calculatedDownPaymentPercent = downPaymentPercent;
        let calculatedHmlLoanAmount = hmlLoanAmount;
        let calculatedHmlLoanPercent = hmlLoanPercent;

        // Down Payment calculations
        if (downPaymentAmount > 0 && purchasePrice > 0 && downPaymentPercent === 0) {
            calculatedDownPaymentPercent = (downPaymentAmount / purchasePrice) * 100;
        } else if (downPaymentPercent > 0 && purchasePrice > 0 && downPaymentAmount === 0) {
            calculatedDownPaymentAmount = (purchasePrice * downPaymentPercent) / 100;
        } else if (downPaymentAmount > 0 && downPaymentPercent > 0 && purchasePrice > 0) {
            const expectedPercent = (downPaymentAmount / purchasePrice) * 100;
            const expectedAmount = (purchasePrice * downPaymentPercent) / 100;
            
            if (lastModifiedField === 'down-payment-amount') {
                calculatedDownPaymentPercent = expectedPercent;
            } else if (lastModifiedField === 'down-payment-percent') {
                calculatedDownPaymentAmount = expectedAmount;
            }
        }

        // HML Loan calculations
        if (hmlLoanAmount > 0 && purchasePrice > 0 && hmlLoanPercent === 0) {
            calculatedHmlLoanPercent = (hmlLoanAmount / purchasePrice) * 100;
        } else if (hmlLoanPercent > 0 && purchasePrice > 0 && hmlLoanAmount === 0) {
            calculatedHmlLoanAmount = (purchasePrice * hmlLoanPercent) / 100;
        } else if (hmlLoanAmount > 0 && hmlLoanPercent > 0 && purchasePrice > 0) {
            const expectedPercent = (hmlLoanAmount / purchasePrice) * 100;
            const expectedAmount = (purchasePrice * hmlLoanPercent) / 100;
            
            if (lastModifiedField === 'hml-loan-amount') {
                calculatedHmlLoanPercent = expectedPercent;
            } else if (lastModifiedField === 'hml-loan-percent') {
                calculatedHmlLoanAmount = expectedAmount;
            }
        }

        // 3. Calculate GAP Loan if needed
        const totalFinancingNeeded = totalProjectCosts - calculatedDownPaymentAmount;
        let gapLoanAmount = 0;
        if (calculatedHmlLoanAmount < totalFinancingNeeded) {
            gapLoanAmount = totalFinancingNeeded - calculatedHmlLoanAmount;
        }

        // 4. Calculate financing costs
        const hmlPoints = calculatedHmlLoanAmount * (hmlPointsRate / 100);
        const monthlyRate = hmlInterestRate / 100 / 12;
        const monthlyPayment = calculatedHmlLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, projectMonths) / (Math.pow(1 + monthlyRate, projectMonths) - 1);
        const totalHmlInterest = monthlyPayment * projectMonths - calculatedHmlLoanAmount;
        const totalFinancingCosts = hmlPoints + totalHmlInterest + hmlAdminFees;

        // 5. Total Costs Plus (TCP)
        const tpcPlusCost = totalProjectCosts + totalFinancingCosts;

        // 6. Selling Costs
        const totalSellingCosts = reCommissions + resaleClosingCosts;

        // 7. Calculate profit and ROI
        const totalCosts = tpcPlusCost + totalSellingCosts;
        const profit = arv - totalCosts;
        const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

        // 8. Deal decision
        const dealDecision = profit >= profitMinAmount && roi >= profitMinPercent;

        // Update current calculation object
        currentCalculation = {
            propertyAddress,
            projectMonths,
            arv,
            purchasePrice,
            rehabBudget,
            closingCosts,
            holdingCosts,
            totalHoldingCosts,
            totalProjectCosts,
            downPaymentAmount: calculatedDownPaymentAmount,
            downPaymentPercent: calculatedDownPaymentPercent,
            hmlLoanAmount: calculatedHmlLoanAmount,
            hmlLoanPercent: calculatedHmlLoanPercent,
            gapLoanAmount,
            hmlPoints,
            hmlInterestRate,
            interestType,
            hmlAdminFees,
            monthlyPayment,
            totalHmlInterest,
            totalFinancingCosts,
            tpcPlusCost,
            reCommissions,
            resaleClosingCosts,
            totalSellingCosts,
            totalCosts,
            profit,
            roi,
            dealDecision,
            profitMinPercent,
            profitMinAmount
        };

        // Update UI
        updateResults(currentCalculation);

        console.log('Calculation completed successfully');
        console.log('Current calculation:', currentCalculation);

    } catch (error) {
        console.error('Error in calculation:', error);
        showNotification('Error en el cálculo', 'error');
    }
}

// Update results in the UI
function updateResults(calc) {
    try {
        // Update calculated values
        const updateValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = formatCurrency(value);
            }
        };

        const updatePercent = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value.toFixed(1) + '%';
            }
        };

        // Update main results
        updateValue('total-project-costs', calc.totalProjectCosts);
        updateValue('total-holding-costs', calc.totalHoldingCosts);
        updateValue('down-payment-amount-calc', calc.downPaymentAmount);
        updatePercent('down-payment-percent-calc', calc.downPaymentPercent);
        updateValue('hml-loan-amount-calc', calc.hmlLoanAmount);
        updatePercent('hml-loan-percent-calc', calc.hmlLoanPercent);
        updateValue('gap-loan-amount', calc.gapLoanAmount);
        updateValue('hml-points', calc.hmlPoints);
        updateValue('monthly-payment', calc.monthlyPayment);
        updateValue('total-hml-interest', calc.totalHmlInterest);
        updateValue('total-financing-costs', calc.totalFinancingCosts);
        updateValue('tpc-plus-cost', calc.tpcPlusCost);
        updateValue('total-selling-costs', calc.totalSellingCosts);
        updateValue('total-costs', calc.totalCosts);
        updateValue('profit', calc.profit);
        updatePercent('roi', calc.roi);

        // Update deal decision
        const decisionElement = document.getElementById('deal-decision');
        if (decisionElement) {
            decisionElement.textContent = calc.dealDecision ? 'BUENO' : 'MALO';
            decisionElement.className = calc.dealDecision ? 'text-success' : 'text-danger';
        }

        // Update profit criteria
        updatePercent('profit-min-percent-display', calc.profitMinPercent);
        updateValue('profit-min-amount-display', calc.profitMinAmount);

        console.log('Results updated successfully');

    } catch (error) {
        console.error('Error updating results:', error);
    }
}

// Load projects function
function loadProjects() {
    console.log('Loading projects...');
    const tbody = document.getElementById('projects-tbody');
    if (!tbody) {
        console.warn('Projects tbody not found');
        return;
    }

    tbody.innerHTML = '';

    projects.forEach(project => {
        const row = `
            <tr>
                <td>${project.projectName || 'Sin nombre'}</td>
                <td>${project.propertyAddress}</td>
                <td class="text-success-gold">${formatCurrency(project.tpcPlusCost)}</td>
                <td class="${project.roi >= 20 ? 'text-success-gold' : project.roi >= 0 ? 'text-warning-gold' : 'text-danger-gold'}">${project.roi.toFixed(1)}%</td>
                <td class="${project.projection >= 0 ? 'text-success-gold' : 'text-danger-gold'}">${formatCurrency(project.projection)}</td>
                <td>
                    <span class="badge ${project.dealDecision ? 'bg-success' : 'bg-danger'}">
                        ${project.dealDecision ? 'BUENO' : 'MALO'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewProject(${project.id})" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="exportSingleProjectReportPDF(${project.id})" title="Descargar PDF">
                        <i class="bi bi-file-earmark-pdf"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="openProjectManager(${project.id})" title="Project Manager">
                        <i class="bi bi-clipboard-data"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProject(${project.id})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    console.log(`Loaded ${projects.length} projects`);
}

// Save project function
function saveProject() {
    if (!currentCalculation) {
        showNotification('No hay cálculo para guardar', 'error');
        return;
    }

    if (editingProjectId) {
        // Update existing project
        const index = projects.findIndex(p => p.id === editingProjectId);
        if (index !== -1) {
            projects[index] = {
                ...currentCalculation,
                id: editingProjectId,
                date: new Date().toISOString()
            };
            showNotification('Deal actualizado exitosamente', 'success');
        } else {
            // Fallback if ID not found
            projects.push({ ...currentCalculation, id: Date.now() });
            showNotification('Deal creado (ID previo no encontrado)', 'info');
        }
        editingProjectId = null;
    } else {
        // Create new project
        const project = {
            ...currentCalculation,
            id: Date.now()
        };
        projects.push(project);
        showNotification('Deal guardado exitosamente', 'success');
    }

    localStorage.setItem('fixFlipProjects', JSON.stringify(projects));
    loadProjects();
}

// View project function
function viewProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
        showNotification('Proyecto no encontrado', 'error');
        return;
    }

    editingProjectId = projectId;
    showNotification(`Editando deal: ${project.propertyAddress}`, 'info');
    showSection('calculator');

    // Populate form with project data
    const setInputValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
    };

    setInputValue('property-address', project.propertyAddress || '');
    setInputValue('project-months', project.projectMonths || 0);
    setInputValue('arv', project.arv || 0);
    setInputValue('purchase-price', project.purchasePrice || 0);
    setInputValue('rehab-budget', project.rehabBudget || 0);
    setInputValue('closing-costs', project.closingCosts || 0);
    setInputValue('holding-costs', project.holdingCosts || 0);
    setInputValue('down-payment-amount', project.downPaymentAmount || 0);
    setInputValue('down-payment-percent', project.downPaymentPercent || 0);
    setInputValue('hml-loan-amount', project.hmlLoanAmount || 0);
    setInputValue('hml-loan-percent', project.hmlLoanPercent || 0);
    setInputValue('hml-points-rate', project.hmlPointsRate || 0);
    setInputValue('hml-interest-rate', project.hmlInterestRate || 0);
    setInputValue('interest-type', project.interestType || 'monthly');
    setInputValue('hml-admin-fees', project.hmlAdminFees || 0);
    setInputValue('re-commissions', project.reCommissions || 0);
    setInputValue('resale-closing-costs', project.resaleClosingCosts || 0);
    setInputValue('profit-min-percent', project.profitMinPercent || 0);
    setInputValue('profit-min-amount', project.profitMinAmount || 0);

    // Recalculate to update results
    calculateUnderwriting();

    showNotification('Proyecto cargado exitosamente', 'success');
}

// Delete project function
function deleteProject(projectId) {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
        projects = projects.filter(p => p.id !== projectId);
        localStorage.setItem('fixFlipProjects', JSON.stringify(projects));
        loadProjects();
        showNotification('Deal eliminado exitosamente', 'success');
    }
}

// Show section function
function showSection(sectionId) {
    console.log(`Switching to section: ${sectionId}`);

    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show target section
    const targetSection = document.getElementById(sectionId + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
    } else {
        console.warn(`Section ${sectionId}-section not found`);
    }

    // Handle Hero section visibility
    const heroWrapper = document.getElementById('hero-wrapper');
    if (heroWrapper) {
        if (sectionId === 'home') {
            heroWrapper.style.display = 'flex';
        } else {
            heroWrapper.style.display = 'none';
        }
    }

    // Update navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Export projects function
function exportProjects() {
    if (projects.length === 0) {
        showNotification('No hay proyectos para exportar', 'error');
        return;
    }

    const dataStr = JSON.stringify(projects, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `fix-flip-projects-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Show notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Initialize charts function
function initializeCharts() {
    console.log('Initializing charts...');
    // Placeholder for chart initialization
    // This would initialize any charts for the dashboard
}

// PROJECT MANAGER FUNCTIONS

// Función para abrir Project Manager
function openProjectManager(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
        showNotification('Proyecto no encontrado', 'error');
        return;
    }

    console.log('Opening Project Manager for project:', project);
    
    // Crear o cargar el project manager
    currentProjectManager = {
        dealId: projectId,
        projectName: project.projectName || 'Proyecto ' + projectId,
        propertyAddress: project.propertyAddress,
        projectData: loadProjectManagerData(projectId) || createDefaultProjectManager(projectId)
    };

    // Mostrar el project manager
    renderProjectManager();
    showSection('project-manager');
}

// Función para cargar datos del Project Manager
function loadProjectManagerData(projectId) {
    const data = localStorage.getItem(`pm_${projectId}`);
    return data ? JSON.parse(data) : null;
}

// Función para crear Project Manager por defecto
function createDefaultProjectManager(projectId) {
    return {
        projectId: projectId,
        projectName: 'Proyecto ' + projectId,
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        status: 'ACTIVE',
        budget: {
            total: 0,
            used: 0,
            remaining: 0
        },
        timeline: {
            startDate: new Date().toISOString(),
            estimatedCompletion: new Date(Date.now() + (6 * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            phases: []
        },
        items: []
    };
}

// Función para renderizar el Project Manager
function renderProjectManager() {
    if (!currentProjectManager) return;

    const container = document.getElementById('project-manager-content');
    if (!container) return;

    container.innerHTML = `
        <div class="project-manager-dashboard">
            <div class="row mb-4">
                <div class="col-md-12">
                    <h2 class="text-gold">Administrador de Proyecto</h2>
                    <p class="text-muted">${currentProjectManager.propertyAddress}</p>
                </div>
            </div>
            
            <!-- Dashboard -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-dark text-white">
                        <div class="card-body">
                            <h5 class="card-title text-gold">Presupuesto del DEAL</h5>
                            <h3 class="text-success">${formatCurrency(currentProjectManager.budget.total)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-dark text-white">
                        <div class="card-body">
                            <h5 class="card-title text-gold">Usado</h5>
                            <h3 class="text-warning">${formatCurrency(currentProjectManager.budget.used)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-dark text-white">
                        <div class="card-body">
                            <h5 class="card-title text-gold">Restante</h5>
                            <h3 class="text-info">${formatCurrency(currentProjectManager.budget.remaining)}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-dark text-white">
                        <div class="card-body">
                            <h5 class="card-title text-gold">Estado</h5>
                            <h3 class="text-success">${currentProjectManager.status === 'ACTIVE' ? 'ACTIVO' : 'PLANIFICACIÓN'}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <ul class="nav nav-tabs" id="pm-tabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="interior-tab" data-bs-toggle="tab" data-bs-target="#interior" type="button" role="tab">Interior</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="exterior-tab" data-bs-toggle="tab" data-bs-target="#exterior" type="button" role="tab">Exterior</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="timeline-tab" data-bs-toggle="tab" data-bs-target="#timeline" type="button" role="tab">Cronograma</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="budget-tab" data-bs-toggle="tab" data-bs-target="#budget" type="button" role="tab">Presupuesto</button>
                </li>
            </ul>

            <!-- Tab Content -->
            <div class="tab-content" id="pm-tab-content">
                <div class="tab-pane fade show active" id="interior" role="tabpanel">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4>Ítems del Interior</h4>
                        <button class="btn btn-success" onclick="addProjectItem('INTERIOR')">
                            <i class="bi bi-plus-circle me-2"></i>Agregar Ítem
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-dark">
                            <thead>
                                <tr>
                                    <th>Área</th>
                                    <th>Descripción</th>
                                    <th>Tipo</th>
                                    <th>Presupuesto</th>
                                    <th>Actual</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="pm-interior-items">
                                <!-- Items will be rendered here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="tab-pane fade" id="exterior" role="tabpanel">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4>Ítems del Exterior</h4>
                        <button class="btn btn-success" onclick="addProjectItem('EXTERIOR')">
                            <i class="bi bi-plus-circle me-2"></i>Agregar Ítem
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-dark">
                            <thead>
                                <tr>
                                    <th>Área</th>
                                    <th>Descripción</th>
                                    <th>Tipo</th>
                                    <th>Presupuesto</th>
                                    <th>Actual</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="pm-exterior-items">
                                <!-- Items will be rendered here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="tab-pane fade" id="timeline" role="tabpanel">
                    <h4>Cronograma del Proyecto</h4>
                    <div id="pm-timeline">
                        <!-- Timeline will be rendered here -->
                    </div>
                </div>

                <div class="tab-pane fade" id="budget" role="tabpanel">
                    <h4>Control de Presupuesto</h4>
                    <div id="pm-budget">
                        <!-- Budget will be rendered here -->
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-4 text-center">
                <button class="btn btn-primary" onclick="saveProjectManager()">
                    <i class="bi bi-save me-2"></i>Guardar Progreso
                </button>
                <button class="btn btn-info" onclick="exportProjectManagerReport()">
                    <i class="bi bi-file-earmark-pdf me-2"></i>Exportar Reporte
                </button>
                <button class="btn btn-secondary" onclick="backToProjects()">
                    <i class="bi bi-arrow-left me-2"></i>Volver a Proyectos
                </button>
            </div>
        </div>
    `;

    // Render items in tabs
    renderModuleItems('INTERIOR');
    renderModuleItems('EXTERIOR');
    renderTimeline();
    renderBudgetControl();
}

// Función para renderizar ítems de módulos
function renderModuleItems(category) {
    const tbody = document.getElementById(`pm-${category.toLowerCase()}-items`);
    if (!tbody || !currentProjectManager) return;
    
    const items = currentProjectManager.projectData.items.filter(item => item.category === category);
    
    if (items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    No hay ítems agregados. Haz clic en "Agregar Ítem" para comenzar.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.area}</td>
            <td>${item.description}</td>
            <td><span class="badge bg-info">${getWorkTypeText(item.workType)}</span></td>
            <td class="text-gold">${formatCurrency(item.totalEstimated)}</td>
            <td class="${item.totalActual > 0 ? 'text-success' : 'text-muted'}">${formatCurrency(item.totalActual || 0)}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(item.status)}">
                    ${getStatusIcon(item.status)} ${getStatusText(item.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProjectItem('${item.id}')" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProjectItem('${item.id}')" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Funciones de ayuda para el Project Manager
function getWorkTypeText(workType) {
    const types = {
        'REPAIR': 'Reparar',
        'REPLACE': 'Reemplazar',
        'NEW': 'Nuevo',
        'UPGRADE': 'Mejorar'
    };
    return types[workType] || workType;
}

function getStatusText(status) {
    const statuses = {
        'PLANNING': 'Planificación',
        'IN_PROGRESS': 'En Progreso',
        'COMPLETED': 'Completado',
        'ON_HOLD': 'En Espera'
    };
    return statuses[status] || status;
}

function getStatusBadgeClass(status) {
    const classes = {
        'PLANNING': 'bg-secondary',
        'IN_PROGRESS': 'bg-warning',
        'COMPLETED': 'bg-success',
        'ON_HOLD': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

function getStatusIcon(status) {
    const icons = {
        'PLANNING': '📋',
        'IN_PROGRESS': '🔧',
        'COMPLETED': '✅',
        'ON_HOLD': '⏸️'
    };
    return icons[status] || '📋';
}

// Función para renderizar cronograma
function renderTimeline() {
    const timelineContainer = document.getElementById('pm-timeline');
    if (!timelineContainer) return;
    
    // Implementar renderizado de cronograma
    timelineContainer.innerHTML = '<p>Cronograma del proyecto (próximamente)</p>';
}

// Función para renderizar control de presupuesto
function renderBudgetControl() {
    const budgetContainer = document.getElementById('pm-budget');
    if (!budgetContainer) return;
    
    // Implementar renderizado de presupuesto
    budgetContainer.innerHTML = '<p>Control de presupuesto (próximamente)</p>';
}

// Función para guardar el Project Manager
function saveProjectManager() {
    if (!currentProjectManager) return;
    
    currentProjectManager.projectData.lastUpdated = new Date().toISOString();
    
    try {
        localStorage.setItem(`pm_${currentProjectManager.dealId}`, JSON.stringify(currentProjectManager.projectData));
        showNotification('Progreso del Administrador de Proyecto guardado exitosamente', 'success');
    } catch (error) {
        console.error('Error saving project manager:', error);
        showNotification('Error al guardar el progreso', 'error');
    }
}

// Función para exportar reporte del Project Manager
function exportProjectManagerReport() {
    if (!currentProjectManager) return;
    
    // Implementar exportación de reporte
    showNotification('Exportación de reporte (próximamente)', 'info');
}

// Función para volver a proyectos
function backToProjects() {
    showSection('projects');
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
