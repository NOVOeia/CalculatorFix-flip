// Fix & Flip Calculator JavaScript

// Global variables
let projects = JSON.parse(localStorage.getItem('fixFlipProjects')) || [];
let currentCalculation = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    initializeCharts();
    
    // Add form submit listener
    document.getElementById('investment-form').addEventListener('submit', calculateInvestment);
    
    // Add input listeners for real-time calculation
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(calculateInvestment, 500));
    });
});

// Debounce function for real-time calculations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Main calculation function
function calculateInvestment(e) {
    if (e) {
        e.preventDefault();
    }
    
    // Get input values
    const purchasePrice = parseFloat(document.getElementById('purchase-price').value) || 0;
    const closingCostsPercent = parseFloat(document.getElementById('closing-costs').value) || 0;
    const kitchenReno = parseFloat(document.getElementById('kitchen-reno').value) || 0;
    const bathroomReno = parseFloat(document.getElementById('bathroom-reno').value) || 0;
    const floorsPaint = parseFloat(document.getElementById('floors-paint').value) || 0;
    const otherReno = parseFloat(document.getElementById('other-reno').value) || 0;
    const permits = parseFloat(document.getElementById('permits').value) || 0;
    const insurance = parseFloat(document.getElementById('insurance').value) || 0;
    const propertyTax = parseFloat(document.getElementById('property-tax').value) || 0;
    const salePrice = parseFloat(document.getElementById('sale-price').value) || 0;
    const agentCommissionPercent = parseFloat(document.getElementById('agent-commission').value) || 0;
    const marketingCosts = parseFloat(document.getElementById('marketing-costs').value) || 0;
    const loanAmount = parseFloat(document.getElementById('loan-amount').value) || 0;
    const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
    const projectDuration = parseFloat(document.getElementById('project-duration').value) || 6;
    
    // Calculate costs
    const closingCosts = purchasePrice * (closingCostsPercent / 100);
    const totalRenovationCosts = kitchenReno + bathroomReno + floorsPaint + otherReno;
    const totalOperatingCosts = permits + insurance + propertyTax;
    const agentCommission = salePrice * (agentCommissionPercent / 100);
    const totalCosts = purchasePrice + closingCosts + totalRenovationCosts + totalOperatingCosts;
    const totalSellingCosts = agentCommission + marketingCosts;
    const interestCosts = loanAmount * (interestRate / 100) * (projectDuration / 12);
    
    // Calculate profits
    const grossProfit = salePrice - totalCosts - totalSellingCosts;
    const netProfit = grossProfit - interestCosts;
    const totalInvestment = totalCosts + interestCosts;
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
    const cashOnCash = loanAmount > 0 ? (netProfit / (totalInvestment - loanAmount)) * 100 : roi;
    
    // Store current calculation
    currentCalculation = {
        projectName: document.getElementById('project-name').value,
        propertyAddress: document.getElementById('property-address').value,
        purchasePrice,
        closingCosts,
        totalRenovationCosts,
        totalOperatingCosts,
        salePrice,
        agentCommission,
        marketingCosts,
        totalSellingCosts,
        totalCosts,
        interestCosts,
        grossProfit,
        netProfit,
        totalInvestment,
        roi,
        cashOnCash,
        projectDuration,
        loanAmount,
        interestRate,
        date: new Date().toISOString()
    };
    
    // Display results
    displayResults(currentCalculation);
}

// Display calculation results
function displayResults(calculation) {
    const resultsSection = document.getElementById('results-section');
    
    const profitClass = calculation.netProfit >= 0 ? 'profit-positive' : 'profit-negative';
    const roiClass = calculation.roi >= 20 ? 'profit-positive' : calculation.roi >= 0 ? 'profit-neutral' : 'profit-negative';
    
    resultsSection.innerHTML = `
        <div class="fade-in">
            <div class="result-item ${profitClass}">
                <div class="result-label">Ganancia Neta</div>
                <div class="result-value">$${formatCurrency(calculation.netProfit)}</div>
            </div>
            
            <div class="result-item ${roiClass}">
                <div class="result-label">ROI</div>
                <div class="result-value">${calculation.roi.toFixed(2)}%</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Inversión Total</div>
                <div class="result-value">$${formatCurrency(calculation.totalInvestment)}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Costos de Renovación</div>
                <div class="result-value">$${formatCurrency(calculation.totalRenovationCosts)}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Costos Operativos</div>
                <div class="result-value">$${formatCurrency(calculation.totalOperatingCosts)}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Costos de Venta</div>
                <div class="result-value">$${formatCurrency(calculation.totalSellingCosts)}</div>
            </div>
            
            ${calculation.loanAmount > 0 ? `
            <div class="result-item">
                <div class="result-label">Costos de Interés</div>
                <div class="result-value">$${formatCurrency(calculation.interestCosts)}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">Cash on Cash ROI</div>
                <div class="result-value">${calculation.cashOnCash.toFixed(2)}%</div>
            </div>
            ` : ''}
            
            <div class="alert alert-${calculation.netProfit >= 0 ? 'success' : 'danger'} alert-custom mt-3">
                <strong>Recomendación:</strong> ${getInvestmentRecommendation(calculation)}
            </div>
        </div>
    `;
}

// Get investment recommendation based on calculations
function getInvestmentRecommendation(calculation) {
    if (calculation.roi < 0) {
        return "Esta inversión no es recomendable. Los costos superan las ganancias esperadas.";
    } else if (calculation.roi < 10) {
        return "Margen de ganancia bajo. Considera negociar mejor el precio de compra o reducir costos.";
    } else if (calculation.roi < 20) {
        return "Inversión aceptable. Revisa cuidadosamente todos los costos para optimizar ganancias.";
    } else {
        return "¡Excelente oportunidad de inversión! Los proyecciones muestran buenos retornos.";
    }
}

// Save project to localStorage
function saveProject() {
    if (!currentCalculation) {
        showNotification('Por favor, calcula la inversión primero', 'warning');
        return;
    }
    
    if (!currentCalculation.projectName || !currentCalculation.propertyAddress) {
        showNotification('Por favor, completa el nombre del proyecto y la dirección', 'warning');
        return;
    }
    
    // Generate unique ID
    currentCalculation.id = Date.now().toString();
    currentCalculation.status = 'active';
    
    // Add to projects array
    projects.push(currentCalculation);
    
    // Save to localStorage
    localStorage.setItem('fixFlipProjects', JSON.stringify(projects));
    
    // Reload projects table
    loadProjects();
    
    // Show success message
    showNotification('Proyecto guardado exitosamente', 'success');
    
    // Clear form
    document.getElementById('investment-form').reset();
    document.getElementById('results-section').innerHTML = `
        <div class="text-center text-muted">
            <i class="bi bi-calculator display-1"></i>
            <p>Completa el formulario para ver los resultados</p>
        </div>
    `;
    
    currentCalculation = null;
}

// Load projects from localStorage
function loadProjects() {
    const tbody = document.getElementById('projects-tbody');
    tbody.innerHTML = '';
    
    if (projects.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    No hay proyectos guardados. Crea tu primer proyecto usando la calculadora.
                </td>
            </tr>
        `;
        return;
    }
    
    projects.forEach(project => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${project.projectName}</td>
            <td>${project.propertyAddress}</td>
            <td>$${formatCurrency(project.totalInvestment)}</td>
            <td class="${project.roi >= 20 ? 'text-success-gold' : project.roi >= 0 ? 'text-warning-gold' : 'text-danger-gold'}">
                ${project.roi.toFixed(2)}%
            </td>
            <td class="${project.netProfit >= 0 ? 'text-success-gold' : 'text-danger-gold'}">
                $${formatCurrency(project.netProfit)}
            </td>
            <td>
                <span class="status-badge status-${project.status}">
                    ${getStatusText(project.status)}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewProject('${project.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editProject('${project.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProject('${project.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Get status text in Spanish
function getStatusText(status) {
    const statusMap = {
        'active': 'Activo',
        'completed': 'Completado',
        'planning': 'Planificación'
    };
    return statusMap[status] || status;
}

// View project details
function viewProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Populate form with project data
    document.getElementById('project-name').value = project.projectName;
    document.getElementById('property-address').value = project.propertyAddress;
    document.getElementById('purchase-price').value = project.purchasePrice;
    document.getElementById('sale-price').value = project.salePrice;
    document.getElementById('kitchen-reno').value = project.totalRenovationCosts * 0.4; // Estimate
    document.getElementById('bathroom-reno').value = project.totalRenovationCosts * 0.3; // Estimate
    document.getElementById('floors-paint').value = project.totalRenovationCosts * 0.2; // Estimate
    document.getElementById('other-reno').value = project.totalRenovationCosts * 0.1; // Estimate
    document.getElementById('loan-amount').value = project.loanAmount;
    document.getElementById('interest-rate').value = project.interestRate;
    document.getElementById('project-duration').value = project.projectDuration;
    
    // Calculate and display
    calculateInvestment();
    
    // Switch to calculator section
    showSection('calculator');
    
    showNotification('Proyecto cargado exitosamente', 'info');
}

// Edit project
function editProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // For now, just view the project. In a real app, you'd implement edit functionality
    viewProject(projectId);
    showNotification('Modo de edición activado. Modifica los valores y guarda como nuevo proyecto.', 'info');
}

// Delete project
function deleteProject(projectId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
        return;
    }
    
    projects = projects.filter(p => p.id !== projectId);
    localStorage.setItem('fixFlipProjects', JSON.stringify(projects));
    loadProjects();
    
    showNotification('Proyecto eliminado exitosamente', 'success');
}

// Export projects to JSON
function exportProjects() {
    if (projects.length === 0) {
        showNotification('No hay proyectos para exportar', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(projects, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `fix-flip-projects-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Proyectos exportados exitosamente', 'success');
}

// Show different sections
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`${section}-section`).style.display = 'block';
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update charts if reports section
    if (section === 'reports') {
        updateCharts();
        generateDetailedReport();
    }
}

// Initialize charts
function initializeCharts() {
    // Investment breakdown chart
    const investmentCtx = document.getElementById('investment-chart');
    if (investmentCtx) {
        window.investmentChart = new Chart(investmentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Compra', 'Renovación', 'Operativos', 'Venta'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#007bff',
                        '#28a745',
                        '#ffc107',
                        '#dc3545'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // ROI trend chart
    const roiCtx = document.getElementById('roi-chart');
    if (roiCtx) {
        window.roiChart = new Chart(roiCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'ROI (%)',
                    data: [],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Update charts with project data
function updateCharts() {
    if (projects.length === 0) return;
    
    // Update investment breakdown chart
    if (window.investmentChart) {
        const totalPurchase = projects.reduce((sum, p) => sum + p.purchasePrice, 0);
        const totalReno = projects.reduce((sum, p) => sum + p.totalRenovationCosts, 0);
        const totalOperative = projects.reduce((sum, p) => sum + p.totalOperatingCosts, 0);
        const totalSelling = projects.reduce((sum, p) => sum + p.totalSellingCosts, 0);
        
        window.investmentChart.data.datasets[0].data = [
            totalPurchase,
            totalReno,
            totalOperative,
            totalSelling
        ];
        window.investmentChart.update();
    }
    
    // Update ROI trend chart
    if (window.roiChart) {
        const sortedProjects = [...projects].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        window.roiChart.data.labels = sortedProjects.map(p => 
            new Date(p.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
        );
        window.roiChart.data.datasets[0].data = sortedProjects.map(p => p.roi);
        window.roiChart.update();
    }
}

// Generate detailed report
function generateDetailedReport() {
    const reportSection = document.getElementById('detailed-report');
    
    if (projects.length === 0) {
        reportSection.innerHTML = '<p class="text-muted">No hay datos disponibles para generar reportes.</p>';
        return;
    }
    
    const totalInvestment = projects.reduce((sum, p) => sum + p.totalInvestment, 0);
    const totalProfit = projects.reduce((sum, p) => sum + p.netProfit, 0);
    const avgROI = projects.reduce((sum, p) => sum + p.roi, 0) / projects.length;
    const successfulProjects = projects.filter(p => p.netProfit > 0).length;
    const successRate = (successfulProjects / projects.length) * 100;
    
    reportSection.innerHTML = `
        <div class="row">
            <div class="col-md-3">
                <div class="summary-card">
                    <h6>Inversión Total</h6>
                    <div class="summary-value">$${formatCurrency(totalInvestment)}</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card">
                    <h6>Ganancia Total</h6>
                    <div class="summary-value">$${formatCurrency(totalProfit)}</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card">
                    <h6>ROI Promedio</h6>
                    <div class="summary-value">${avgROI.toFixed(2)}%</div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="summary-card">
                    <h6>Tasa de Éxito</h6>
                    <div class="summary-value">${successRate.toFixed(1)}%</div>
                </div>
            </div>
        </div>
        
        <div class="mt-4">
            <h6>Desglose de Proyectos</h6>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Proyecto</th>
                            <th>Inversión</th>
                            <th>Ganancia</th>
                            <th>ROI</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${projects.map(p => `
                            <tr>
                                <td>${p.projectName}</td>
                                <td>$${formatCurrency(p.totalInvestment)}</td>
                                <td class="${p.netProfit >= 0 ? 'text-success-gold' : 'text-danger-gold'}">
                                    $${formatCurrency(p.netProfit)}
                                </td>
                                <td class="${p.roi >= 20 ? 'text-success-gold' : p.roi >= 0 ? 'text-warning-gold' : 'text-danger-gold'}">
                                    ${p.roi.toFixed(2)}%
                                </td>
                                <td>
                                    <span class="status-badge status-${p.status}">
                                        ${getStatusText(p.status)}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Utility function to validate form
function validateForm() {
    const requiredFields = ['project-name', 'property-address', 'purchase-price', 'sale-price'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S to save project
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveProject();
    }
    
    // Ctrl+N for new project
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('investment-form').reset();
        document.getElementById('results-section').innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-calculator display-1"></i>
                <p>Completa el formulario para ver los resultados</p>
            </div>
        `;
    }
});

// Add print functionality
function printReport() {
    window.print();
}

// Add import functionality
function importProjects(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedProjects = JSON.parse(e.target.result);
            projects = [...projects, ...importedProjects];
            localStorage.setItem('fixFlipProjects', JSON.stringify(projects));
            loadProjects();
            showNotification('Proyectos importados exitosamente', 'success');
        } catch (error) {
            showNotification('Error al importar proyectos', 'danger');
        }
    };
    reader.readAsText(file);
}
