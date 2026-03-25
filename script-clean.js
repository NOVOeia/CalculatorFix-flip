// Fix & Flip Underwriting Calculator JavaScript - Clean Version

// Global variables
let projects = JSON.parse(localStorage.getItem('fixFlipProjects')) || [];
let currentCalculation = null;
let lastModifiedField = null;
let editingProjectId = null;

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
        const resaleCommissions = (arv * reCommissions) / 100;
        const totalSellingCosts = resaleCommissions + resaleClosingCosts;
        const netSalePrice = arv - totalSellingCosts;

        // 7. Calculate profit and ROI
        const totalCosts = tpcPlusCost + totalSellingCosts;
        const profit = netSalePrice - tpcPlusCost;
        const roi = tpcPlusCost > 0 ? (profit / tpcPlusCost) * 100 : 0;
        const cashOnCash = calculatedDownPaymentAmount > 0 ? (profit / calculatedDownPaymentAmount) * 100 : 0;

        // 8. Deal decision
        const profitMeetsPercent = roi >= profitMinPercent;
        const profitMeetsAmount = profit >= profitMinAmount;
        const dealDecision = profitMeetsPercent && profitMeetsAmount;

        // Store calculation results
        currentCalculation = {
            // Basic Info
            projectName: `Project ${projects.length + 1}`,
            propertyAddress: propertyAddress,
            projectMonths: projectMonths,
            arv: arv,
            purchasePrice: purchasePrice,
            rehabBudget: rehabBudget,
            closingCosts: closingCosts,
            holdingCosts: holdingCosts,

            // HML Financing
            hmlLoanAmount: calculatedHmlLoanAmount,
            hmlLoanPercent: calculatedHmlLoanPercent,
            downPaymentAmount: calculatedDownPaymentAmount,
            downPaymentPercent: calculatedDownPaymentPercent,
            hmlPointsRate: hmlPointsRate,
            hmlInterestRate: hmlInterestRate,
            hmlAdminFees: hmlAdminFees,
            hmlPointsCost: hmlPoints,
            hmlTotalInterest: totalHmlInterest,
            hmlTotalFees: totalFinancingCosts,

            // GAP Financing
            gapLoanAmount: gapLoanAmount,

            // Selling Costs
            reCommissions: reCommissions,
            resaleClosingCosts: resaleClosingCosts,
            resaleCommissions: resaleCommissions,
            totalSellingCosts: totalSellingCosts,
            netSalePrice: netSalePrice,

            // Profit Criteria
            profitMinPercent: profitMinPercent,
            profitMinAmount: profitMinAmount,

            // Calculated Results
            totalProjectCosts: totalProjectCosts,
            tpcPlusCost: tpcPlusCost,
            totalCapitalNeeded: tpcPlusCost,
            capitalRequired: calculatedDownPaymentAmount,
            profit: profit,
            roi: roi,
            cashOnCash: cashOnCash,
            dealDecision: dealDecision,

            // Metadata
            date: new Date().toISOString(),
            interestType: interestType
        };

        console.log('Calculation object created');

        // Update UI
        updateUI();

        console.log('=== CALCULATION COMPLETED SUCCESSFULLY ===');

    } catch (error) {
        console.error('ERROR IN CALCULATION:', error);
        showNotification('Error en el cálculo', 'error');
    }
}

// Update UI function
function updateUI() {
    console.log('Updating UI...');

    if (!currentCalculation) {
        console.error('No calculation data available');
        return;
    }

    try {
        // Update calculated fields
        const updateField = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                console.log(`Updated ${id}: ${value}`);
            } else {
                console.warn(`Element not found: ${id}`);
            }
        };

        const updateValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
                console.log(`Updated value ${id}: ${value}`);
            } else {
                console.warn(`Element not found: ${id}`);
            }
        };

        // Project Costs
        updateField('total-project-costs', formatCurrency(currentCalculation.totalProjectCosts));

        // HML Financing
        updateField('hml-points-cost', formatCurrency(currentCalculation.hmlPointsCost));
        updateField('hml-total-interest', formatCurrency(currentCalculation.hmlTotalInterest));
        updateValue('down-payment-amount', currentCalculation.downPaymentAmount);
        updateValue('down-payment-percent', currentCalculation.downPaymentPercent);
        updateValue('hml-loan-amount', currentCalculation.hmlLoanAmount);
        updateValue('hml-loan-percent', currentCalculation.hmlLoanPercent);
        updateField('hml-total-fees', formatCurrency(currentCalculation.hmlTotalFees));

        // Selling Costs
        updateField('resale-commissions', formatCurrency(currentCalculation.resaleCommissions));
        updateField('total-selling-costs', formatCurrency(currentCalculation.totalSellingCosts));
        updateField('net-sale-price', formatCurrency(currentCalculation.netSalePrice));

        // Total Analysis
        updateField('tpc-plus-cost', formatCurrency(currentCalculation.tpcPlusCost));
        updateField('total-capital-needed', formatCurrency(currentCalculation.totalCapitalNeeded));
        updateField('capital-required', formatCurrency(currentCalculation.capitalRequired));

        // Deal Analysis
        updateField('projection', formatCurrency(currentCalculation.profit));
        updateField('roi', currentCalculation.roi.toFixed(1) + '%');
        updateField('coc', currentCalculation.cashOnCash.toFixed(1) + '%');

        // Deal Decision
        const dealElement = document.getElementById('deal-decision');
        if (dealElement) {
            dealElement.textContent = currentCalculation.dealDecision ? 'YES' : 'NO';
            dealElement.className = 'deal-decision ' + (currentCalculation.dealDecision ? 'yes' : 'no');
        }

        // Results Panel
        updateField('result-total-investment', formatCurrency(currentCalculation.tpcPlusCost));
        updateField('result-profit', formatCurrency(currentCalculation.profit));
        updateField('result-roi', currentCalculation.roi.toFixed(1) + '%');
        updateField('result-coc', currentCalculation.cashOnCash.toFixed(1) + '%');

        const statusElement = document.getElementById('result-deal-status');
        if (statusElement) {
            statusElement.textContent = currentCalculation.dealDecision ? '✅ GOOD DEAL' : '❌ NO DEAL';
            statusElement.style.color = currentCalculation.dealDecision ? '#4CAF50' : '#F44336';
        }

        console.log('UI updated successfully');

    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 350px;
        `;
        document.body.appendChild(notificationContainer);
    }

    // Create notification
    const notification = document.createElement('div');
    const typeStyles = {
        success: { bg: '#28a745', icon: '✅' },
        error: { bg: '#dc3545', icon: '❌' },
        warning: { bg: '#ffc107', icon: '⚠️' },
        info: { bg: '#17a2b8', icon: 'ℹ️' }
    };

    const style = typeStyles[type] || typeStyles.info;
    
    notification.style.cssText = `
        background: ${style.bg};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        cursor: pointer;
        transition: opacity 0.3s ease;
    `;

    notification.innerHTML = `
        <span style="font-size: 18px;">${style.icon}</span>
        <span>${message}</span>
    `;

    // Add click to dismiss
    notification.addEventListener('click', () => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    });

    notificationContainer.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
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

// Load projects function
function loadProjects() {
    console.log('Loading projects...');
    
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('fixFlipProjects');
    if (savedProjects) {
        try {
            projects = JSON.parse(savedProjects);
            console.log(`Loaded ${projects.length} projects from localStorage`);
        } catch (error) {
            console.error('Error loading projects from localStorage:', error);
            projects = [];
        }
    } else {
        projects = [];
        console.log('No saved projects found, starting with empty array');
    }
    
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
                <td class="${project.profit >= 0 ? 'text-success-gold' : 'text-danger-gold'}">${formatCurrency(project.profit)}</td>
                <td>
                    <span class="badge ${project.dealDecision ? 'bg-success' : 'bg-danger'}">
                        ${project.dealDecision ? 'BUENO' : 'MALO'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewProjectDetails(${project.id})" title="Ver">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="openProjectManager(${project.id})" title="Project Manager">
                        <i class="bi bi-tools"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="viewProject(${project.id})" title="Editar">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="exportSingleProjectReportPDF(${project.id})" title="Descargar PDF">
                        <i class="bi bi-file-earmark-pdf"></i>
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

    // Basic Info
    setInputValue('property-address', project.propertyAddress || '');
    setInputValue('project-months', project.projectMonths || 0);
    setInputValue('arv', project.arv || 0);
    
    // Project Costs
    setInputValue('purchase-price', project.purchasePrice || 0);
    setInputValue('rehab-budget', project.rehabBudget || 0);
    setInputValue('closing-costs', project.closingCosts || 0);
    setInputValue('holding-costs', project.holdingCosts || 0);
    
    // HML Financing
    setInputValue('hml-loan-amount', project.hmlLoanAmount || 0);
    setInputValue('hml-loan-percent', project.hmlLoanPercent || 0);
    setInputValue('down-payment-amount', project.downPaymentAmount || 0);
    setInputValue('down-payment-percent', project.downPaymentPercent || 0);
    setInputValue('hml-points-rate', project.hmlPointsRate || 0);
    setInputValue('hml-interest-rate', project.hmlInterestRate || 0);
    setInputValue('hml-admin-fees', project.hmlAdminFees || 0);
    
    // Selling Costs
    setInputValue('re-commissions', project.reCommissions || 0);
    setInputValue('resale-closing-costs', project.resaleClosingCosts || 0);
    
    // Profit Criteria
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

// Initialize charts function
function initializeCharts() {
    console.log('Initializing charts...');
    // Placeholder for chart initialization
    console.log('Charts initialization complete');
}

// PROJECT MANAGER FUNCTIONS

// Global variables for Project Manager
let currentProjectManager = null;
let selectedArea = '';
let selectedCategory = '';
let selectedSubcategories = [];

// Base de datos de subcategorías
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

// Open Project Manager
function openProjectManager(dealId) {
    const project = projects.find(p => p.id === dealId);
    if (!project) {
        alert('Proyecto no encontrado');
        return;
    }

    console.log('Opening Project Manager for project:', project);
    
    // Crear o cargar el project manager
    currentProjectManager = {
        dealId: dealId,
        projectName: project.projectName || 'Proyecto ' + dealId,
        propertyAddress: project.propertyAddress,
        projectData: loadProjectManagerData(dealId) || createDefaultProjectManager(dealId)
    };

    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Crear o mostrar sección de Project Manager
    let pmSection = document.getElementById('project-manager-section');
    if (!pmSection) {
        pmSection = createProjectManagerSection();
        document.body.appendChild(pmSection);
    }

    // Inicializar el Project Manager con datos del DEAL
    initializeProjectManager(project);
    
    // Mostrar la sección
    pmSection.style.display = 'block';
    
    // Actualizar navegación
    updateNavigation('project-manager');
}

// Load Project Manager data
function loadProjectManagerData(projectId) {
    const data = localStorage.getItem(`pm_${projectId}`);
    return data ? JSON.parse(data) : null;
}

// Create default Project Manager
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

// Create Project Manager section HTML
function createProjectManagerSection() {
    const section = document.createElement('div');
    section.id = 'project-manager-section';
    section.className = 'content-section';
    section.innerHTML = `
        <div class="section-header-premium">
            <span class="section-subtitle">Paso 3: Ejecución</span>
            <h2 class="section-title-main">Administrador de Proyecto</h2>
        </div>
        
        <!-- Dashboard del Proyecto -->
        <div class="card glass-panel mb-4">
            <div class="card-header bg-dark">
                <h5 class="text-gold mb-0">
                    <i class="bi bi-speedometer2 me-2"></i>Panel del Proyecto
                </h5>
            </div>
            <div class="card-body">
                <div class="row" id="pm-dashboard">
                    <!-- Se llenará dinámicamente -->
                </div>
            </div>
        </div>

        <!-- Tabs de Módulos -->
        <div class="card glass-panel">
            <div class="card-header bg-dark">
                <ul class="nav nav-tabs card-header-tabs" id="pm-tabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="pm-interior-tab" data-bs-toggle="tab" data-bs-target="#pm-interior" type="button" role="tab">
                            <i class="bi bi-house-door me-2"></i>Interior
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="pm-exterior-tab" data-bs-toggle="tab" data-bs-target="#pm-exterior" type="button" role="tab">
                            <i class="bi bi-tree me-2"></i>Exterior
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="pm-schedule-tab" data-bs-toggle="tab" data-bs-target="#pm-schedule" type="button" role="tab">
                            <i class="bi bi-calendar3 me-2"></i>Cronograma
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="pm-budget-tab" data-bs-toggle="tab" data-bs-target="#pm-budget" type="button" role="tab">
                            <i class="bi bi-cash-stack me-2"></i>Presupuesto
                        </button>
                    </li>
                </ul>
            </div>
            <div class="card-body">
                <div class="tab-content" id="pm-tab-content">
                    <!-- Tab Interior -->
                    <div class="tab-pane fade show active" id="pm-interior" role="tabpanel">
                        <div class="row mb-3">
                            <div class="col-md-8">
                                <h5 class="text-gold">
                                    <i class="bi bi-house-door me-2"></i>Módulo Interior
                                </h5>
                            </div>
                            <div class="col-md-4 text-end">
                                <button class="btn btn-success btn-sm" onclick="addProjectItem('INTERIOR')">
                                    <i class="bi bi-plus-circle me-2"></i>Agregar Ítem
                                </button>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-dark" id="pm-interior-table">
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
                                    <!-- Items will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Tab Exterior -->
                    <div class="tab-pane fade" id="pm-exterior" role="tabpanel">
                        <div class="row mb-3">
                            <div class="col-md-8">
                                <h5 class="text-gold">
                                    <i class="bi bi-tree me-2"></i>Módulo Exterior
                                </h5>
                            </div>
                            <div class="col-md-4 text-end">
                                <button class="btn btn-success btn-sm" onclick="addProjectItem('EXTERIOR')">
                                    <i class="bi bi-plus-circle me-2"></i>Agregar Ítem
                                </button>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-dark" id="pm-exterior-table">
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
                                    <!-- Items will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Tab Cronograma -->
                    <div class="tab-pane fade" id="pm-schedule" role="tabpanel">
                        <h5 class="text-gold">
                            <i class="bi bi-calendar3 me-2"></i>Cronograma del Proyecto
                        </h5>
                        <div id="pm-timeline">
                            <!-- Timeline will be rendered here -->
                        </div>
                    </div>

                    <!-- Tab Presupuesto -->
                    <div class="tab-pane fade" id="pm-budget" role="tabpanel">
                        <h5 class="text-gold">
                            <i class="bi bi-cash-stack me-2"></i>Control de Presupuesto
                        </h5>
                        <div id="pm-budget-control">
                            <!-- Budget will be rendered here -->
                        </div>
                    </div>
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
    `;
    
    return section;
}

// Initialize Project Manager
function initializeProjectManager(project) {
    // Render dashboard
    renderDashboard();
    
    // Render items in tabs
    renderModuleItems('INTERIOR');
    renderModuleItems('EXTERIOR');
    
    // Render timeline and budget
    renderTimeline();
    renderBudgetControl();
}

// Render dashboard
function renderDashboard() {
    const dashboard = document.getElementById('pm-dashboard');
    if (!dashboard || !currentProjectManager) return;
    
    const budget = currentProjectManager.projectData.budget;
    
    dashboard.innerHTML = `
        <div class="col-md-3">
            <div class="card bg-dark text-white">
                <div class="card-body">
                    <h5 class="card-title text-gold">Presupuesto Total</h5>
                    <h3 class="text-success">${formatCurrency(budget.total)}</h3>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-dark text-white">
                <div class="card-body">
                    <h5 class="card-title text-gold">Usado</h5>
                    <h3 class="text-warning">${formatCurrency(budget.used)}</h3>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-dark text-white">
                <div class="card-body">
                    <h5 class="card-title text-gold">Restante</h5>
                    <h3 class="text-info">${formatCurrency(budget.remaining)}</h3>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-dark text-white">
                <div class="card-body">
                    <h5 class="card-title text-gold">Estado</h5>
                    <h3 class="text-success">${currentProjectManager.projectData.status}</h3>
                </div>
            </div>
        </div>
    `;
}

// Render module items
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
            <td><span class="badge bg-info">${item.workType || 'REPAIR'}</span></td>
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

// Helper functions for Project Manager
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

// Render timeline
function renderTimeline() {
    const timeline = document.getElementById('pm-timeline');
    if (timeline) {
        timeline.innerHTML = '<p class="text-muted">Cronograma del proyecto (próximamente)</p>';
    }
}

// Render budget control
function renderBudgetControl() {
    const budget = document.getElementById('pm-budget-control');
    if (budget) {
        budget.innerHTML = '<p class="text-muted">Control de presupuesto (próximamente)</p>';
    }
}

// Update navigation
function updateNavigation(section) {
    // Update navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Note: This is a simplified version since PM is created dynamically
}

// Back to projects
function backToProjects() {
    // Hide Project Manager
    const pmSection = document.getElementById('project-manager-section');
    if (pmSection) {
        pmSection.style.display = 'none';
    }
    
    // Show projects section
    showSection('projects');
}

// Save Project Manager
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

// Export Project Manager report
function exportProjectManagerReport() {
    if (!currentProjectManager) return;
    
    showNotification('Exportación de reporte (próximamente)', 'info');
}

// Add project item
function addProjectItem(category) {
    console.log('addProjectItem called with category:', category);
    
    // Reset variables
    selectedArea = '';
    selectedCategory = category;
    selectedSubcategories = [];
    
    // Create modal
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
                    <div class="mb-3">
                        <label style="color: #d4af37;">Área/Subcategoría</label>
                        <select class="form-control" id="item-area-search" onchange="selectArea(this.value)">
                            <option value="">Seleccionar...</option>
                            ${getSubcategoryOptions(category)}
                        </select>
                    </div>
                    
                    <div class="mb-3" id="subcategory-row" style="display: none;">
                        <label style="color: #d4af37;">Subcategorías</label>
                        <div id="subcategory-options" style="max-height: 300px; overflow-y: auto; border: 1px solid #d4af37; border-radius: 5px; padding: 10px; background: #2c3440;">
                            <!-- Se llenará dinámicamente -->
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label style="color: #d4af37;">Descripción</label>
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
                            <label style="color: #d4af37;">Materiales</label>
                            <input type="number" class="form-control" id="item-materials" value="0" step="100">
                        </div>
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Mano de Obra</label>
                            <input type="number" class="form-control" id="item-labor" value="0" step="100">
                        </div>
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
}

// Get subcategory options
function getSubcategoryOptions(category) {
    if (category === 'INTERIOR') {
        return `
            <option value="Baños">Baños</option>
            <option value="Cocina">Cocina</option>
            <option value="Pisos">Pisos</option>
            <option value="Pintura">Pintura</option>
            <option value="Eléctrico">Eléctrico</option>
            <option value="Plomería">Plomería</option>
            <option value="Paredes">Paredes</option>
            <option value="Puertas">Puertas</option>
            <option value="Ventanas">Ventanas</option>
        `;
    } else {
        return `
            <option value="Techo">Techo</option>
            <option value="Cimientos">Cimientos</option>
            <option value="Fachada">Fachada</option>
            <option value="Paisajismo">Paisajismo</option>
            <option value="Garaje">Garaje</option>
            <option value="Cerca">Cerca</option>
            <option value="Entrada">Entrada</option>
            <option value="Drenaje">Drenaje</option>
        `;
    }
}

// Select area
function selectArea(area) {
    selectedArea = area;
    updateSubcategories(area);
}

// Update subcategories
function updateSubcategories(area) {
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
        html += `
            <div class="form-check mb-2">
                <label class="form-check-label">
                    <input type="checkbox" class="form-check-input" id="sub-${name.replace(/[^a-zA-Z0-9]/g, '')}" onchange="toggleSubcategory('${name}', ${costs.materials}, ${costs.labor}, '${costs.unit}', this.checked)">
                    ${name} - Total: ${formatCurrency(total)}
                </label>
            </div>
        `;
    }
    
    subcategoryOptions.innerHTML = html;
}

// Toggle subcategory
function toggleSubcategory(name, materials, labor, unit, isChecked) {
    if (isChecked) {
        selectedSubcategories.push({
            name: name,
            materials: materials,
            labor: labor,
            unit: unit
        });
    } else {
        selectedSubcategories = selectedSubcategories.filter(sub => sub.name !== name);
    }
    
    // Update totals
    updateTotals();
}

// Update totals
function updateTotals() {
    if (selectedSubcategories.length === 0) {
        document.getElementById('item-materials').value = 0;
        document.getElementById('item-labor').value = 0;
        return;
    }
    
    const totalMaterials = selectedSubcategories.reduce((sum, sub) => sum + sub.materials, 0);
    const totalLabor = selectedSubcategories.reduce((sum, sub) => sum + sub.labor, 0);
    
    document.getElementById('item-materials').value = totalMaterials;
    document.getElementById('item-labor').value = totalLabor;
}

// Save project item
function saveProjectItem(category) {
    if (!selectedArea) {
        alert('Por favor selecciona un área primero');
        return;
    }
    
    if (selectedSubcategories.length === 0) {
        alert('Por favor selecciona al menos una subcategoría');
        return;
    }
    
    if (!currentProjectManager) {
        alert('Error: No hay un proyecto activo');
        return;
    }
    
    // Get form values
    const materials = parseFloat(document.getElementById('item-materials').value) || 0;
    const labor = parseFloat(document.getElementById('item-labor').value) || 0;
    const description = document.getElementById('item-description').value || 'Trabajo en ' + selectedArea;
    const quantity = parseInt(document.getElementById('item-quantity').value) || 1;
    const unit = document.getElementById('item-unit').value || 'EACH';
    
    const totalEstimated = materials + labor;
    
    // Create new item
    const newItem = {
        id: Date.now().toString(),
        category: category,
        area: selectedArea,
        description: description,
        workType: 'REPAIR',
        priority: 'MEDIUM',
        quantity: quantity,
        unit: unit,
        materialsCost: materials,
        laborCost: labor,
        otherCosts: 0,
        markup: 0,
        totalEstimated: totalEstimated,
        totalActual: 0,
        status: 'PLANNING',
        notes: '',
        created: new Date().toISOString(),
        subcategories: [...selectedSubcategories]
    };
    
    // Add to project manager
    if (!currentProjectManager.projectData.items) {
        currentProjectManager.projectData.items = [];
    }
    
    currentProjectManager.projectData.items.push(newItem);
    currentProjectManager.projectData.lastUpdated = new Date().toISOString();
    
    // Update budget
    updateBudget();
    
    // Save to localStorage
    try {
        localStorage.setItem(`pm_${currentProjectManager.dealId}`, JSON.stringify(currentProjectManager.projectData));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('Error al guardar el proyecto');
        return;
    }
    
    // Reload table
    renderModuleItems(category);
    
    // Close modal
    closeItemModal();
    
    // Clear variables
    selectedArea = '';
    selectedSubcategories = [];
    
    // Show notification
    showNotification('Ítem agregado exitosamente', 'success');
}

// Update budget
function updateBudget() {
    if (!currentProjectManager) return;
    
    const items = currentProjectManager.projectData.items;
    const totalEstimated = items.reduce((sum, item) => sum + item.totalEstimated, 0);
    const totalActual = items.reduce((sum, item) => sum + (item.totalActual || 0), 0);
    
    currentProjectManager.projectData.budget = {
        total: totalEstimated,
        used: totalActual,
        remaining: totalEstimated - totalActual
    };
    
    // Re-render dashboard
    renderDashboard();
}

// Close modal
function closeItemModal() {
    const modal = document.getElementById('pm-item-modal');
    if (modal) {
        modal.remove();
    }
}

// Placeholder functions
function editProjectItem(itemId) {
    showNotification('Editar ítem (próximamente)', 'info');
}

function deleteProjectItem(itemId) {
    if (confirm('¿Estás seguro de que quieres eliminar este ítem?')) {
        if (!currentProjectManager) return;
        
        currentProjectManager.projectData.items = currentProjectManager.projectData.items.filter(item => item.id !== itemId);
        
        // Save and reload
        saveProjectManager();
        renderModuleItems('INTERIOR');
        renderModuleItems('EXTERIOR');
        
        showNotification('Ítem eliminado exitosamente', 'success');
    }
}

function viewProjectDetails(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
        alert('Proyecto no encontrado');
        return;
    }

    const modalHTML = `
        <div id="dealModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
            <div style="background: #1a1f2e; color: white; padding: 30px; border-radius: 10px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto; border: 2px solid #d4af37;">
                <div style="background: #007bff; color: white; padding: 15px; margin: -30px -30px 20px -30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h3 style="margin: 0; color: white;">👁️ Detalles del Deal: ${project.projectName || 'Sin nombre'}</h3>
                    <button onclick="closeDealModal()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <!-- Información del Proyecto -->
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px;">
                        <h4 style="color: #d4af37; margin: 0 0 15px 0; border-bottom: 2px solid #d4af37; padding-bottom: 5px;">📋 Información del Proyecto</h4>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Dirección:</strong> <span style="color: #ffffff;">${project.propertyAddress || 'N/A'}</span></p>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Meses:</strong> <span style="color: #ffffff;">${project.projectMonths || 0}</span></p>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">ARV:</strong> <span style="color: #ffffff;">${formatCurrency(project.arv)}</span></p>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Fecha:</strong> <span style="color: #ffffff;">${new Date(project.date).toLocaleDateString('es-ES')}</span></p>
                    </div>
                    
                    <!-- Resultados -->
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px;">
                        <h4 style="color: #d4af37; margin: 0 0 15px 0; border-bottom: 2px solid #d4af37; padding-bottom: 5px;">💰 Resultados</h4>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Total Costs:</strong> <span style="color: #000000 !important; background: rgba(212,175,55,0.3); padding: 4px 8px; border-radius: 4px; font-weight: bold; display: inline-block;">${formatCurrency(project.tpcPlusCost)}</span></p>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">ROI:</strong> <span style="color: #000000 !important; background: rgba(212,175,55,0.3); padding: 4px 8px; border-radius: 4px; font-weight: bold; display: inline-block;">${project.roi.toFixed(1)}%</span></p>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Ganancia:</strong> <span style="color: #000000 !important; background: rgba(212,175,55,0.3); padding: 4px 8px; border-radius: 4px; font-weight: bold; display: inline-block;">${formatCurrency(project.profit)}</span></p>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Decisión:</strong> <span style="background: ${project.dealDecision ? '#28a745' : '#dc3545'}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; display: inline-block;">${project.dealDecision ? '✅ BUENO' : '❌ MALO'}</span></p>
                    </div>
                </div>
                
                <!-- Botones de acción -->
                <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #d4af37;">
                    <button onclick="viewProject(${project.id})" style="background: #007bff; color: white; border: none; padding: 10px 20px; margin: 0 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">✏️ Editar Deal</button>
                    <button onclick="exportSingleProjectReportPDF(${project.id})" style="background: #28a745; color: white; border: none; padding: 10px 20px; margin: 0 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">📄 Descargar PDF</button>
                    <button onclick="closeDealModal()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; margin: 0 10px; border-radius: 5px; cursor: pointer; font-weight: bold;">❌ Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeDealModal() {
    const modal = document.getElementById('dealModal');
    if (modal) {
        modal.remove();
    }
}

function exportSingleProjectReportPDF(projectId) {
    showNotification('Exportación PDF (próximamente)', 'info');
}
