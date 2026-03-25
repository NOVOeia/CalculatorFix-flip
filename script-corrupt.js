// Fix & Flip Underwriting Calculator JavaScript

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
        // More flexible calculation logic to allow free editing
        let calculatedDownPaymentAmount = downPaymentAmount;
        let calculatedDownPaymentPercent = downPaymentPercent;
        let calculatedHmlLoanAmount = hmlLoanAmount;
        let calculatedHmlLoanPercent = hmlLoanPercent;

        // Down Payment calculations - only calculate if one field has a value and the other is 0
        if (downPaymentAmount > 0 && purchasePrice > 0 && downPaymentPercent === 0) {
            // Only amount is entered, calculate percent
            calculatedDownPaymentPercent = (downPaymentAmount / purchasePrice) * 100;
            console.log(`Down Payment: Only amount $${downPaymentAmount} entered, calculated percent ${calculatedDownPaymentPercent.toFixed(1)}%`);
        } else if (downPaymentPercent > 0 && purchasePrice > 0 && downPaymentAmount === 0) {
            // Only percent is entered, calculate amount
            calculatedDownPaymentAmount = (purchasePrice * downPaymentPercent) / 100;
            console.log(`Down Payment: Only percent ${downPaymentPercent}% entered, calculated amount $${calculatedDownPaymentAmount}`);
        } else if (downPaymentAmount > 0 && downPaymentPercent > 0 && purchasePrice > 0) {
            // Both have values - check if they match
            const expectedPercent = (downPaymentAmount / purchasePrice) * 100;
            const expectedAmount = (purchasePrice * downPaymentPercent) / 100;

            // If user is editing the amount field, update percent
            if (lastModifiedField === 'down-payment-amount') {
                calculatedDownPaymentPercent = expectedPercent;
                console.log(`Down Payment: User edited amount to $${downPaymentAmount}, updated percent to ${expectedPercent.toFixed(1)}%`);
            }
            // If user is editing the percent field, update amount
            else if (lastModifiedField === 'down-payment-percent') {
                calculatedDownPaymentAmount = expectedAmount;
                console.log(`Down Payment: User edited percent to ${downPaymentPercent}%, updated amount to $${expectedAmount}`);
            }
            // If neither field was modified recently, keep current values
            else {
                console.log(`Down Payment: Both fields have values, keeping current values`);
            }
        }

        // HML Loan calculations - only calculate if one field has a value and the other is 0
        if (hmlLoanAmount > 0 && purchasePrice > 0 && hmlLoanPercent === 0) {
            // Only amount is entered, calculate percent
            calculatedHmlLoanPercent = (hmlLoanAmount / purchasePrice) * 100;
            console.log(`HML Loan: Only amount $${hmlLoanAmount} entered, calculated percent ${calculatedHmlLoanPercent.toFixed(1)}%`);
        } else if (hmlLoanPercent > 0 && purchasePrice > 0 && hmlLoanAmount === 0) {
            // Only percent is entered, calculate amount
            calculatedHmlLoanAmount = (purchasePrice * hmlLoanPercent) / 100;
            console.log(`HML Loan: Only percent ${hmlLoanPercent}% entered, calculated amount $${calculatedHmlLoanAmount}`);
        } else if (hmlLoanAmount > 0 && hmlLoanPercent > 0 && purchasePrice > 0) {
            // Both have values - check if they match
            const expectedPercent = (hmlLoanAmount / purchasePrice) * 100;
            const expectedAmount = (purchasePrice * hmlLoanPercent) / 100;

            // If user is editing the amount field, update percent
            if (lastModifiedField === 'hml-loan-amount') {
                calculatedHmlLoanPercent = expectedPercent;
                console.log(`HML Loan: User edited amount to $${hmlLoanAmount}, updated percent to ${expectedPercent.toFixed(1)}%`);
            }
            // If user is editing the percent field, update amount
            else if (lastModifiedField === 'hml-loan-percent') {
                calculatedHmlLoanAmount = expectedAmount;
                console.log(`HML Loan: User edited percent to ${hmlLoanPercent}%, updated amount to $${expectedAmount}`);
            }
            // If neither field was modified recently, keep current values
            else {
                console.log(`HML Loan: Both fields have values, keeping current values`);
            }
        }

        // Use the calculated values for further calculations
        const finalDownPaymentAmount = calculatedDownPaymentAmount;
        const finalDownPaymentPercent = calculatedDownPaymentPercent;
        const finalHmlLoanAmount = calculatedHmlLoanAmount;
        const finalHmlLoanPercent = calculatedHmlLoanPercent;

        // Validate that down payment + HML loan doesn't exceed purchase price
        const totalFinancing = finalDownPaymentAmount + finalHmlLoanAmount;
        const actualHMLLoan = totalFinancing > purchasePrice ? Math.max(0, purchasePrice - finalDownPaymentAmount) : finalHmlLoanAmount;

        const hmlLtvCalculated = arv > 0 ? (actualHMLLoan / arv) * 100 : 0;
        const hmlPointsCost = (actualHMLLoan * hmlPointsRate) / 100;
        const monthlyRate = hmlInterestRate / 100 / 12;
        const hmlTotalInterest = actualHMLLoan * monthlyRate * projectMonths;
        const hmlTotalFees = hmlPointsCost + hmlTotalInterest + hmlAdminFees;
        const downPayment = Math.max(0, purchasePrice - actualHMLLoan);

        console.log(`HML Calculations: 
            DownPayment - UserInput Amount: $${downPaymentAmount}, Percent: ${downPaymentPercent}%
            DownPayment - Calculated Amount: $${finalDownPaymentAmount}, Percent: ${finalDownPaymentPercent.toFixed(1)}%
            HMLLoan - UserInput Amount: $${hmlLoanAmount}, Percent: ${hmlLoanPercent}%
            HMLLoan - Calculated Amount: $${finalHmlLoanAmount}, Percent: ${finalHmlLoanPercent.toFixed(1)}%
            TotalFinancing: $${totalFinancing} vs PurchasePrice: $${purchasePrice}
            ActualHMLLoan: $${actualHMLLoan}
            HML LTV (ARV): ${hmlLtvCalculated.toFixed(1)}%
            Points: $${hmlPointsCost}
            Interest: $${hmlTotalInterest}
            Down Payment: $${downPayment}
        `);

        // 3. GAP Financing Calculations - REMOVED
        const gapLoanAmount = 0;
        const gapPointsCost = 0;
        const gapTotalInterest = 0;

        console.log(`GAP Calculations: 
            GAP Loan Amount: $${gapLoanAmount}
            GAP Points Cost: $${gapPointsCost}
            GAP Total Interest: $${gapTotalInterest}
        `);

        // 4. Total Analysis
        const tpcPlusCost = totalProjectCosts + hmlTotalFees + gapPointsCost + gapTotalInterest;
        const asPercentOfArv = arv > 0 ? (tpcPlusCost / arv) * 100 : 0;
        const totalCapitalNeeded = tpcPlusCost;
        const capitalRequired = Math.max(0, downPayment + gapPointsCost + gapTotalInterest);

        console.log(`Total Analysis: TPC+Cost=$${tpcPlusCost}, Capital Required=$${capitalRequired}`);

        // 5. Selling Costs
        const resaleCommissions = (arv * reCommissions) / 100;
        const totalSellingCosts = resaleCommissions + resaleClosingCosts;
        const netSalePrice = arv - totalSellingCosts;

        console.log(`Selling Costs: 
            ARV: $${arv}
            RE Commissions: ${reCommissions}% = $${resaleCommissions}
            Resale Closing Costs: $${resaleClosingCosts}
            Total Selling Costs: $${totalSellingCosts}
            Net Sale Price: $${netSalePrice}
        `);
        const projection = netSalePrice - tpcPlusCost;
        const projectionPercent = arv > 0 ? (projection / arv) * 100 : 0;
        const roi = tpcPlusCost > 0 ? (projection / tpcPlusCost) * 100 : 0;
        const cashOnCash = capitalRequired > 0 ? (projection / capitalRequired) * 100 : 0;

        console.log(`Profit Analysis: Projection=$${projection}, ROI=${roi.toFixed(1)}%, Cash on Cash=${cashOnCash.toFixed(1)}%`);

        // 6. Deal Decision
        const profitMeetsPercent = projectionPercent >= profitMinPercent;
        const profitMeetsAmount = projection >= profitMinAmount;
        const dealDecision = profitMeetsPercent && profitMeetsAmount;

        console.log(`Deal Decision: ${dealDecision ? 'YES' : 'NO'} (Meets %: ${profitMeetsPercent}, Meets $: ${profitMeetsAmount})`);

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
            hmlLoanAmount: actualHMLLoan,
            hmlLoanPercent: finalHmlLoanPercent,
            downPaymentAmount: finalDownPaymentAmount,
            downPaymentPercent: finalDownPaymentPercent,
            hmlLtvCalculated: hmlLtvCalculated,
            hmlPointsRate: hmlPointsRate,
            hmlInterestRate: hmlInterestRate,
            hmlAdminFees: hmlAdminFees,
            hmlPointsCost: hmlPointsCost,
            hmlTotalInterest: hmlTotalInterest,
            hmlTotalFees: hmlTotalFees,

            // GAP Financing - REMOVED
            gapLoanAmount: 0,
            gapPointsRate: 0,
            gapInterestRate: 0,
            gapPointsCost: 0,
            gapTotalInterest: 0,

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
            asPercentOfArv: asPercentOfArv,
            totalCapitalNeeded: totalCapitalNeeded,
            capitalRequired: capitalRequired,
            projection: projection,
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
        alert('Error in calculation: ' + error.message);
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
                // Check if value actually changed to trigger animation
                if (element.textContent !== value && value !== '$0' && value !== '0.0%' && value !== '0%') {
                    element.classList.remove('value-update');
                    void element.offsetWidth; // Trigger reflow
                    element.classList.add('value-update');
                }
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
        // updateValue('hml-loan-amount', currentCalculation.hmlLoanAmount); // REMOVED: Allow user input
        updateField('hml-points-cost', formatCurrency(currentCalculation.hmlPointsCost));
        updateField('hml-total-interest', formatCurrency(currentCalculation.hmlTotalInterest));
        updateValue('down-payment-amount', currentCalculation.downPaymentAmount);
        updateValue('down-payment-percent', currentCalculation.downPaymentPercent);
        updateValue('hml-loan-amount', currentCalculation.hmlLoanAmount);
        updateValue('hml-loan-percent', currentCalculation.hmlLoanPercent);
        updateField('hml-total-fees', formatCurrency(currentCalculation.hmlTotalFees));
        updateField('hml-ltv-display', currentCalculation.hmlLtvCalculated.toFixed(1) + '%');



        // Selling Costs
        updateField('resale-commissions', formatCurrency(currentCalculation.resaleCommissions));
        updateField('total-selling-costs', formatCurrency(currentCalculation.totalSellingCosts));
        updateField('net-sale-price', formatCurrency(currentCalculation.netSalePrice));

        // Total Analysis
        updateField('tpc-plus-cost', formatCurrency(currentCalculation.tpcPlusCost));
        updateField('as-percent-of-arv', currentCalculation.asPercentOfArv.toFixed(1) + '%');
        updateField('total-capital-needed', formatCurrency(currentCalculation.totalCapitalNeeded));
        updateField('capital-required', formatCurrency(currentCalculation.capitalRequired));

        // Deal Analysis
        updateField('projection', formatCurrency(currentCalculation.projection));

        // Deal Decision
        const dealElement = document.getElementById('deal-decision');
        if (dealElement) {
            dealElement.textContent = currentCalculation.dealDecision ? 'YES' : 'NO';
            dealElement.className = 'deal-decision ' + (currentCalculation.dealDecision ? 'yes' : 'no');
        }

        // Results Panel
        updateField('result-total-investment', formatCurrency(currentCalculation.tpcPlusCost));
        updateField('result-profit', formatCurrency(currentCalculation.projection));
        updateField('result-roi', currentCalculation.roi.toFixed(1) + '%');
        updateField('result-coc', currentCalculation.cashOnCash.toFixed(1) + '%');

        const statusElement = document.getElementById('result-deal-status');
        if (statusElement) {
            statusElement.textContent = currentCalculation.dealDecision ? '✅ GOOD DEAL' : '❌ NO DEAL';
            statusElement.style.color = currentCalculation.dealDecision ? '#4CAF50' : '#F44336';
        }

        const recommendationElement = document.getElementById('recommendation-text');
        if (recommendationElement) {
            if (currentCalculation.dealDecision) {
                recommendationElement.textContent = 'Este proyecto cumple con tus criterios mínimos de inversión. Recomendado proceder.';
            } else {
                let reasons = [];
                if (currentCalculation.projectionPercent < currentCalculation.profitMinPercent) {
                    reasons.push(`ROI del ${currentCalculation.projectionPercent.toFixed(1)}% es menor al mínimo de ${currentCalculation.profitMinPercent}%`);
                }
                if (currentCalculation.projection < currentCalculation.profitMinAmount) {
                    reasons.push(`Ganancia de ${formatCurrency(currentCalculation.projection)} es menor al mínimo de ${formatCurrency(currentCalculation.profitMinAmount)}`);
                }
                recommendationElement.textContent = 'No recomendado: ' + reasons.join('. ');
            }
        }

        // Update scenarios table
        updateScenariosTable();

        console.log('UI updated successfully');

    } catch (error) {
        console.error('ERROR UPDATING UI:', error);
    }
}

// Update scenarios table
function updateScenariosTable() {
    const tbody = document.getElementById('scenarios-tbody');
    if (!tbody || !currentCalculation) return;

    const scenarios = [
        { arv: currentCalculation.arv * 0.9, label: 'ARV -10%' },
        { arv: currentCalculation.arv, label: 'ARV Base' },
        { arv: currentCalculation.arv * 1.1, label: 'ARV +10%' }
    ];

    tbody.innerHTML = '';

    scenarios.forEach(scenario => {
        const resaleCommissions = (scenario.arv * currentCalculation.reCommissions) / 100;
        const totalSellingCosts = resaleCommissions + currentCalculation.resaleClosingCosts;
        const netSalePrice = scenario.arv - totalSellingCosts;
        const projection = netSalePrice - currentCalculation.tpcPlusCost;
        const roi = currentCalculation.tpcPlusCost > 0 ? (projection / currentCalculation.tpcPlusCost) * 100 : 0;

        const row = `
            <tr>
                <td>${scenario.label}</td>
                <td>${formatCurrency(scenario.arv)}</td>
                <td>${formatCurrency(netSalePrice)}</td>
                <td class="${projection >= 0 ? 'profit-positive' : 'profit-negative'}">${formatCurrency(projection)}</td>
                <td class="${roi >= 20 ? 'roi-high' : roi >= 10 ? 'roi-medium' : 'roi-low'}">${roi.toFixed(1)}%</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Reset calculator function
function resetCalculator() {
    if (confirm('¿Estás seguro de que quieres resetear todos los valores?')) {
        editingProjectId = null;
        // Reset all inputs to 0
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.value = '0';
        });

        // Reset text inputs
        const textInput = document.getElementById('property-address');
        if (textInput) textInput.value = '';

        // Reset select
        const selectInput = document.getElementById('interest-type');
        if (selectInput) selectInput.value = 'monthly';

        // Recalculate
        calculateUnderwriting();

        showNotification('Calculadora reseteada', 'info');
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

    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    notificationContainer.appendChild(notification);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

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
                <td class="${project.projection >= 0 ? 'text-success-gold' : 'text-danger-gold'}">${formatCurrency(project.projection)}</td>
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

// View project details without editing - VERSIÓN SIMPLE Y FUNCIONAL
function viewProjectDetails(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
        alert('Proyecto no encontrado');
        return;
    }

    // Crear HTML simple con estilos inline
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
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Ganancia:</strong> <span style="color: #000000 !important; background: rgba(212,175,55,0.3); padding: 4px 8px; border-radius: 4px; font-weight: bold; display: inline-block;">${formatCurrency(project.projection)}</span></p>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Decisión:</strong> <span style="background: ${project.dealDecision ? '#28a745' : '#dc3545'}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; display: inline-block;">${project.dealDecision ? '✅ BUENO' : '❌ MALO'}</span></p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <!-- Costos del Proyecto -->
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px;">
                        <h4 style="color: #d4af37; margin: 0 0 15px 0; border-bottom: 2px solid #d4af37; padding-bottom: 5px;">🏗️ Costos del Proyecto</h4>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Compra:</strong> <span style="color: #ffffff;">${formatCurrency(project.purchasePrice)}</span></p>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Rehab:</strong> <span style="color: #ffffff;">${formatCurrency(project.rehabBudget)}</span></p>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Cierre:</strong> <span style="color: #ffffff;">${formatCurrency(project.closingCosts)}</span></p>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Mantenimiento:</strong> <span style="color: #ffffff;">${formatCurrency(project.holdingCosts)}</span></p>
                    </div>
                    
                    <!-- Financiamiento -->
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px;">
                        <h4 style="color: #d4af37; margin: 0 0 15px 0; border-bottom: 2px solid #d4af37; padding-bottom: 5px;">🏦 Financiamiento</h4>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Down Payment:</strong> <span style="color: #ffffff;">${formatCurrency(project.downPaymentAmount)} (${project.downPaymentPercent?.toFixed(1) || 0}%)</span></p>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">HML Loan:</strong> <span style="color: #ffffff;">${formatCurrency(project.hmlLoanAmount)} (${project.hmlLoanPercent?.toFixed(1) || 0}%)</span></p>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">GAP Loan:</strong> <span style="color: #ffffff;">${formatCurrency(project.gapLoanAmount || 0)}</span></p>
                        <p style="margin: 5px 0;"><strong style="color: #d4af37;">Costos Venta:</strong> <span style="color: #ffffff;">${formatCurrency(project.totalSellingCosts)}</span></p>
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
    
    // Agregar al body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Función para cerrar el modal
function closeDealModal() {
    const modal = document.getElementById('dealModal');
    if (modal) {
        modal.remove();
    }
}

// Open Project Manager - Integración con DEAL existente
function openProjectManager(dealId) {
    const project = projects.find(p => p.id === dealId);
    if (!project) {
        alert('Proyecto no encontrado');
        return;
    }

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

// Crear la estructura HTML del Project Manager
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
                                        <th style="color: #d4af37;">Área</th>
                                        <th style="color: #d4af37;">Descripción</th>
                                        <th style="color: #d4af37;">Tipo</th>
                                        <th style="color: #d4af37;">Estimado</th>
                                        <th style="color: #d4af37;">Real</th>
                                        <th style="color: #d4af37;">Estado</th>
                                        <th style="color: #d4af37;">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="pm-interior-items">
                                    <!-- Se llenará dinámicamente -->
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
                                        <th style="color: #d4af37;">Área</th>
                                        <th style="color: #d4af37;">Descripción</th>
                                        <th style="color: #d4af37;">Tipo</th>
                                        <th style="color: #d4af37;">Estimado</th>
                                        <th style="color: #d4af37;">Real</th>
                                        <th style="color: #d4af37;">Estado</th>
                                        <th style="color: #d4af37;">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="pm-exterior-items">
                                    <!-- Se llenará dinámicamente -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Tab Cronograma -->
                    <div class="tab-pane fade" id="pm-schedule" role="tabpanel">
                        <h5 class="text-gold mb-4">
                            <i class="bi bi-calendar3 me-2"></i>Cronograma del Proyecto
                        </h5>
                        <div id="pm-timeline">
                            <!-- Timeline del proyecto -->
                        </div>
                    </div>

                    <!-- Tab Presupuesto -->
                    <div class="tab-pane fade" id="pm-budget" role="tabpanel">
                        <h5 class="text-gold mb-4">
                            <i class="bi bi-cash-stack me-2"></i>Control de Presupuesto
                        </h5>
                        <div id="pm-budget-control">
                            <!-- Control de presupuesto -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Botones de acción -->
        <div class="text-center mt-4">
            <button class="btn btn-secondary" onclick="backToProjects()">
                <i class="bi bi-arrow-left me-2"></i>Volver a Deals
            </button>
            <button class="btn btn-primary" onclick="saveProjectManager()">
                <i class="bi bi-save me-2"></i>Guardar Progreso
            </button>
            <button class="btn btn-success" onclick="exportProjectManagerReport()">
                <i class="bi bi-download me-2"></i>Exportar Reporte
            </button>
        </div>
    `;
    
    return section;
}

// Inicializar el Project Manager con datos del DEAL
function initializeProjectManager(project) {
    // Guardar referencia al proyecto actual
    currentProjectManager = {
        dealId: project.id,
        dealData: project,
        projectData: loadProjectManagerData(project.id) || createDefaultProjectManager(project)
    };

    // Renderizar dashboard
    renderDashboard();
    
    // Renderizar tablas de módulos
    renderModuleItems('INTERIOR');
    renderModuleItems('EXTERIOR');
    
    // Renderizar cronograma y presupuesto
    renderTimeline();
    renderBudgetControl();
}

// Renderizar dashboard del proyecto
function renderDashboard() {
    const dashboard = document.getElementById('pm-dashboard');
    const pm = currentProjectManager;
    
    dashboard.innerHTML = `
        <div class="col-md-3">
            <div class="card bg-dark border-gold">
                <div class="card-body text-center">
                    <h6 class="text-gold">Propiedad</h6>
                    <p class="text-white mb-0">${pm.dealData.propertyAddress}</p>
                    <small class="text-muted">${pm.dealData.projectName}</small>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-dark border-gold">
                <div class="card-body text-center">
                    <h6 class="text-gold">Presupuesto Total</h6>
                    <h4 class="text-white mb-0">${formatCurrency(pm.dealData.rehabBudget)}</h4>
                    <small class="text-muted">Presupuesto del DEAL</small>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-dark border-gold">
                <div class="card-body text-center">
                    <h6 class="text-gold">Progreso General</h6>
                    <h4 class="text-white mb-0">${calculateOverallProgress()}%</h4>
                    <small class="text-muted">Ítems completados</small>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-dark border-gold">
                <div class="card-body text-center">
                    <h6 class="text-gold">Estado del Proyecto</h6>
                    <span class="badge ${pm.projectData.status === 'ACTIVE' ? 'bg-success' : 'bg-warning'}">
                        ${pm.projectData.status === 'ACTIVE' ? 'ACTIVO' : 'PLANIFICACIÓN'}
                    </span>
                    <small class="text-muted d-block">Última actualización: ${new Date(pm.projectData.lastUpdated).toLocaleDateString()}</small>
                </div>
            </div>
        </div>
    `;
}

// Variables globales para el Project Manager
let currentProjectManager = null;
let projectManagerItems = [];

// Cargar datos del Project Manager desde localStorage
function loadProjectManagerData(dealId) {
    const saved = localStorage.getItem(`pm_${dealId}`);
    return saved ? JSON.parse(saved) : null;
}

// Crear estructura por defecto del Project Manager
function createDefaultProjectManager(project) {
    return {
        dealId: project.id,
        status: 'PLANNING',
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        items: [],
        budget: {
            total: project.rehabBudget,
            used: 0,
            remaining: project.rehabBudget
        },
        timeline: {
            startDate: new Date().toISOString(),
            estimatedCompletion: new Date(Date.now() + (project.projectMonths * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            phases: []
        }
    };
}

// Funciones del Project Manager
function calculateOverallProgress() {
    if (!currentProjectManager || !currentProjectManager.projectData.items.length) return 0;
    
    const completedItems = currentProjectManager.projectData.items.filter(item => item.status === 'COMPLETED').length;
    return Math.round((completedItems / currentProjectManager.projectData.items.length) * 100);
}

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

function getWorkTypeText(workType) {
    switch(workType) {
        case 'REPAIR': return 'Reparar';
        case 'REPLACE': return 'Reemplazar';
        case 'NEW': return 'Nuevo';
        case 'UPGRADE': return 'Mejorar';
        default: return workType;
    }
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'COMPLETED': return 'bg-success';
        case 'IN_PROGRESS': return 'bg-warning';
        case 'DELAYED': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function getStatusIcon(status) {
    switch(status) {
        case 'COMPLETED': return '✅';
        case 'IN_PROGRESS': return '🔄';
        case 'DELAYED': return '⚠️';
        default: return '📋';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'COMPLETED': return 'COMPLETADO';
        case 'IN_PROGRESS': return 'EN PROGRESO';
        case 'DELAYED': return 'RETRASADO';
        case 'PLANNING': return 'PLANIFICACIÓN';
        default: return status;
    }
}

function addProjectItem(category) {
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
                        <div class="col-md-4">
                            <label style="color: #d4af37;">Prioridad</label>
                            <select class="form-control" id="item-priority">
                                <option value="HIGH">Alta</option>
                                <option value="MEDIUM" selected>Media</option>
                                <option value="LOW">Baja</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label style="color: #d4af37;">Cantidad</label>
                            <input type="number" class="form-control" id="item-quantity" value="1" min="1">
                        </div>
                        <div class="col-md-4">
                            <label style="color: #d4af37;">Unidad</label>
                            <select class="form-control" id="item-unit">
                                <option value="EACH">Unidad</option>
                                <option value="SQFT">Pie Cuadrado</option>
                                <option value="LINEAR_FT">Pie Lineal</option>
                                <option value="HOUR">Hora</option>
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
    
    // Esperar un momento para que el DOM se actualice antes de agregar el event listener
    setTimeout(() => {
        // Manejar el formulario
        const form = document.getElementById('pm-item-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                console.log('Form submit event triggered');
                e.preventDefault();
                saveProjectItem(category);
            });
            console.log('Event listener added to form');
        } else {
            console.error('Form not found in modal');
        }
    }, 100);
}

// Base de datos de subcategorías con costos predefinidos
const subcategoryDatabase = {
    // INTERIOR - Baños
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
    
    // INTERIOR - Cocina
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
    
    // INTERIOR - Pisos
    "Pisos": {
        "Instalar piso flotante": { materials: 3, labor: 5, unit: "SQFT" },
        "Instalar baldosas": { materials: 4, labor: 8, unit: "SQFT" },
        "Instalar madera": { materials: 8, labor: 10, unit: "SQFT" },
        "Instalar alfombra": { materials: 3, labor: 4, unit: "SQFT" },
        "Nivelar piso": { materials: 2, labor: 6, unit: "SQFT" },
        "Instalar baseboards": { materials: 3, labor: 5, unit: "LINEAR_FT" },
        "Reparar piso existente": { materials: 50, labor: 100, unit: "SQFT" }
    },
    
    // INTERIOR - Pintura
    "Pintura": {
        "Pintar paredes": { materials: 1, labor: 2, unit: "SQFT" },
        "Pintar techo": { materials: 0.8, labor: 1.5, unit: "SQFT" },
        "Pintar molduras": { materials: 2, labor: 3, unit: "LINEAR_FT" },
        "Pintar puertas": { materials: 25, labor: 50, unit: "EACH" },
        "Preparar superficies": { materials: 0.5, labor: 3, unit: "SQFT" },
        "Remover papel pintado": { materials: 1, labor: 4, unit: "SQFT" }
    },
    
    // INTERIOR - Eléctrico
    "Eléctrico": {
        "Reemplazar panel eléctrico": { materials: 800, labor: 600, unit: "EACH" },
        "Instalar tomacorrientes": { materials: 20, labor: 80, unit: "EACH" },
        "Instalar interruptores": { materials: 15, labor: 60, unit: "EACH" },
        "Instalar plafones": { materials: 40, labor: 100, unit: "EACH" },
        "Instalar luces empotradas": { materials: 80, labor: 150, unit: "EACH" },
        "Cableado nuevo": { materials: 2, labor: 8, unit: "LINEAR_FT" },
        "Instalar breaker": { materials: 25, labor: 100, unit: "EACH" }
    },
    
    // INTERIOR - Plomería
    "Plomería": {
        "Reemplazar tuberías": { materials: 5, labor: 15, unit: "LINEAR_FT" },
        "Instalar calentador": { materials: 600, labor: 400, unit: "EACH" },
        "Reparar fuga": { materials: 50, labor: 200, unit: "EACH" },
        "Instalar válvulas": { materials: 80, labor: 120, unit: "EACH" },
        "Limpiar drenajes": { materials: 0, labor: 150, unit: "EACH" },
        "Instar bomba de agua": { materials: 400, labor: 300, unit: "EACH" }
    },
    
    // EXTERIOR - Techo
    "Techo": {
        "Reemplazar tejas asfálticas": { materials: 2.5, labor: 3, unit: "SQFT" },
        "Reemplazar tejas metálicas": { materials: 4, labor: 4, unit: "SQFT" },
        "Reparar goteras": { materials: 100, labor: 300, unit: "EACH" },
        "Limpiar canaletas": { materials: 0, labor: 150, unit: "EACH" },
        "Reemplazar canaletas": { materials: 8, labor: 10, unit: "LINEAR_FT" },
        "Instalar ventilación": { materials: 200, labor: 250, unit: "EACH" }
    },
    
    // EXTERIOR - Paredes Exteriores/Fachada
    "Paredes Exteriores/Fachada": {
        "Repintar fachada": { materials: 1.5, labor: 3, unit: "SQFT" },
        "Reparar estuco": { materials: 3, labor: 8, unit: "SQFT" },
        "Reemplazar siding": { materials: 4, labor: 6, unit: "SQFT" },
        "Limpiar fachada": { materials: 0.5, labor: 2, unit: "SQFT" },
        "Sellar grietas": { materials: 2, labor: 5, unit: "LINEAR_FT" },
        "Instalar aislamiento exterior": { materials: 2, labor: 4, unit: "SQFT" }
    },
    
    // EXTERIOR - Paisajismo
    "Paisajismo": {
        "Instalar césped": { materials: 2, labor: 3, unit: "SQFT" },
        "Plantar árboles": { materials: 150, labor: 200, unit: "EACH" },
        "Instalar sistema de riego": { materials: 3, labor: 5, unit: "LINEAR_FT" },
        "Construir jardineras": { materials: 25, labor: 40, unit: "LINEAR_FT" },
        "Colocar mulch": { materials: 1, labor: 2, unit: "SQFT" },
        "Instalar iluminación landscape": { materials: 80, labor: 120, unit: "EACH" }
    },
    
    // EXTERIOR - Garaje/Cochera
    "Garaje/Cochera": {
        "Reemplazar puerta de garaje": { materials: 800, labor: 400, unit: "EACH" },
        "Instalar opener automático": { materials: 300, labor: 200, unit: "EACH" },
        "Pintar garaje": { materials: 1, labor: 2, unit: "SQFT" },
        "Reparar piso de garaje": { materials: 3, labor: 6, unit: "SQFT" },
        "Instalar estanterías": { materials: 100, labor: 150, unit: "LINEAR_FT" },
        "Instalar ventana de garaje": { materials: 200, labor: 250, unit: "EACH" }
    },
    
    // EXTERIOR - Entrada de Vehículos
    "Entrada de Vehículos": {
        "Instalar asfalto": { materials: 4, labor: 6, unit: "SQFT" },
        "Instalar concreto": { materials: 5, labor: 8, unit: "SQFT" },
        "Instalar adoquines": { materials: 8, labor: 12, unit: "SQFT" },
        "Reparar grietas": { materials: 2, labor: 5, unit: "LINEAR_FT" },
        "Sellar superficie": { materials: 1, labor: 2, unit: "SQFT" },
        "Instalar bordes": { materials: 15, labor: 20, unit: "LINEAR_FT" }
    }
};

// Variables globales para el modal
let selectedArea = '';
let selectedCategory = '';

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

// Función para seleccionar área (actualizada para select)
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

// Variable para almacenar subcategorías seleccionadas
let selectedSubcategories = [];

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
        
        // Actualizar campo principal si es el único seleccionado
        if (selectedSubcategories.length === 1) {
            document.getElementById('item-work-type').value = workType;
        }
    }
}

// Función para agregar nueva categoría
function addNewCategory() {
    const categoryName = prompt('Nombre de la nueva categoría:');
    if (!categoryName) return;
    
    // Agregar a la base de datos como categoría vacía
    subcategoryDatabase[categoryName] = {};
    
    // Actualizar la lista de áreas
    if (selectedCategory === 'INTERIOR') {
        // No necesitamos actualizar el array ya que filterAreas usa el array estático
        alert(`Categoría "${categoryName}" agregada. Ahora puedes agregarle subcategorías.`);
    } else {
        alert(`Categoría "${categoryName}" agregada. Ahora puedes agregarle subcategorías.`);
    }
    
    // Seleccionar la nueva categoría automáticamente
    selectArea(categoryName);
}

// Función para actualizar la lista de áreas disponibles
function updateAreasList() {
    // Esta función podría actualizar dinámicamente las listas si fuera necesario
    // Por ahora, las categorías se manejan con el array estático en filterAreas
}

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

// Función para seleccionar subcategoría y actualizar costos
function selectSubcategory(name, materials, labor, unit) {
    // Actualizar campos de costo
    document.getElementById('item-materials').value = materials;
    document.getElementById('item-labor').value = labor;
    document.getElementById('item-unit').value = unit;
    
    // Actualizar descripción
    const description = document.getElementById('item-description');
    if (!description.value || description.value === '') {
        description.value = name;
    }
    
    // Marcar checkbox
    const checkboxId = `sub-${name.replace(/[^a-zA-Z0-9]/g, '')}`;
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
        checkbox.checked = true;
    }
}

function getSubcategoryOptions(category) {
    if (category === 'INTERIOR') {
        return `
            <option value="">Seleccionar...</option>
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
            <option value="Areas Comunes">Áreas Comunes</option>
            <option value="Puertas">Puertas</option>
            <option value="Ventanas">Ventanas</option>
            <option value="Pintura">Pintura</option>
            <option value="Molduras y Acabados">Molduras y Acabados</option>
            <option value="Lista Final Interior">Lista Final Interior</option>
        `;
    } else {
        return `
            <option value="">Seleccionar...</option>
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

function saveProjectItem(category) {
    const materials = parseFloat(document.getElementById('item-materials').value) || 0;
    const labor = parseFloat(document.getElementById('item-labor').value) || 0;
    const other = parseFloat(document.getElementById('item-other').value) || 0;
    const markup = parseFloat(document.getElementById('item-markup').value) || 0;
    
    const subtotal = materials + labor + other;
    const markupAmount = subtotal * (markup / 100);
    const totalEstimated = subtotal + markupAmount;
    
    const newItem = {
        id: Date.now().toString(),
        category: category,
        area: document.getElementById('item-area').value,
        description: document.getElementById('item-description').value,
        workType: document.getElementById('item-work-type').value,
        priority: document.getElementById('item-priority').value,
        quantity: parseInt(document.getElementById('item-quantity').value),
        unit: document.getElementById('item-unit').value,
        materialsCost: materials,
        laborCost: labor,
        otherCosts: other,
        markup: markup,
        totalEstimated: totalEstimated,
        totalActual: 0,
        status: 'PLANNING',
        notes: document.getElementById('item-notes').value,
        created: new Date().toISOString()
    };
    
    currentProjectManager.projectData.items.push(newItem);
    currentProjectManager.projectData.lastUpdated = new Date().toISOString();
    
    // Actualizar presupuesto
    updateBudget();
    
    // Guardar en localStorage
    saveProjectManager();
    
    // Recargar la tabla
    renderModuleItems(category);
    
    // Cerrar modal
    closeItemModal();
    
    // Actualizar dashboard
    renderDashboard();
}

function updateBudget() {
    const items = currentProjectManager.projectData.items;
    const totalUsed = items.reduce((sum, item) => sum + (item.totalActual || 0), 0);
    
    currentProjectManager.projectData.budget.used = totalUsed;
    currentProjectManager.projectData.budget.remaining = currentProjectManager.projectData.budget.total - totalUsed;
}

function closeItemModal() {
    const modal = document.getElementById('pm-item-modal');
    if (modal) {
        modal.remove();
    }
}

function editProjectItem(itemId) {
    // Implementar edición de ítem
    console.log('Editar ítem:', itemId);
}

function deleteProjectItem(itemId) {
    if (confirm('¿Estás seguro de que quieres eliminar este ítem?')) {
        currentProjectManager.projectData.items = currentProjectManager.projectData.items.filter(item => item.id !== itemId);
        currentProjectManager.projectData.lastUpdated = new Date().toISOString();
        
        updateBudget();
        saveProjectManager();
        renderModuleItems('INTERIOR');
        renderModuleItems('EXTERIOR');
        renderDashboard();
    }
}

function renderTimeline() {
    const timeline = document.getElementById('pm-timeline');
    if (!timeline) return;
    
    // Implementar timeline visual
    timeline.innerHTML = `
        <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            El cronograma del proyecto se implementará próximamente. Aquí podrás ver las fases del proyecto, fechas clave y dependencias.
        </div>
    `;
}

function renderBudgetControl() {
    const budgetControl = document.getElementById('pm-budget-control');
    if (!budgetControl || !currentProjectManager) return;
    
    const budget = currentProjectManager.projectData.budget;
    const items = currentProjectManager.projectData.items;
    
    const totalEstimated = items.reduce((sum, item) => sum + item.totalEstimated, 0);
    const totalActual = items.reduce((sum, item) => sum + (item.totalActual || 0), 0);
    const variance = totalActual - totalEstimated;
    
    budgetControl.innerHTML = `
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="card bg-dark border-gold">
                    <div class="card-body text-center">
                        <h6 class="text-gold">Presupuesto Base</h6>
                        <h4 class="text-white mb-0">${formatCurrency(budget.total)}</h4>
                        <small class="text-muted">Del DEAL original</small>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-dark border-gold">
                    <div class="card-body text-center">
                        <h6 class="text-gold">Estimado PM</h6>
                        <h4 class="text-white mb-0">${formatCurrency(totalEstimated)}</h4>
                        <small class="text-muted">Suma de ítems</small>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card bg-dark border-gold">
                    <div class="card-body text-center">
                        <h6 class="text-gold">Gastado Real</h6>
                        <h4 class="text-white mb-0">${formatCurrency(totalActual)}</h4>
                        <small class="text-muted ${variance > 0 ? 'text-danger' : 'text-success'}">
                            ${variance > 0 ? '+' : ''}${formatCurrency(variance)} variance
                        </small>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="table-responsive">
            <table class="table table-dark">
                <thead>
                    <tr>
                        <th style="color: #d4af37;">Categoría</th>
                        <th style="color: #d4af37;">Presupuesto</th>
                        <th style="color: #d4af37;">Estimado</th>
                        <th style="color: #d4af37;">Real</th>
                        <th style="color: #d4af37;">Variance</th>
                        <th style="color: #d4af37;">%</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>INTERIOR</strong></td>
                        <td>${formatCurrency(budget.total * 0.65)}</td>
                        <td>${formatCurrency(items.filter(i => i.category === 'INTERIOR').reduce((sum, item) => sum + item.totalEstimated, 0))}</td>
                        <td>${formatCurrency(items.filter(i => i.category === 'INTERIOR').reduce((sum, item) => sum + (item.totalActual || 0), 0))}</td>
                        <td class="${items.filter(i => i.category === 'INTERIOR').reduce((sum, item) => sum + (item.totalActual || 0), 0) > items.filter(i => i.category === 'INTERIOR').reduce((sum, item) => sum + item.totalEstimated, 0) ? 'text-danger' : 'text-success'}">
                            ${formatCurrency(items.filter(i => i.category === 'INTERIOR').reduce((sum, item) => sum + (item.totalActual || 0), 0) - items.filter(i => i.category === 'INTERIOR').reduce((sum, item) => sum + item.totalEstimated, 0))}
                        </td>
                        <td>${Math.round((items.filter(i => i.category === 'INTERIOR').reduce((sum, item) => sum + (item.totalActual || 0), 0) / (items.filter(i => i.category === 'INTERIOR').reduce((sum, item) => sum + item.totalEstimated, 0) || 1)) * 100)}%</td>
                    </tr>
                    <tr>
                        <td><strong>EXTERIOR</strong></td>
                        <td>${formatCurrency(budget.total * 0.25)}</td>
                        <td>${formatCurrency(items.filter(i => i.category === 'EXTERIOR').reduce((sum, item) => sum + item.totalEstimated, 0))}</td>
                        <td>${formatCurrency(items.filter(i => i.category === 'EXTERIOR').reduce((sum, item) => sum + (item.totalActual || 0), 0))}</td>
                        <td class="${items.filter(i => i.category === 'EXTERIOR').reduce((sum, item) => sum + (item.totalActual || 0), 0) > items.filter(i => i.category === 'EXTERIOR').reduce((sum, item) => sum + item.totalEstimated, 0) ? 'text-danger' : 'text-success'}">
                            ${formatCurrency(items.filter(i => i.category === 'EXTERIOR').reduce((sum, item) => sum + (item.totalActual || 0), 0) - items.filter(i => i.category === 'EXTERIOR').reduce((sum, item) => sum + item.totalEstimated, 0))}
                        </td>
                        <td>${Math.round((items.filter(i => i.category === 'EXTERIOR').reduce((sum, item) => sum + (item.totalActual || 0), 0) / (items.filter(i => i.category === 'EXTERIOR').reduce((sum, item) => sum + item.totalEstimated, 0) || 1)) * 100)}%</td>
                    </tr>
                    <tr class="table-active">
                        <td><strong>TOTAL</strong></td>
                        <td><strong>${formatCurrency(budget.total)}</strong></td>
                        <td><strong>${formatCurrency(totalEstimated)}</strong></td>
                        <td><strong>${formatCurrency(totalActual)}</strong></td>
                        <td class="${variance > 0 ? 'text-danger' : 'text-success'}"><strong>${formatCurrency(variance)}</strong></td>
                        <td><strong>${Math.round((totalActual / (totalEstimated || 1)) * 100)}%</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

function saveProjectManager() {
    if (!currentProjectManager) return;
    
    localStorage.setItem(`pm_${currentProjectManager.dealId}`, JSON.stringify(currentProjectManager.projectData));
    showNotification('Progreso del Administrador de Proyecto guardado exitosamente', 'success');
}

function exportProjectManagerReport() {
    if (!currentProjectManager) return;
    
    // Implementar exportación de reporte
    showNotification('Exportación de reporte próximamente disponible', 'info');
}

function updateNavigation(section) {
    // Actualizar navegación activa
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Actualizar título principal si es necesario
    const mainTitle = document.querySelector('.section-title-main');
    if (mainTitle && section === 'project-manager') {
        mainTitle.textContent = 'Project Manager';
    }
}

function backToProjects() {
    // Ocultar Project Manager
    const pmSection = document.getElementById('project-manager-section');
    if (pmSection) {
        pmSection.style.display = 'none';
    }
    
    // Mostrar sección de proyectos
    showSection('projects');
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
    
    // GAP Financing
    setInputValue('gap-points-rate', project.gapPointsRate || 0);
    setInputValue('gap-interest-rate', project.gapInterestRate || 0);
    
    // Selling Costs
    setInputValue('re-commissions', project.reCommissions || 0);
    setInputValue('resale-closing-costs', project.resaleClosingCosts || 0);
    
    // Profit Criteria
    setInputValue('profit-min-percent', project.profitMinPercent || 0);
    setInputValue('profit-min-amount', project.profitMinAmount || 0);

    const interestTypeElement = document.getElementById('interest-type');
    if (interestTypeElement) interestTypeElement.value = project.interestType || 'monthly';

    // Recalculate
    calculateUnderwriting();

    // Switch to calculator view
    showSection('calculator');

    showNotification('Proyecto cargado exitosamente', 'success');
}

// Generate project report function
function generateProjectReport(projectId) {
    console.log('Generating project report for ID:', projectId);

    const project = projects.find(p => p.id === projectId);
    if (!project) {
        showNotification('Proyecto no encontrado', 'error');
        return;
    }

    // Switch to project reports section
    showSection('projects-reports');

    // Generate comprehensive report for this specific project
    const reportElement = document.getElementById('project-report-content');
    if (!reportElement) {
        console.error('Project report element not found');
        return;
    }

    // Calculate scenarios for this project
    const scenarios = [
        { arv: project.arv * 0.9, label: 'ARV -10%', type: 'danger' },
        { arv: project.arv, label: 'ARV Base', type: 'warning' },
        { arv: project.arv * 1.1, label: 'ARV +10%', type: 'success' }
    ];

    const reportHTML = `
        <style>
            @media print {
                body { 
                    background: white !important; 
                    color: black !important;
                    font-family: Arial, sans-serif;
                }
                .report-content {
                    background: white !important;
                    color: black !important;
                }
                .card {
                    background: white !important;
                    border: 2px solid #007bff !important;
                    margin-bottom: 20px;
                }
                .card-header {
                    background: #007bff !important;
                    color: white !important;
                    padding: 10px;
                    font-weight: bold;
                }
                .table {
                    background: white !important;
                    color: black !important;
                    border: 1px solid #ddd !important;
                }
                .table th {
                    background: #007bff !important;
                    color: white !important;
                    border: 1px solid #ddd !important;
                    padding: 8px;
                }
                .table td {
                    color: black !important;
                    border: 1px solid #ddd !important;
                    padding: 8px;
                }
                .text-success { color: #28a745 !important; font-weight: bold; }
                .text-danger { color: #dc3545 !important; font-weight: bold; }
                .text-warning { color: #ffc107 !important; font-weight: bold; }
                .text-primary { color: #007bff !important; font-weight: bold; }
                .text-gold { color: #ffc107 !important; font-weight: bold; }
                .border-gold { border: 2px solid #ffc107 !important; }
                .bg-success { background-color: #28a745 !important; color: white !important; }
                .bg-danger { background-color: #dc3545 !important; color: white !important; }
                .badge { 
                    padding: 4px 8px; 
                    border-radius: 4px; 
                    font-weight: bold;
                }
                h4, h5, h6 { 
                    color: #007bff !important; 
                    border-bottom: 2px solid #ffc107;
                    padding-bottom: 5px;
                }
            }
        </style>
        <div class="report-content">
            <div class="row mb-4">
                <div class="col-md-12">
                    <h4 style="color: #007bff !important; border-bottom: 3px solid #ffc107; padding-bottom: 10px;">
                        <i class="bi bi-file-earmark-text"></i> Reporte Detallado - ${project.projectName || 'Proyecto ' + projectId}
                    </h4>
                    <p style="color: black !important;">
                        <strong>Fecha:</strong> ${new Date(project.date).toLocaleDateString('es-ES')}<br>
                        <strong>Dirección:</strong> ${project.propertyAddress}<br>
                        <strong>Estado:</strong> <span class="badge ${project.dealDecision ? 'bg-success' : 'bg-danger'}">${project.dealDecision ? 'BUENO' : 'NO BUENO'}</span>
                    </p>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card" style="border: 2px solid #007bff;">
                        <div class="card-header" style="background: #007bff; color: white;">
                            <h6 style="margin: 0; color: white;">Resumen de Inversión</h6>
                        </div>
                        <div class="card-body" style="background: white; color: black;">
                            <table class="table" style="background: white; color: black;">
                                <tr><td><strong>ARV Estimado:</strong></td><td class="text-success">${formatCurrency(project.arv)}</td></tr>
                                <tr><td><strong>Precio Compra:</strong></td><td class="text-danger">${formatCurrency(project.purchasePrice)}</td></tr>
                                <tr><td><strong>Presupuesto Rehab:</strong></td><td class="text-warning">${formatCurrency(project.rehabBudget)}</td></tr>
                                <tr><td><strong>Costos Totales:</strong></td><td class="text-danger">${formatCurrency(project.totalProjectCosts)}</td></tr>
                                <tr><td><strong>Capital Requerido:</strong></td><td class="text-warning">${formatCurrency(project.capitalRequired)}</td></tr>
                            </table>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card" style="border: 2px solid #ffc107;">
                            <div class="card-header" style="background: #ffc107; color: black;">
                                <h6 style="margin: 0; color: black;">Financiamiento</h6>
                            </div>
                            <div class="card-body" style="background: white; color: black;">
                                <table class="table" style="background: white; color: black;">
                                <tr><td><strong>HML Loan:</strong></td><td>${formatCurrency(project.hmlLoanAmount)}</td></tr>
                                <tr><td><strong>HML Points:</strong></td><td>${project.hmlPointsRate}%</td></tr>
                                <tr><td><strong>HML Interest:</strong></td><td>${project.hmlInterestRate}%</td></tr>
                                <tr><td><strong>GAP Loan:</strong></td><td>${formatCurrency(project.gapLoanAmount)}</td></tr>
                                <tr><td><strong>GAP Points:</strong></td><td>${project.gapPointsRate}%</td></tr>
                                <tr><td><strong>GAP Interest:</strong></td><td>${project.gapInterestRate}%</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="card" style="border: 2px solid #007bff;">
                        <div class="card-header" style="background: #007bff; color: white;">
                            <h6 style="margin: 0; color: white;">Análisis de Rentabilidad</h6>
                        </div>
                        <div class="card-body" style="background: white; color: black;">
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h5 style="color: #ffc107; border-bottom: 2px solid #007bff; padding-bottom: 5px;">ROI</h5>
                                        <h3 class="${project.roi >= 20 ? 'text-success' : project.roi >= 10 ? 'text-warning' : 'text-danger'}">
                                            ${project.roi.toFixed(1)}%
                                        </h3>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h5 style="color: #ffc107; border-bottom: 2px solid #007bff; padding-bottom: 5px;">Cash on Cash</h5>
                                        <h3 class="${project.cashOnCash >= 20 ? 'text-success' : project.cashOnCash >= 10 ? 'text-warning' : 'text-danger'}">
                                            ${project.cashOnCash.toFixed(1)}%
                                        </h3>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h5 style="color: #ffc107; border-bottom: 2px solid #007bff; padding-bottom: 5px;">Ganancia Neta</h5>
                                        <h3 class="${project.projection >= 0 ? 'text-success' : 'text-danger'}">
                                            ${formatCurrency(project.projection)}
                                        </h3>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h5 class="text-gold">Duración</h5>
                                        <h3 class="text-info">
                                            ${project.projectMonths} meses
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="card" style="border: 2px solid #ffc107;">
                        <div class="card-header" style="background: #ffc107; color: black;">
                            <h6 style="margin: 0; color: black;">Análisis de Escenarios</h6>
                        </div>
                        <div class="card-body" style="background: white; color: black;">
                            <div class="table-responsive">
                                <table class="table" style="background: white; color: black; border: 1px solid #ddd;">
                                    <thead>
                                        <tr>
                                            <th style="background: #007bff; color: white; font-weight: 700; border: 1px solid #ddd;">Escenario</th>
                                            <th style="background: #007bff; color: white; font-weight: 700; border: 1px solid #ddd;">ARV</th>
                                            <th style="background: #007bff; color: white; font-weight: 700; border: 1px solid #ddd;">Venta Neta</th>
                                            <th style="background: #007bff; color: white; font-weight: 700; border: 1px solid #ddd;">Ganancia</th>
                                            <th style="background: #007bff; color: white; font-weight: 700; border: 1px solid #ddd;">ROI</th>
                                            <th style="background: #007bff; color: white; font-weight: 700; border: 1px solid #ddd;">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${scenarios.map(scenario => {
        const resaleCommissions = (scenario.arv * project.reCommissions) / 100;
        const totalSellingCosts = resaleCommissions + project.resaleClosingCosts;
        const netSalePrice = scenario.arv - totalSellingCosts;
        const projection = netSalePrice - project.tpcPlusCost;
        const roi = project.tpcPlusCost > 0 ? (projection / project.tpcPlusCost) * 100 : 0;

        return `
                                                <tr>
                                                    <td><span class="badge bg-${scenario.type}">${scenario.label}</span></td>
                                                    <td>${formatCurrency(scenario.arv)}</td>
                                                    <td>${formatCurrency(netSalePrice)}</td>
                                                    <td class="${projection >= 0 ? 'profit-positive' : 'profit-negative'}">${formatCurrency(projection)}</td>
                                                    <td class="${roi >= 20 ? 'roi-high' : roi >= 10 ? 'roi-medium' : 'roi-low'}">${roi.toFixed(1)}%</td>
                                                    <td>
                                                        <button class="btn btn-sm btn-primary" onclick="exportProjectScenario(${projectId}, '${scenario.label}', ${scenario.arv}, ${projection.toFixed(2)}, ${roi.toFixed(1)})">
                                                            <i class="bi bi-download"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
    }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="card border-gold">
                        <div class="card-header bg-dark">
                            <h6 class="text-gold mb-0">Recomendaciones</h6>
                        </div>
                        <div class="card-body">
                            <div class="alert ${project.dealDecision ? 'alert-success' : 'alert-danger'}">
                                <h6><i class="bi bi-${project.dealDecision ? 'check-circle' : 'x-circle'}"></i> 
                                ${project.dealDecision ? 'PROYECTO RECOMENDADO' : 'PROYECTO NO RECOMENDADO'}</h6>
                                <p class="mb-0">
                                    ${project.dealDecision ?
            'Este proyecto cumple con tus criterios mínimos de inversión. Recomendado proceder con el análisis de due diligence.' :
            'Este proyecto no cumple con tus criterios mínimos de inversión. Considera renegociar el precio de compra o buscar mejores oportunidades.'
        }
                                </p>
                            </div>
                            
                            <div class="text-center mt-3">
                                <button class="btn btn-warning" onclick="exportSingleProjectReport(${projectId})">
                                    <i class="bi bi-download"></i> Exportar Reporte (.txt)
                                </button>
                                <button class="btn btn-success" onclick="exportSingleProjectReportPDF(${projectId})">
                                    <i class="bi bi-file-earmark-pdf"></i> Exportar Reporte (.pdf)
                                </button>
                                <button class="btn btn-primary" onclick="printSingleProjectReport(${projectId})">
                                    <i class="bi bi-printer"></i> Imprimir Reporte
                                </button>
                                <button class="btn btn-info" onclick="backToProjects()">
                                    <i class="bi bi-arrow-left"></i> Volver a Proyectos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    reportElement.innerHTML = reportHTML;
    showNotification('Reporte del deal generado exitosamente', 'success');
}

// Export single project report as PDF function
function exportSingleProjectReportPDF(projectId) {
    console.log('Exporting single project report as PDF for ID:', projectId);

    const project = projects.find(p => p.id === projectId);
    if (!project) {
        showNotification('Proyecto no encontrado', 'error');
        return;
    }

    // Create clean PDF document with structured data
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Set fonts and colors
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;
    
    // Helper function for adding text
    const addText = (text, x, y, fontSize = 12, color = [0, 0, 0], isBold = false) => {
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color[0], color[1], color[2]);
        if (isBold) {
            pdf.setFont(undefined, 'bold');
        } else {
            pdf.setFont(undefined, 'normal');
        }
        pdf.text(text, x, y);
    };
    
    // Helper function for adding colored rectangles
    const addRect = (x, y, width, height, color) => {
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.rect(x, y, width, height, 'F');
    };
    
    // Title Section
    addRect(20, yPosition, pageWidth - 40, 15, [0, 123, 255]); // Blue header
    addText('ADMIN360 - Reporte de Proyecto', pageWidth/2, yPosition + 10, 16, [255, 255, 255], true);
    yPosition += 25;
    
    // Project Information
    addText('INFORMACIÓN DEL PROYECTO', 20, yPosition, 14, [212, 175, 55], true); // Gold
    yPosition += 10;
    
    const projectInfo = [
        ['Nombre:', project.projectName || 'Proyecto ' + projectId],
        ['Dirección:', project.propertyAddress || 'N/A'],
        ['Fecha:', new Date(project.date).toLocaleDateString('es-ES')],
        ['Estado:', project.dealDecision ? 'BUENO ' : 'NO BUENO '],
        ['ARV:', formatCurrency(project.arv)],
        ['Meses del Proyecto:', project.projectMonths || 0]
    ];
    
    projectInfo.forEach(([label, value]) => {
        addText(label, 20, yPosition, 11, [0, 0, 0], true);
        addText(value, 60, yPosition, 11, [0, 0, 0]);
        yPosition += 8;
    });
    
    yPosition += 10;
    
    // Project Costs Section
    addRect(20, yPosition, pageWidth - 40, 10, [212, 175, 55]); // Gold header
    addText('COSTOS DEL PROYECTO', pageWidth/2, yPosition + 7, 14, [255, 255, 255], true);
    yPosition += 20;
    
    const costs = [
        ['Precio Compra:', formatCurrency(project.purchasePrice)],
        ['Presupuesto Rehab:', formatCurrency(project.rehabBudget)],
        ['Costos Cierre:', formatCurrency(project.closingCosts)],
        ['Costos Mantenimiento:', formatCurrency(project.holdingCosts)],
        ['Total Costos:', formatCurrency(project.totalProjectCosts)],
        ['Capital Requerido:', formatCurrency(project.capitalRequired)]
    ];
    
    costs.forEach(([label, value]) => {
        addText(label, 20, yPosition, 11, [0, 0, 0], true);
        addText(value, 80, yPosition, 11, [0, 0, 0]);
        yPosition += 8;
    });
    
    yPosition += 10;
    
    // Financing Section
    addRect(20, yPosition, pageWidth - 40, 10, [0, 123, 255]); // Blue header
    addText('FINANCIAMIENTO', pageWidth/2, yPosition + 7, 14, [255, 255, 255], true);
    yPosition += 20;
    
    const financing = [
        ['Down Payment:', formatCurrency(project.downPaymentAmount) + ` (${project.downPaymentPercent?.toFixed(1) || 0}%)`],
        ['Préstamo HML:', formatCurrency(project.hmlLoanAmount) + ` (${project.hmlLoanPercent?.toFixed(1) || 0}%)`],
        ['Préstamo GAP:', formatCurrency(project.gapLoanAmount || 0)],
        ['Tasa HML:', project.hmlInterestRate + '%'],
        ['Tasa GAP:', project.gapInterestRate + '%'],
        ['Costos de Venta:', formatCurrency(project.totalSellingCosts)]
    ];
    
    financing.forEach(([label, value]) => {
        addText(label, 20, yPosition, 11, [0, 0, 0], true);
        addText(value, 80, yPosition, 11, [0, 0, 0]);
        yPosition += 8;
    });
    
    yPosition += 10;
    
    // Results Section
    addRect(20, yPosition, pageWidth - 40, 10, [212, 175, 55]); // Gold header
    addText('RESULTADOS DEL ANÁLISIS', pageWidth/2, yPosition + 7, 14, [255, 255, 255], true);
    yPosition += 20;
    
    const results = [
        ['Total Costs + Financing:', formatCurrency(project.tpcPlusCost)],
        ['ROI:', project.roi.toFixed(1) + '%'],
        ['Cash on Cash:', project.cashOnCash.toFixed(1) + '%'],
        ['Ganancia Neta:', formatCurrency(project.projection)],
        ['Venta Neta:', formatCurrency(project.netSalePrice)]
    ];
    
    results.forEach(([label, value]) => {
        addText(label, 20, yPosition, 11, [0, 0, 0], true);
        addText(value, 80, yPosition, 11, [0, 0, 0]);
        yPosition += 8;
    });
    
    yPosition += 10;
    
    // Decision Section
    addRect(20, yPosition, pageWidth - 40, 10, project.dealDecision ? [40, 167, 69] : [220, 53, 69]); // Green or Red
    addText('DECISIÓN FINAL', pageWidth/2, yPosition + 7, 14, [255, 255, 255], true);
    yPosition += 20;
    
    const decision = project.dealDecision ? 
        ' PROYECTO RECOMENDADO - Este proyecto cumple con tus criterios mínimos de inversión.' :
        ' PROYECTO NO RECOMENDADO - Este proyecto no cumple con tus criterios mínimos de inversión.';
    
    // Add decision text with word wrap
    const lines = pdf.splitTextToSize(decision, pageWidth - 60, 11);
    lines.forEach(line => {
        addText(line, 20, yPosition, 11, [0, 0, 0]);
        yPosition += 6;
    });
    
    // Add footer
    yPosition = pageHeight - 30;
    addText('Generado por ADMIN360 Fix & Flip Calculator', 20, yPosition, 9, [128, 128, 128]);
    addText('Fecha: ' + new Date().toLocaleDateString('es-ES'), pageWidth - 80, yPosition, 9, [128, 128, 128]);
    
    // Save PDF
    pdf.save(`reporte-proyecto-${project.projectName || 'proyecto-' + projectId}.pdf`);
    showNotification('Reporte PDF generado exitosamente', 'success');
}

// Print single project report function
function printSingleProjectReport(projectId) {
    console.log('Printing single project report for ID:', projectId);

    // Generate report first if not already generated
    const reportElement = document.getElementById('project-report-content');
    if (!reportElement.innerHTML || reportElement.innerHTML.includes('Selecciona un proyecto')) {
        generateProjectReport(projectId);
    }

    // Wait for report to be generated, then print
    setTimeout(() => {
        window.print();
        showNotification('Diálogo de impresión abierto para el reporte', 'success');
    }, 1000);
}

// Back to projects function
function backToProjects() {
    showSection('projects');
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

    showNotification('Proyectos exportados exitosamente', 'success');
}

// Refresh report function
function refreshReport() {
    console.log('Refreshing report...');
    if (currentCalculation) {
        generateDetailedReport();
        initializeCharts();
        showNotification('Reporte actualizado exitosamente', 'success');
    } else {
        showNotification('No hay cálculo disponible para generar reporte', 'error');
    }
}

// Generate detailed report function
function generateDetailedReport() {
    console.log('Generating detailed report...');

    if (!currentCalculation) {
        showNotification('No hay cálculo disponible para generar reporte', 'error');
        return;
    }

    const reportElement = document.getElementById('detailed-report');
    if (!reportElement) {
        console.error('Detailed report element not found');
        return;
    }

    // Generate comprehensive report
    const reportHTML = `
        <div class="report-content">
            <div class="row mb-4">
                <div class="col-md-12">
                    <h4 class="text-gold mb-3" style="color: var(--accent-gold) !important;">
                        <i class="bi bi-file-earmark-text"></i> Reporte Detallado de Inversión
                    </h4>
                    <p class="text-muted">
                        <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}<br>
                        <strong>Proyecto:</strong> ${currentCalculation.projectName || 'Sin nombre'}
                    </p>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card border-gold">
                        <div class="card-header bg-dark">
                            <h6 class="text-gold mb-0">Resumen de Propiedad</h6>
                        </div>
                        <div class="card-body">
                            <table class="table table-sm">
                                <tr><td><strong>Dirección:</strong></td><td>${currentCalculation.propertyAddress}</td></tr>
                                <tr><td><strong>ARV Estimado:</strong></td><td class="text-success">${formatCurrency(currentCalculation.arv)}</td></tr>
                                <tr><td><strong>Precio Compra:</strong></td><td class="text-danger">${formatCurrency(currentCalculation.purchasePrice)}</td></tr>
                                <tr><td><strong>Presupuesto Rehab:</strong></td><td class="text-warning">${formatCurrency(currentCalculation.rehabBudget)}</td></tr>
                                <tr><td><strong>Meses Proyecto:</strong></td><td>${currentCalculation.projectMonths}</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card border-gold">
                        <div class="card-header bg-dark">
                            <h6 class="text-gold mb-0">Análisis de Costos</h6>
                        </div>
                        <div class="card-body">
                            <table class="table table-sm">
                                <tr><td><strong>Costos Totales:</strong></td><td class="text-danger">${formatCurrency(currentCalculation.totalProjectCosts)}</td></tr>
                                <tr><td><strong>Financiamiento HML:</strong></td><td>${formatCurrency(currentCalculation.hmlLoanAmount)}</td></tr>
                                <tr><td><strong>Capital Requerido:</strong></td><td class="text-warning">${formatCurrency(currentCalculation.capitalRequired)}</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="card border-gold">
                        <div class="card-header bg-dark">
                            <h6 class="text-gold mb-0">Análisis de Rentabilidad</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h5 class="text-gold">ROI</h5>
                                        <h3 class="${currentCalculation.roi >= 20 ? 'text-success' : currentCalculation.roi >= 10 ? 'text-warning' : 'text-danger'}">
                                            ${currentCalculation.roi.toFixed(1)}%
                                        </h3>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h5 class="text-gold">Cash on Cash</h5>
                                        <h3 class="${currentCalculation.cashOnCash >= 20 ? 'text-success' : currentCalculation.cashOnCash >= 10 ? 'text-warning' : 'text-danger'}">
                                            ${currentCalculation.cashOnCash.toFixed(1)}%
                                        </h3>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h5 class="text-gold">Ganancia Neta</h5>
                                        <h3 class="${currentCalculation.projection >= 0 ? 'text-success' : 'text-danger'}">
                                            ${formatCurrency(currentCalculation.projection)}
                                        </h3>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="text-center">
                                        <h5 class="text-gold">Decisión</h5>
                                        <h3 class="${currentCalculation.dealDecision ? 'text-success' : 'text-danger'}">
                                            ${currentCalculation.dealDecision ? 'BUENO' : 'NO BUENO'}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="card border-gold">
                        <div class="card-header bg-dark">
                            <h6 class="text-gold mb-0">Recomendaciones</h6>
                        </div>
                        <div class="card-body">
                            <div class="alert ${currentCalculation.dealDecision ? 'alert-success' : 'alert-danger'}">
                                <h6><i class="bi bi-${currentCalculation.dealDecision ? 'check-circle' : 'x-circle'}"></i> 
                                ${currentCalculation.dealDecision ? 'PROYECTO RECOMENDADO' : 'PROYECTO NO RECOMENDADO'}</h6>
                                <p class="mb-0">
                                    ${currentCalculation.dealDecision ?
            'Este proyecto cumple con tus criterios mínimos de inversión y muestra una rentabilidad saludable. Recomendado proceder con el análisis de due diligence.' :
            'Este proyecto no cumple con tus criterios mínimos de inversión. Considera renegociar el precio de compra o buscar mejores oportunidades.'
        }
                                </p>
                            </div>
                            
                            <h6 class="text-gold mt-3">Análisis de Escenarios:</h6>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="alert alert-info">
                                        <strong>Escenario Pesimista (ARV -10%)</strong><br>
                                        ROI: ${((currentCalculation.arv * 0.9 - (currentCalculation.arv * 0.9 * currentCalculation.reCommissions / 100 + currentCalculation.resaleClosingCosts) - currentCalculation.tpcPlusCost) / currentCalculation.tpcPlusCost * 100).toFixed(1)}%<br>
                                        Ganancia: ${formatCurrency(currentCalculation.arv * 0.9 - (currentCalculation.arv * 0.9 * currentCalculation.reCommissions / 100 + currentCalculation.resaleClosingCosts) - currentCalculation.tpcPlusCost)}
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="alert alert-warning">
                                        <strong>Escenario Base (ARV)</strong><br>
                                        ROI: ${currentCalculation.roi.toFixed(1)}%<br>
                                        Ganancia: ${formatCurrency(currentCalculation.projection)}
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="alert alert-success">
                                        <strong>Escenario Optimista (ARV +10%)</strong><br>
                                        ROI: ${((currentCalculation.arv * 1.1 - (currentCalculation.arv * 1.1 * currentCalculation.reCommissions / 100 + currentCalculation.resaleClosingCosts) - currentCalculation.tpcPlusCost) / currentCalculation.tpcPlusCost * 100).toFixed(1)}%<br>
                                        Ganancia: ${formatCurrency(currentCalculation.arv * 1.1 - (currentCalculation.arv * 1.1 * currentCalculation.reCommissions / 100 + currentCalculation.resaleClosingCosts) - currentCalculation.tpcPlusCost)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    reportElement.innerHTML = reportHTML;
    showNotification('Reporte generado exitosamente', 'success');

    // Initialize charts after generating report
    setTimeout(() => {
        initializeCharts();
    }, 500);
}

// Initialize charts function
function initializeCharts() {
    console.log('Initializing charts...');

    // Investment breakdown chart
    const investmentCtx = document.getElementById('investment-chart');
    if (investmentCtx) {
        console.log('Investment chart found, initializing...');
        createInvestmentChart(investmentCtx);
    } else {
        console.log('Investment chart not found');
    }

    // ROI trend chart
    const roiCtx = document.getElementById('roi-chart');
    if (roiCtx) {
        console.log('ROI chart found, initializing...');
        createROIChart(roiCtx);
    } else {
        console.log('ROI chart not found');
    }

    console.log('Charts initialization complete');
}

// Create investment breakdown chart
function createInvestmentChart(ctx) {
    if (!currentCalculation) {
        console.log('No calculation data available for investment chart');
        return;
    }

    // Simple chart implementation using canvas
    const canvas = ctx;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, width, height);

    // Data for chart with premium colors
    const data = [
        { label: 'Purchase', value: currentCalculation.purchasePrice, color: '#d4af37' },
        { label: 'Rehab', value: currentCalculation.rehabBudget, color: '#f1d592' },
        { label: 'Closing', value: currentCalculation.closingCosts, color: '#aa8c2c' },
        { label: 'HML Fees', value: currentCalculation.hmlTotalFees, color: '#48bb78' }
    ];

    // Calculate total
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Draw simple bar chart
    const barWidth = width / (data.length * 2);
    const maxValue = Math.max(...data.map(item => item.value));

    data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * (height - 40);
        const x = (index * 2 + 0.5) * barWidth;
        const y = height - barHeight - 20;

        // Draw bar
        context.fillStyle = item.color;
        context.fillRect(x, y, barWidth, barHeight);

        // Draw label
        context.fillStyle = '#f8f9fa';
        context.font = '10px Arial';
        context.textAlign = 'center';
        context.fillText(item.label, x + barWidth / 2, height - 5);

        // Draw value
        context.fillText(formatCurrency(item.value), x + barWidth / 2, y - 5);
    });

    console.log('Investment chart created');
}

// Create ROI trend chart
function createROIChart(ctx) {
    if (!currentCalculation) {
        console.log('No calculation data available for ROI chart');
        return;
    }

    // Simple chart implementation using canvas
    const canvas = ctx;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, width, height);

    // Data for chart - ROI scenarios
    const scenarios = [
        { label: 'ARV -10%', roi: ((currentCalculation.arv * 0.9 - (currentCalculation.arv * 0.9 * currentCalculation.reCommissions / 100 + currentCalculation.resaleClosingCosts) - currentCalculation.tpcPlusCost) / currentCalculation.tpcPlusCost) * 100 },
        { label: 'ARV Base', roi: currentCalculation.roi },
        { label: 'ARV +10%', roi: ((currentCalculation.arv * 1.1 - (currentCalculation.arv * 1.1 * currentCalculation.reCommissions / 100 + currentCalculation.resaleClosingCosts) - currentCalculation.tpcPlusCost) / currentCalculation.tpcPlusCost) * 100 }
    ];

    // Draw simple line chart
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find min and max ROI
    const minRoi = Math.min(...scenarios.map(s => s.roi));
    const maxRoi = Math.max(...scenarios.map(s => s.roi));
    const roiRange = maxRoi - minRoi || 1;

    // Draw axes
    context.strokeStyle = '#f8f9fa';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(padding, padding);
    context.lineTo(padding, height - padding);
    context.lineTo(width - padding, height - padding);
    context.stroke();

    // Draw line with gradient effect
    context.strokeStyle = '#d4af37';
    context.lineWidth = 3;
    context.shadowColor = 'rgba(212, 175, 55, 0.5)';
    context.shadowBlur = 15;
    context.beginPath();

    scenarios.forEach((scenario, index) => {
        const x = padding + (index / (scenarios.length - 1)) * chartWidth;
        const y = height - padding - ((scenario.roi - minRoi) / roiRange) * chartHeight;

        if (index === 0) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }

        // Draw point
        context.save();
        context.shadowBlur = 0;
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(x, y, 6, 0, 2 * Math.PI);
        context.fill();
        context.strokeStyle = '#d4af37';
        context.lineWidth = 2;
        context.stroke();
        context.restore();

        // Draw label
        context.fillStyle = '#cbd5e0';
        context.font = 'bold 12px Outfit, sans-serif';
        context.textAlign = 'center';
        context.fillText(scenario.label, x, height - padding + 20);
        context.fillStyle = '#ffffff';
        context.fillText(scenario.roi.toFixed(1) + '%', x, y - 15);
    });

    context.stroke();
    context.shadowBlur = 0;

    console.log('ROI chart created');
}
