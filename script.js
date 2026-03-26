// Fix & Flip Underwriting Calculator JavaScript - Clean Version

// Global variables
let projects = JSON.parse(localStorage.getItem('fixFlipProjects')) || [];
let currentCalculation = null;
let lastModifiedField = null;
let editingProjectId = null;
let editingItemId = null; // Track which item is being edited
let calculationTimeout = null; // For debounce
let suppressRouteSync = false;

const ROUTE_SECTIONS = new Set(['home', 'calculator', 'projects']);
let currentLanguage = localStorage.getItem('fixFlipLanguage') || 'es';

const I18N = {
    es: {
        brandSubtitle: 'Calculadora de Inversiones',
        navHome: 'Inicio',
        navCalculator: 'Calculadora',
        navProjects: 'Deals',
        heroSubtitle: 'Calculadora de Inversiones',
        heroStatRoi: 'ROI Promedio',
        heroStatDeals: 'Deals',
        heroStatAvailability: 'Disponibilidad',
        homeSubtitle: 'Panel de Control',
        homeTitle: 'Bienvenido a Fix & Flip',
        homeCardCalcTitle: 'Calculadora',
        homeCardCalcDesc: 'Análisis detallado de inversión Fix & Flip',
        homeCardDealsTitle: 'Deals',
        homeCardDealsDesc: 'Gestión y seguimiento de tus propiedades',
        homeCardPmTitle: 'Project Manager',
        homeCardPmDesc: 'Control y ejecución de obras en tiempo real',
        calculatorSubtitle: 'Paso 1: Análisis',
        calculatorTitle: 'Calculadora Fix & Flip',
        calculatorCardTitle: 'Fix & Flip Underwriting Calculator',
        btnCalculate: 'Calculate Now',
        btnSave: 'Save Deal',
        btnReset: 'Reset',
        liveResultsTitle: 'Live Results',
        resultLabelTotalInvestment: 'Total Investment',
        resultLabelProjectedProfit: 'Projected Profit',
        resultLabelCoc: 'Cash on Cash',
        resultLabelDealStatus: 'Deal Status',
        recommendationLabel: 'Recomendación:',
        recommendationDefault: 'Ingresa los datos del proyecto para evaluar viabilidad.',
        recommendationDefaultShort: 'Ingresa datos para evaluar',
        scenariosTitle: 'ROI Scenarios',
        scenariosThScenario: 'Scenario',
        scenariosThNetSale: 'Net Sale Price',
        projectsSubtitle: 'Paso 2: Inventario',
        projectsTitle: 'Mis Deals',
        projectsListTitle: 'Lista de Deals',
        backToDeals: 'Volver a Deals',
        reportEmptyMessage: 'Selecciona un proyecto para ver su reporte detallado',
        footerSubtitle: 'Calculadora de Inversiones',
        footerRights: '© 2024 Fix & Flip. Todos los derechos reservados.',
        footerPowered: 'Powered by Advanced Analytics',
        managerSelectDeal: 'Selecciona un deal para abrir Project Manager',
        managerOpenFromDeals: 'Abre Project Manager desde la tabla de Deals',
        evaluateNoData: 'Sin Datos',
        evaluateNoDataRec: 'Ingresa datos para evaluar el deal',
        evaluateExcellent: 'Excelente',
        evaluateExcellentRec: '¡Excelente oportunidad! Recomendado proceder inmediatamente.',
        evaluateGood: 'Bueno',
        evaluateGoodRec: 'Buen deal con potencial sólido. Considerar proceder.',
        evaluateFair: 'Regular',
        evaluateFairRec: 'Deal aceptable pero con riesgos. Evaluar cuidadosamente.',
        evaluatePoor: 'Malo',
        evaluatePoorRec: 'Deal no recomendado. Buscar mejores oportunidades.',
        dealStatusGood: '✅ DEAL BUENO',
        dealStatusBad: '❌ NO RECOMENDADO',
        badgeGood: 'BUENO',
        badgeBad: 'MALO',
        noProjectsExport: 'No hay proyectos para exportar',
        noCalculationSave: 'No hay cálculo para guardar',
        projectUpdated: 'Deal actualizado exitosamente',
        projectCreatedFallback: 'Deal creado (ID previo no encontrado)',
        projectSaved: 'Deal guardado exitosamente',
        projectLoaded: 'Proyecto cargado exitosamente',
        projectNotFound: 'Proyecto no encontrado',
        projectDeleted: 'Deal eliminado exitosamente',
        editingDeal: 'Editando deal:'
    },
    en: {
        brandSubtitle: 'Investment Calculator',
        navHome: 'Home',
        navCalculator: 'Calculator',
        navProjects: 'Deals',
        heroSubtitle: 'Investment Calculator',
        heroStatRoi: 'Average ROI',
        heroStatDeals: 'Deals',
        heroStatAvailability: 'Availability',
        homeSubtitle: 'Dashboard',
        homeTitle: 'Welcome to Fix & Flip',
        homeCardCalcTitle: 'Calculator',
        homeCardCalcDesc: 'Detailed Fix & Flip investment analysis',
        homeCardDealsTitle: 'Deals',
        homeCardDealsDesc: 'Track and manage your properties',
        homeCardPmTitle: 'Project Manager',
        homeCardPmDesc: 'Real-time project execution and control',
        calculatorSubtitle: 'Step 1: Analysis',
        calculatorTitle: 'Fix & Flip Calculator',
        calculatorCardTitle: 'Fix & Flip Underwriting Calculator',
        btnCalculate: 'Calculate Now',
        btnSave: 'Save Deal',
        btnReset: 'Reset',
        liveResultsTitle: 'Live Results',
        resultLabelTotalInvestment: 'Total Investment',
        resultLabelProjectedProfit: 'Projected Profit',
        resultLabelCoc: 'Cash on Cash',
        resultLabelDealStatus: 'Deal Status',
        recommendationLabel: 'Recommendation:',
        recommendationDefault: 'Enter project data to evaluate feasibility.',
        recommendationDefaultShort: 'Enter data to evaluate',
        scenariosTitle: 'ROI Scenarios',
        scenariosThScenario: 'Scenario',
        scenariosThNetSale: 'Net Sale Price',
        projectsSubtitle: 'Step 2: Inventory',
        projectsTitle: 'My Deals',
        projectsListTitle: 'Deals List',
        backToDeals: 'Back to Deals',
        reportEmptyMessage: 'Select a project to view its detailed report',
        footerSubtitle: 'Investment Calculator',
        footerRights: '© 2024 Fix & Flip. All rights reserved.',
        footerPowered: 'Powered by Advanced Analytics',
        managerSelectDeal: 'Select a deal to open Project Manager',
        managerOpenFromDeals: 'Open Project Manager from the Deals table',
        evaluateNoData: 'No Data',
        evaluateNoDataRec: 'Enter data to evaluate this deal',
        evaluateExcellent: 'Excellent',
        evaluateExcellentRec: 'Excellent opportunity! Strongly recommended to proceed.',
        evaluateGood: 'Good',
        evaluateGoodRec: 'Good deal with solid potential. Consider proceeding.',
        evaluateFair: 'Fair',
        evaluateFairRec: 'Acceptable deal but with risks. Review carefully.',
        evaluatePoor: 'Poor',
        evaluatePoorRec: 'Deal not recommended. Look for better opportunities.',
        dealStatusGood: '✅ GOOD DEAL',
        dealStatusBad: '❌ NO DEAL',
        badgeGood: 'GOOD',
        badgeBad: 'BAD',
        noProjectsExport: 'No projects to export',
        noCalculationSave: 'No calculation to save',
        projectUpdated: 'Deal updated successfully',
        projectCreatedFallback: 'Deal created (previous ID not found)',
        projectSaved: 'Deal saved successfully',
        projectLoaded: 'Project loaded successfully',
        projectNotFound: 'Project not found',
        projectDeleted: 'Deal deleted successfully',
        editingDeal: 'Editing deal:'
    }
};

function t(key) {
    return I18N[currentLanguage]?.[key] ?? I18N.es[key] ?? key;
}

const I18N_PHRASES = [
    { es: 'CALCULADORA DE UNDERWRITING FIX & FLIP', en: 'FIX & FLIP UNDERWRITING CALCULATOR' },
    { es: 'Calculadora de Underwriting Fix & Flip', en: 'Fix & Flip Underwriting Calculator' },
    { es: 'Inicio', en: 'Home' },
    { es: 'Calculadora', en: 'Calculator' },
    { es: 'Panel de Control', en: 'Dashboard' },
    { es: 'Bienvenido a Fix & Flip', en: 'Welcome to Fix & Flip' },
    { es: 'Análisis detallado de inversión Fix & Flip', en: 'Detailed Fix & Flip investment analysis' },
    { es: 'Gestión y seguimiento de tus propiedades', en: 'Track and manage your properties' },
    { es: 'Control y ejecución de obras en tiempo real', en: 'Real-time project execution and control' },
    { es: 'Paso 1: Análisis', en: 'Step 1: Analysis' },
    { es: 'Paso 2: Inventario', en: 'Step 2: Inventory' },
    { es: 'Mis Deals', en: 'My Deals' },
    { es: 'Lista de Deals', en: 'Deals List' },
    { es: 'Volver a Deals', en: 'Back to Deals' },
    { es: 'Selecciona un proyecto para ver su reporte detallado', en: 'Select a project to view its detailed report' },
    { es: 'Recomendación:', en: 'Recommendation:' },
    { es: 'Información de la Propiedad', en: 'Property Info' },
    { es: 'Ganancia del Proyecto', en: 'Project Profit' },
    { es: 'Costos del Proyecto', en: 'Project Costs' },
    { es: 'Dirección de la Propiedad', en: 'Property Address' },
    { es: 'Meses del Proyecto', en: 'Project Months' },
    { es: 'Profit Min %', en: 'Profit Min %' },
    { es: 'Ganancia Mínima Deseada', en: 'Minimum Desired Profit Amount' },
    { es: 'Ingresa la dirección de la propiedad', en: 'Enter property address' },
    { es: 'Precio de Compra', en: 'Purchase Price' },
    { es: 'Presupuesto de Rehab', en: 'Rehab Budget' },
    { es: 'Costos de Cierre', en: 'Closing Costs' },
    { es: 'Costos de Mantenimiento (mensual)', en: 'Holding Costs (monthly)' },
    { es: 'Holding Costs (mensual)', en: 'Holding Costs (monthly)' },
    { es: 'Resultados en Vivo', en: 'Live Results' },
    { es: 'Inversión Total', en: 'Total Investment' },
    { es: 'Ganancia Proyectada', en: 'Projected Profit' },
    { es: 'Retorno sobre Capital', en: 'Cash on Cash' },
    { es: 'Estado del Deal', en: 'Deal Status' },
    { es: 'DEAL BUENO', en: 'GOOD DEAL' },
    { es: 'NO RECOMENDADO', en: 'NO DEAL' },
    { es: 'Dirección completa de la propiedad a analizar', en: 'Full address of the property to analyze' },
    { es: 'Dirección completa de la propieda a analizar', en: 'Full address of the property to analyze' },
    { es: 'After Repair Value - Valor después de reparaciones', en: 'After Repair Value' },
    { es: 'Duración estimada del proyecto en meses', en: 'Estimated project duration in months' },
    { es: 'Porcentaje mínimo de ganancia deseado', en: 'Minimum desired profit percentage' },
    { es: 'Ganancia mínima deseada', en: 'Minimum desired profit amount' },
    { es: 'Monto mínimo de ganancia deseada', en: 'Minimum desired profit amount' },
    { es: 'Precio de compra de la propiedad', en: 'Property purchase price' },
    { es: 'Presupuesto de renovación', en: 'Renovation budget' },
    { es: 'Costos de cierre', en: 'Closing costs' },
    { es: 'Holding Costs (mensual)', en: 'Holding Costs (monthly)' },
    { es: 'Costos de mantenimiento por mes (se multiplicará por Project Months)', en: 'Monthly holding costs (multiplied by Project Months)' },
    { es: 'Suma total de costos del proyecto', en: 'Total sum of project costs' },
    { es: 'Puntos del préstamo HML', en: 'HML loan points' },
    { es: 'Tasa de interés anual', en: 'Annual interest rate' },
    { es: 'Tipo de cálculo de interés', en: 'Interest calculation type' },
    { es: 'Fees administrativos HML', en: 'HML admin fees' },
    { es: 'Monto del Down Payment (se calculará el % automáticamente)', en: 'Down payment amount (% is calculated automatically)' },
    { es: 'Porcentaje del Down Payment sobre Purchase Price', en: 'Down payment percent over Purchase Price' },
    { es: 'Monto calculado automáticamente (Purchase Price - Down Payment)', en: 'Automatically calculated amount (Purchase Price - Down Payment)' },
    { es: 'Porcentaje calculado automáticamente sobre Purchase Price', en: 'Automatically calculated percentage over Purchase Price' },
    { es: 'Loan-to-Value basado en ARV (HML Loan ÷ ARV × 100)', en: 'ARV-based Loan-to-Value (HML Loan ÷ ARV × 100)' },
    { es: 'Intereses totales del préstamo', en: 'Total loan interest' },
    { es: 'Total de fees del préstamo (puntos + intereses + admin)', en: 'Total loan fees (points + interest + admin)' },
    { es: 'Comisiones de agente inmobiliario', en: 'Real estate agent commissions' },
    { es: 'Costos de cierre al vender', en: 'Resale closing costs' },
    { es: 'Comisiones calculadas (ARV × %)', en: 'Calculated commissions (ARV × %)' },
    { es: 'Total costos de venta (comisiones + cierre)', en: 'Total selling costs (commissions + closing)' },
    { es: 'Precio neto de venta (ARV - costos)', en: 'Net sale price (ARV - costs)' },
    { es: 'Costos del Proyecto', en: 'Project Costs' },
    { es: 'Información de la Propiedad', en: 'Property Info' },
    { es: 'Ganancia del Proyecto', en: 'Project Profit' },
    { es: 'Financiamiento HML', en: 'HML Financing' },
    { es: 'Términos de Financiamiento', en: 'Financing Terms' },
    { es: 'Costos de Venta', en: 'Selling Costs' },
    { es: 'Análisis Total', en: 'Total Analysis' },
    { es: 'Análisis del Deal', en: 'Deal Analysis' },
    { es: 'Costos Calculados', en: 'Calculated Costs' },
    { es: 'Project Manager', en: 'Project Manager' },
    { es: 'Administrador de Proyecto', en: 'Project Manager' },
    { es: 'Panel del Proyecto', en: 'Project Dashboard' },
    { es: 'Interior', en: 'Interior' },
    { es: 'Exterior', en: 'Exterior' },
    { es: 'Presupuesto', en: 'Budget' },
    { es: 'Cronograma', en: 'Timeline' },
    { es: 'Materiales', en: 'Materials' },
    { es: 'Mano de Obra', en: 'Labor' },
    { es: 'Guardar', en: 'Save' },
    { es: 'Eliminar', en: 'Delete' },
    { es: 'Editar', en: 'Edit' },
    { es: 'Ver', en: 'View' },
    { es: 'Descargar PDF', en: 'Download PDF' },
    { es: 'Todos los derechos reservados.', en: 'All rights reserved.' },
    { es: 'Calculadora de Inversiones', en: 'Investment Calculator' }
];

function localizeString(inputText, lang) {
    if (!inputText || typeof inputText !== 'string') return inputText;
    let output = inputText;

    const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const replaceFlexible = (text, source, target) => {
        if (!source) return text;
        const escaped = escapeRegex(source.trim()).replace(/\s+/g, '\\s+');
        const regex = new RegExp(escaped, 'gi');
        return text.replace(regex, target);
    };

    I18N_PHRASES.forEach(({ es, en }) => {
        const target = lang === 'en' ? en : es;
        output = replaceFlexible(output, es, target);
        output = replaceFlexible(output, en, target);
    });

    return output;
}

function localizeDOMPhrases(root = document.body) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node?.parentElement) continue;
        const tag = node.parentElement.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE') continue;
        textNodes.push(node);
    }

    textNodes.forEach((node) => {
        const original = node.nodeValue;
        const localized = localizeString(original, currentLanguage);
        if (localized !== original) {
            node.nodeValue = localized;
        }
    });

    const attrSelectors = ['[placeholder]', '[title]', '[aria-label]'];
    root.querySelectorAll(attrSelectors.join(',')).forEach((el) => {
        ['placeholder', 'title', 'aria-label'].forEach((attr) => {
            const value = el.getAttribute(attr);
            if (!value) return;
            const localized = localizeString(value, currentLanguage);
            if (localized !== value) {
                el.setAttribute(attr, localized);
            }
        });
    });
}

let i18nObserver = null;

function ensureI18nObserver() {
    if (i18nObserver || !document.body) return;
    i18nObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    localizeDOMPhrases(node);
                }
            });
        });
    });

    i18nObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function applyTranslations() {
    document.documentElement.lang = currentLanguage;

    const map = {
        'brand-subtitle': 'brandSubtitle',
        'nav-home-label': 'navHome',
        'nav-calculator-label': 'navCalculator',
        'nav-projects-label': 'navProjects',
        'hero-subtitle': 'heroSubtitle',
        'hero-stat-roi': 'heroStatRoi',
        'hero-stat-deals': 'heroStatDeals',
        'hero-stat-availability': 'heroStatAvailability',
        'home-subtitle': 'homeSubtitle',
        'home-title': 'homeTitle',
        'home-card-calc-title': 'homeCardCalcTitle',
        'home-card-calc-desc': 'homeCardCalcDesc',
        'home-card-deals-title': 'homeCardDealsTitle',
        'home-card-deals-desc': 'homeCardDealsDesc',
        'home-card-pm-title': 'homeCardPmTitle',
        'home-card-pm-desc': 'homeCardPmDesc',
        'calculator-subtitle': 'calculatorSubtitle',
        'calculator-title': 'calculatorTitle',
        'btn-calculate-label': 'btnCalculate',
        'btn-save-label': 'btnSave',
        'btn-reset-label': 'btnReset',
        'result-label-total-investment': 'resultLabelTotalInvestment',
        'result-label-projected-profit': 'resultLabelProjectedProfit',
        'result-label-coc': 'resultLabelCoc',
        'result-label-deal-status': 'resultLabelDealStatus',
        'result-recommendation-label': 'recommendationLabel',
        'projects-subtitle': 'projectsSubtitle',
        'projects-title': 'projectsTitle',
        'back-to-deals-label': 'backToDeals',
        'report-empty-message': 'reportEmptyMessage',
        'footer-subtitle': 'footerSubtitle',
        'footer-rights': 'footerRights',
        'footer-powered': 'footerPowered'
    };

    Object.entries(map).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = t(key);
    });

    const recommendationDefault = document.getElementById('result-recommendation-text');
    if (recommendationDefault && !currentCalculation) {
        recommendationDefault.textContent = t('recommendationDefault');
    }
    const recommendationShort = document.getElementById('recommendation-text');
    if (recommendationShort && !currentCalculation) {
        recommendationShort.textContent = t('recommendationDefaultShort');
    }

    const calculatorCardTitle = document.getElementById('calculator-card-title');
    if (calculatorCardTitle) {
        calculatorCardTitle.innerHTML = `<i class="bi bi-calculator-fill me-2"></i>${t('calculatorCardTitle')}`;
    }

    const liveResultsTitle = document.getElementById('live-results-title');
    if (liveResultsTitle) {
        liveResultsTitle.innerHTML = `<i class="bi bi-lightning-fill me-2"></i>${t('liveResultsTitle')}`;
    }

    const scenariosTitle = document.getElementById('scenarios-title');
    if (scenariosTitle) {
        scenariosTitle.innerHTML = `<i class="bi bi-table me-2"></i>${t('scenariosTitle')}`;
    }

    const projectsListTitle = document.getElementById('projects-list-title');
    if (projectsListTitle) {
        projectsListTitle.innerHTML = `<i class="bi bi-folder-fill me-2"></i>${t('projectsListTitle')}`;
    }

    const thScenario = document.getElementById('scenarios-th-scenario');
    if (thScenario) thScenario.textContent = t('scenariosThScenario');
    const thNetSale = document.getElementById('scenarios-th-net-sale');
    if (thNetSale) thNetSale.textContent = t('scenariosThNetSale');

    localizeDOMPhrases(document.body);
}
const MAX_MONEY_INPUT = 100000000;
const INPUT_RANGE_RULES = {
    'project-months': { min: 0, max: 120 },
    'arv': { min: 0, max: MAX_MONEY_INPUT },
    'purchase-price': { min: 0, max: MAX_MONEY_INPUT },
    'rehab-budget': { min: 0, max: MAX_MONEY_INPUT },
    'closing-costs': { min: 0, max: MAX_MONEY_INPUT },
    'holding-costs': { min: 0, max: MAX_MONEY_INPUT },
    'hml-loan-amount': { min: 0, max: MAX_MONEY_INPUT },
    'hml-loan-percent': { min: 0, max: 100 },
    'down-payment-amount': { min: 0, max: MAX_MONEY_INPUT },
    'down-payment-percent': { min: 0, max: 100 },
    'hml-points-rate': { min: 0, max: 20 },
    'hml-interest-rate': { min: 0, max: 100 },
    'hml-admin-fees': { min: 0, max: MAX_MONEY_INPUT },
    're-commissions': { min: 0, max: 20 },
    'resale-closing-costs': { min: 0, max: MAX_MONEY_INPUT },
    'profit-min-percent': { min: 0, max: 100 },
    'profit-min-amount': { min: 0, max: MAX_MONEY_INPUT }
};

function clampValueByRule(value, rule) {
    let nextValue = value;
    if (typeof rule?.min === 'number') nextValue = Math.max(rule.min, nextValue);
    if (typeof rule?.max === 'number') nextValue = Math.min(rule.max, nextValue);
    return nextValue;
}

function sanitizeNumericInputElement(inputElement, { forceWrite = false } = {}) {
    if (!inputElement || inputElement.type !== 'number') return;

    const rawValue = inputElement.value;
    if (rawValue === '') return;

    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
        inputElement.value = '0';
        return;
    }

    const rule = INPUT_RANGE_RULES[inputElement.id];
    const clamped = rule ? clampValueByRule(parsed, rule) : parsed;

    if (forceWrite || String(clamped) !== rawValue) {
        inputElement.value = String(clamped);
    }
}

function applyInputRangeAttributes() {
    Object.entries(INPUT_RANGE_RULES).forEach(([id, rule]) => {
        const element = document.getElementById(id);
        if (!element) return;
        if (typeof rule.min === 'number') element.min = String(rule.min);
        if (typeof rule.max === 'number') element.max = String(rule.max);
    });
}

function parseRouteHash(hashValue = window.location.hash) {
    const raw = (hashValue || '').replace(/^#/, '').trim().toLowerCase();
    if (!raw) {
        return { section: 'home', dealId: null };
    }

    if (raw.startsWith('manager-')) {
        const dealId = Number(raw.replace('manager-', ''));
        return {
            section: 'manager',
            dealId: Number.isFinite(dealId) ? dealId : null
        };
    }

    if (ROUTE_SECTIONS.has(raw)) {
        return { section: raw, dealId: null };
    }

    return { section: 'home', dealId: null };
}

function syncRoute(route, { replace = false } = {}) {
    if (suppressRouteSync) return;

    const nextHash = route.section === 'manager'
        ? `#manager-${route.dealId || ''}`.replace(/-$/, '')
        : `#${route.section}`;

    const state = { section: route.section, dealId: route.dealId || null };
    const method = replace ? 'replaceState' : 'pushState';
    window.history[method](state, '', nextHash);
}

function applyRoute(route, { replace = false, skipHistory = false } = {}) {
    if (route.section === 'manager') {
        if (route.dealId) {
            openProjectManager(route.dealId, { skipHistory: true });
            if (!skipHistory) syncRoute(route, { replace });
            return;
        }

        showSection('projects', { skipHistory: true });
        showNotification(t('managerSelectDeal'), 'info');
        if (!skipHistory) syncRoute({ section: 'projects', dealId: null }, { replace });
        return;
    }

    showSection(route.section, { skipHistory: true });
    if (!skipHistory) syncRoute(route, { replace });
}

// Test calculations function
function testCalculations() {
    console.log('=== TESTING CALCULATIONS ===');
    
    // Set test values
    const testValues = {
        'property-address': '123 Test St',
        'project-months': '6',
        'arv': '200000',
        'purchase-price': '120000',
        'rehab-budget': '30000',
        'closing-costs': '3000',
        'holding-costs': '500',
        'down-payment-amount': '24000',
        'hml-loan-amount': '96000',
        'hml-points-rate': '2',
        'hml-interest-rate': '12',
        'hml-admin-fees': '1000',
        're-commissions': '6',
        'resale-closing-costs': '2000',
        'profit-min-percent': '20',
        'profit-min-amount': '30000'
    };
    
    // Set test values in form
    Object.entries(testValues).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
            console.log(`Set ${id}: ${value}`);
        } else {
            console.warn(`Element not found: ${id}`);
        }
    });
    
    // Trigger calculation
    calculateUnderwriting();
    
    console.log('=== TEST COMPLETED ===');
}

// Evaluate deal quality function
function evaluateDeal(calculation) {
    if (!calculation || calculation.arv === 0) {
        return {
            score: 0,
            level: 'poor',
            levelText: t('evaluateNoData'),
            recommendation: t('evaluateNoDataRec'),
            icon: '📊',
            risk: 'Desconocido',
            roi: 0,
            profit: 0
        };
    }

    let score = 0;
    let factors = [];

    // 1. ROI Evaluation (40% of score)
    const roi = calculation.roi;
    if (roi >= 30) {
        score += 40;
        factors.push('ROI Excelente (≥30%)');
    } else if (roi >= 20) {
        score += 30;
        factors.push('ROI Bueno (20-29%)');
    } else if (roi >= 15) {
        score += 20;
        factors.push('ROI Regular (15-19%)');
    } else if (roi >= 10) {
        score += 10;
        factors.push('ROI Bajo (10-14%)');
    } else {
        score += 0;
        factors.push('ROI Muy Bajo (<10%)');
    }

    // 2. Profit Amount Evaluation (25% of score)
    const profit = calculation.profit;
    const profitPercent = (profit / calculation.arv) * 100;
    if (profitPercent >= 25) {
        score += 25;
        factors.push('Ganancia Excelente (≥25% ARV)');
    } else if (profitPercent >= 20) {
        score += 20;
        factors.push('Ganancia Buena (20-24% ARV)');
    } else if (profitPercent >= 15) {
        score += 15;
        factors.push('Ganancia Regular (15-19% ARV)');
    } else if (profitPercent >= 10) {
        score += 10;
        factors.push('Ganancia Baja (10-14% ARV)');
    } else if (profitPercent > 0) {
        score += 5;
        factors.push('Ganancia Muy Baja (<10% ARV)');
    } else {
        score += 0;
        factors.push('Sin Ganancia');
    }

    // 3. Cash on Cash ROI Evaluation (20% of score)
    const cashOnCash = calculation.cashOnCash;
    if (cashOnCash >= 50) {
        score += 20;
        factors.push('Cash on Cash Excelente (≥50%)');
    } else if (cashOnCash >= 30) {
        score += 15;
        factors.push('Cash on Cash Bueno (30-49%)');
    } else if (cashOnCash >= 20) {
        score += 10;
        factors.push('Cash on Cash Regular (20-29%)');
    } else if (cashOnCash >= 10) {
        score += 5;
        factors.push('Cash on Cash Bajo (10-19%)');
    } else {
        score += 0;
        factors.push('Cash on Cash Muy Bajo (<10%)');
    }

    // 4. Financing Risk Evaluation (15% of score)
    const ltv = (calculation.hmlLoanAmount / calculation.arv) * 100;
    let riskLevel = 'Bajo';
    let riskScore = 15;
    
    if (ltv > 80) {
        riskScore = 0;
        riskLevel = 'Muy Alto';
        factors.push('LTV Muy Alto (>80%)');
    } else if (ltv > 75) {
        riskScore = 5;
        riskLevel = 'Alto';
        factors.push('LTV Alto (75-80%)');
    } else if (ltv > 70) {
        riskScore = 10;
        riskLevel = 'Medio';
        factors.push('LTV Medio (70-75%)');
    } else {
        riskScore = 15;
        riskLevel = 'Bajo';
        factors.push('LTV Bajo (≤70%)');
    }
    score += riskScore;

    // Determine level based on score
    let level, levelText, recommendation, icon;
    
    if (score >= 80) {
        level = 'excellent';
        levelText = t('evaluateExcellent');
        recommendation = t('evaluateExcellentRec');
        icon = '🚀';
    } else if (score >= 60) {
        level = 'good';
        levelText = t('evaluateGood');
        recommendation = t('evaluateGoodRec');
        icon = '✅';
    } else if (score >= 40) {
        level = 'fair';
        levelText = t('evaluateFair');
        recommendation = t('evaluateFairRec');
        icon = '⚠️';
    } else {
        level = 'poor';
        levelText = t('evaluatePoor');
        recommendation = t('evaluatePoorRec');
        icon = '❌';
    }

    return {
        score: Math.round(score),
        level: level,
        levelText: levelText,
        recommendation: recommendation,
        icon: icon,
        risk: riskLevel,
        roi: roi,
        profit: profit,
        factors: factors
    };
}

// Update deal evaluator UI (semicircular gauge + score)
function updateDealEvaluator(evaluation) {
    try {
        const needleRot = document.getElementById('gauge-needle-rot');
        const gaugeSvg = document.querySelector('.deal-gauge-svg');
        const evaluatorRoot = document.querySelector('.deal-evaluator');

        if (!needleRot) {
            console.warn('Gauge needle element not found, skipping deal evaluator update');
            return;
        }

        const score = Math.max(0, Math.min(100, Number(evaluation.score) || 0));
        const noData = evaluation.levelText === t('evaluateNoData');

        // Needle: -90° = Malo (izq.), + 90° = Excelente (der.)
        const needleDeg = -90 + (score / 100) * 180;
        needleRot.style.transform = `rotate(${needleDeg}deg)`;
        needleRot.style.transformOrigin = '0 0';

        if (gaugeSvg) {
            gaugeSvg.setAttribute(
                'aria-label',
                noData
                    ? 'Sin datos para evaluar el deal'
                    : `Puntuación ${score} de cien, nivel ${evaluation.levelText}`,
            );
        }

        if (evaluatorRoot) {
            evaluatorRoot.classList.toggle('deal-evaluator--empty', noData);
        }

        document.querySelectorAll('.gauge-wedge').forEach((el) => {
            const seg = el.getAttribute('data-level');
            if (noData) {
                el.classList.remove('gauge-wedge--dim');
                return;
            }
            el.classList.toggle('gauge-wedge--dim', seg !== evaluation.level);
        });

        const scoreElement = document.getElementById('score-value');
        if (scoreElement) scoreElement.textContent = String(score);

        const levelEl = document.getElementById('evaluator-level');
        if (levelEl) levelEl.textContent = evaluation.levelText || '';

        const roiElement = document.getElementById('detail-roi');
        const profitElement = document.getElementById('detail-profit');
        const riskElement = document.getElementById('detail-risk');

        if (roiElement) roiElement.textContent = formatPercentage(evaluation.roi);
        if (profitElement) profitElement.textContent = formatCurrency(evaluation.profit);
        if (riskElement) riskElement.textContent = evaluation.risk;

        const iconElement = document.getElementById('recommendation-icon');
        const textElement = document.getElementById('recommendation-text');

        if (iconElement) iconElement.textContent = evaluation.icon;
        if (textElement) textElement.textContent = evaluation.recommendation;

        const resultRecEl = document.getElementById('result-recommendation-text');
        if (resultRecEl) resultRecEl.textContent = evaluation.recommendation;

        console.log('Deal evaluator updated:', evaluation);
    } catch (error) {
        console.error('Error updating deal evaluator:', error);
    }
}

// Format percentage function
function formatPercentage(value, decimals = 2) {
    // Handle NaN, undefined, null, or invalid values
    if (isNaN(value) || value === null || value === undefined || value === '') {
        value = 0;
    }
    return value.toFixed(decimals) + '%';
}

// Format short percentage function (for input fields)
function formatPercentageShort(value, decimals = 1) {
    // Handle NaN, undefined, null, or invalid values
    if (isNaN(value) || value === null || value === undefined || value === '') {
        value = 0;
    }
    return value.toFixed(decimals);
}

// Format currency function
function formatCurrency(amount) {
    // Handle NaN, undefined, null, or invalid values
    if (isNaN(amount) || amount === null || amount === undefined || amount === '') {
        amount = 0;
    }
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

    if (!I18N[currentLanguage]) {
        currentLanguage = 'es';
    }
    const langSwitcher = document.getElementById('language-switcher');
    if (langSwitcher) {
        langSwitcher.value = currentLanguage;
        langSwitcher.addEventListener('change', (event) => {
            currentLanguage = event.target.value === 'en' ? 'en' : 'es';
            localStorage.setItem('fixFlipLanguage', currentLanguage);
            applyTranslations();
            loadProjects();
            if (currentCalculation) {
                updateUI();
            }
        });
    }
    applyTranslations();
    ensureI18nObserver();

    // Load projects and setup
    loadProjects();
    initializeCharts();

    // Setup event listeners for real-time updates
    applyInputRangeAttributes();
    setupEventListeners();

    // Initial calculation
    setTimeout(() => {
        calculateUnderwriting();
        const initialRoute = parseRouteHash();
        applyRoute(initialRoute, { replace: true });
    }, 500);

    window.addEventListener('popstate', () => {
        suppressRouteSync = true;
        applyRoute(parseRouteHash(), { skipHistory: true });
        suppressRouteSync = false;
    });

    document.addEventListener('click', (event) => {
        const anchor = event.target.closest('a[href="#"]');
        if (anchor) {
            event.preventDefault();
        }
    });

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
            sanitizeNumericInputElement(input);
            
            // Clear previous timeout
            if (calculationTimeout) {
                clearTimeout(calculationTimeout);
            }
            
            // Debounce calculation to avoid excessive calls
            calculationTimeout = setTimeout(() => {
                calculateUnderwriting();
            }, 300); // Wait 300ms after user stops typing
        });

        input.addEventListener('change', function () {
            console.log(`Input ${index} (${input.id}) changed (change event): ${input.value}`);
            sanitizeNumericInputElement(input, { forceWrite: true });
            calculateUnderwriting();
        });

        input.addEventListener('blur', function () {
            console.log(`Input ${index} (${input.id}) blurred with value: ${input.value}`);
            sanitizeNumericInputElement(input, { forceWrite: true });
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
            const parsed = parseFloat(element.value);
            const numericValue = Number.isFinite(parsed) ? parsed : defaultValue;
            const rule = INPUT_RANGE_RULES[id];
            const safeValue = rule ? clampValueByRule(numericValue, rule) : numericValue;
            if (element.type === 'number' && element.value !== String(safeValue)) {
                element.value = String(safeValue);
            }
            console.log(`${id}: ${safeValue}`);
            return safeValue;
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
        let hmlLoanAmount = getInputValue('hml-loan-amount', 0);
        let hmlLoanPercent = getInputValue('hml-loan-percent', 0);
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
            calculatedDownPaymentPercent = Math.round((downPaymentAmount / purchasePrice) * 100 * 10) / 10;
        } else if (downPaymentPercent > 0 && purchasePrice > 0 && downPaymentAmount === 0) {
            calculatedDownPaymentAmount = (purchasePrice * downPaymentPercent) / 100;
        } else if (downPaymentAmount > 0 && downPaymentPercent > 0 && purchasePrice > 0) {
            const expectedPercent = Math.round((downPaymentAmount / purchasePrice) * 100 * 10) / 10;
            const expectedAmount = (purchasePrice * downPaymentPercent) / 100;
            
            if (lastModifiedField === 'down-payment-amount') {
                calculatedDownPaymentPercent = expectedPercent;
            } else if (lastModifiedField === 'down-payment-percent') {
                calculatedDownPaymentAmount = expectedAmount;
            }
        }

        // HML Loan calculations - Automatically calculate as Purchase Price - Down Payment
        calculatedHmlLoanAmount = purchasePrice - calculatedDownPaymentAmount;
        
        if (calculatedHmlLoanAmount > 0 && purchasePrice > 0) {
            calculatedHmlLoanPercent = Math.round((calculatedHmlLoanAmount / purchasePrice) * 100 * 10) / 10;
        } else {
            calculatedHmlLoanAmount = 0;
            calculatedHmlLoanPercent = 0;
        }
        
        // Override user input for HML Loan Amount since it's calculated automatically
        if (lastModifiedField !== 'hml-loan-amount' && lastModifiedField !== 'hml-loan-percent') {
            hmlLoanAmount = calculatedHmlLoanAmount;
            hmlLoanPercent = calculatedHmlLoanPercent;
        }

        // 3. Calculate GAP Loan if needed
        const totalFinancingNeeded = totalProjectCosts - calculatedDownPaymentAmount;
        let gapLoanAmount = 0;
        if (calculatedHmlLoanAmount < totalFinancingNeeded) {
            gapLoanAmount = totalFinancingNeeded - calculatedHmlLoanAmount;
        }

        // 4. Calculate financing costs
        const hmlPoints = calculatedHmlLoanAmount * (hmlPointsRate / 100);
        let monthlyPayment = 0;
        let totalHmlInterest = 0;
        
        if (projectMonths > 0 && hmlInterestRate > 0) {
            const monthlyRate = hmlInterestRate / 100 / 12;
            const denominator = Math.pow(1 + monthlyRate, projectMonths) - 1;
            
            if (denominator > 0) {
                monthlyPayment = calculatedHmlLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, projectMonths) / denominator;
                totalHmlInterest = monthlyPayment * projectMonths - calculatedHmlLoanAmount;
            } else {
                totalHmlInterest = 0;
            }
        } else {
            totalHmlInterest = 0;
        }
        
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
        
        // Only show notification for critical errors, not for NaN/Infinity issues
        if (error.message && !error.message.includes('NaN') && !error.message.includes('Infinity')) {
            showNotification('Error en el cálculo: ' + error.message, 'error');
        }
        
        // Reset calculation to prevent UI issues
        currentCalculation = {
            projectName: 'Error',
            propertyAddress: '',
            projectMonths: 0,
            arv: 0,
            purchasePrice: 0,
            rehabBudget: 0,
            closingCosts: 0,
            holdingCosts: 0,
            hmlLoanAmount: 0,
            hmlLoanPercent: 0,
            downPaymentAmount: 0,
            downPaymentPercent: 0,
            hmlPointsCost: 0,
            hmlTotalInterest: 0,
            hmlTotalFees: 0,
            gapLoanAmount: 0,
            reCommissions: 0,
            resaleClosingCosts: 0,
            resaleCommissions: 0,
            totalSellingCosts: 0,
            netSalePrice: 0,
            profitMinPercent: 0,
            profitMinAmount: 0,
            totalProjectCosts: 0,
            tpcPlusCost: 0,
            totalCapitalNeeded: 0,
            capitalRequired: 0,
            profit: 0,
            roi: 0,
            cashOnCash: 0,
            dealDecision: false,
            date: new Date().toISOString(),
            interestType: 'monthly'
        };
        
        // Update UI with safe values
        updateUI();
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
        updateValue('down-payment-percent', formatPercentageShort(currentCalculation.downPaymentPercent));
        updateValue('hml-loan-amount', currentCalculation.hmlLoanAmount);
        updateValue('hml-loan-percent', formatPercentageShort(currentCalculation.hmlLoanPercent));
        updateField('hml-total-fees', formatCurrency(currentCalculation.hmlTotalFees));
        updateField('hml-ltv-display', currentCalculation.arv > 0 ? formatPercentage((currentCalculation.hmlLoanAmount / currentCalculation.arv) * 100) : '0.00%');

        // Selling Costs
        updateField('resale-commissions', formatCurrency(currentCalculation.resaleCommissions));
        updateField('total-selling-costs', formatCurrency(currentCalculation.totalSellingCosts));
        updateField('net-sale-price', formatCurrency(currentCalculation.netSalePrice));

        // Total Analysis
        updateField('tpc-plus-cost', formatCurrency(currentCalculation.tpcPlusCost));
        updateField('as-percent-of-arv', currentCalculation.arv > 0 ? formatPercentage((currentCalculation.tpcPlusCost / currentCalculation.arv) * 100) : '0.00%');
        updateField('total-capital-needed', formatCurrency(currentCalculation.totalCapitalNeeded));
        updateField('capital-required', formatCurrency(currentCalculation.capitalRequired));

        // Deal Analysis
        updateField('projection', formatCurrency(currentCalculation.profit));
        updateField('roi', formatPercentage(currentCalculation.roi));
        updateField('coc', formatPercentage(currentCalculation.cashOnCash));

        // Deal Evaluation with Thermometer
        const evaluation = evaluateDeal(currentCalculation);
        updateDealEvaluator(evaluation);

        // Results Panel
        updateField('result-total-investment', formatCurrency(currentCalculation.tpcPlusCost));
        updateField('result-profit', formatCurrency(currentCalculation.profit));
        updateField('result-roi', formatPercentage(currentCalculation.roi));
        updateField('result-coc', formatPercentage(currentCalculation.cashOnCash));

        const statusElement = document.getElementById('result-deal-status');
        if (statusElement) {
            statusElement.textContent = currentCalculation.dealDecision ? t('dealStatusGood') : t('dealStatusBad');
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
        showNotification(t('noCalculationSave'), 'error');
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
            showNotification(t('projectUpdated'), 'success');
        } else {
            // Fallback if ID not found
            projects.push({ ...currentCalculation, id: Date.now() });
            showNotification(t('projectCreatedFallback'), 'info');
        }
        editingProjectId = null;
    } else {
        // Create new project
        const project = {
            ...currentCalculation,
            id: Date.now()
        };
        projects.push(project);
        showNotification(t('projectSaved'), 'success');
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
                        ${project.dealDecision ? t('badgeGood') : t('badgeBad')}
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
        showNotification(t('projectNotFound'), 'error');
        return;
    }

    editingProjectId = projectId;
    showNotification(`${t('editingDeal')} ${project.propertyAddress}`, 'info');
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

    showNotification(t('projectLoaded'), 'success');
}

// Delete project function
function deleteProject(projectId) {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
        projects = projects.filter(p => p.id !== projectId);
        localStorage.setItem('fixFlipProjects', JSON.stringify(projects));
        loadProjects();
        showNotification(t('projectDeleted'), 'success');
    }
}

// Show section function
function showSection(sectionId, options = {}) {
    const inlineEvent = options.event || (typeof window !== 'undefined' ? window.event : null);
    if (inlineEvent && typeof inlineEvent.preventDefault === 'function') {
        inlineEvent.preventDefault();
    }

    console.log(`Switching to section: ${sectionId}`);

    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show target section
    let resolvedSection = sectionId;
    let targetSection = document.getElementById(resolvedSection + '-section');
    if (!targetSection && resolvedSection === 'manager') {
        resolvedSection = 'projects';
        targetSection = document.getElementById('projects-section');
        showNotification(t('managerOpenFromDeals'), 'info');
    }

    if (targetSection) {
        targetSection.style.display = 'block';
    } else {
        console.warn(`Section ${resolvedSection}-section not found`);
    }

    // Handle Hero section visibility
    const heroWrapper = document.getElementById('hero-wrapper');
    if (heroWrapper) {
        if (resolvedSection === 'home') {
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

    const activeLink = document.querySelector(`[onclick="showSection('${resolvedSection}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    if (!options.skipHistory) {
        syncRoute({ section: resolvedSection, dealId: null });
    }
}

// Export projects function
function exportProjects() {
    if (projects.length === 0) {
        showNotification(t('noProjectsExport'), 'error');
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
function openProjectManager(dealId, options = {}) {
    const project = projects.find(p => p.id === dealId);
    if (!project) {
        alert(t('projectNotFound'));
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

    if (!options.skipHistory) {
        syncRoute({ section: 'manager', dealId });
    }
}

// Load Project Manager data
function loadProjectManagerData(projectId) {
    const data = localStorage.getItem(`pm_${projectId}`);
    return data ? JSON.parse(data) : null;
}

// Create default Project Manager
function createDefaultProjectManager(projectId) {
    // Buscar el proyecto original para obtener el presupuesto de reparaciones
    const originalProject = projects.find(p => p.id === projectId);
    const repairBudget = originalProject ? (originalProject.rehabBudget || 0) : 0;
    
    return {
        projectId: projectId,
        projectName: 'Proyecto ' + projectId,
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        status: 'ACTIVE',
        dealRepairBudget: repairBudget, // Presupuesto original del Deal
        budget: {
            total: repairBudget, // Inicializar con el presupuesto del Deal
            used: 0,
            remaining: repairBudget
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
                <h5 class="text-white mb-0">
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
    if (!timeline || !currentProjectManager) return;
    
    const items = currentProjectManager.projectData.items;
    if (items.length === 0) {
        timeline.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-calendar3" style="font-size: 3rem;"></i>
                <p class="mt-3">No hay ítems agregados. Agrega ítems para ver el cronograma del proyecto.</p>
            </div>
        `;
        return;
    }
    
    // Agrupar ítems por categoría y estado
    const interiorItems = items.filter(item => item.category === 'INTERIOR');
    const exteriorItems = items.filter(item => item.category === 'EXTERIOR');
    
    // Calcular fechas estimadas
    const startDate = new Date(currentProjectManager.projectData.timeline.startDate);
    const totalDays = 90; // Estimado 90 días para proyecto completo
    
    let html = `
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="card bg-dark text-white">
                    <div class="card-body">
                        <h6 class="text-gold">📋 Resumen del Proyecto</h6>
                        <div class="row text-center">
                            <div class="col-4">
                                <div class="border-end border-secondary">
                                    <h4 class="text-success mb-0">${items.length}</h4>
                                    <small>Total Ítems</small>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="border-end border-secondary">
                                    <h4 class="text-warning mb-0">${interiorItems.length}</h4>
                                    <small>Interior</small>
                                </div>
                            </div>
                            <div class="col-4">
                                <h4 class="text-info mb-0">${exteriorItems.length}</h4>
                                <small>Exterior</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card bg-dark text-white">
                    <div class="card-body">
                        <h6 class="text-gold">📅 Fechas Estimadas</h6>
                        <div class="row text-center">
                            <div class="col-6">
                                <div class="border-end border-secondary">
                                    <h6 class="text-primary mb-0" style="cursor: pointer;" onclick="editProjectStartDate()" title="Click para editar fecha de inicio">
                                        ${startDate.toLocaleDateString('es-ES')} 
                                        <i class="bi bi-pencil-square" style="font-size: 0.8rem;"></i>
                                    </h6>
                                    <small>Inicio (click para editar)</small>
                                </div>
                            </div>
                            <div class="col-6">
                                <h6 class="text-success mb-0">${new Date(startDate.getTime() + totalDays * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}</h6>
                                <small>Fin Estimado</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-gold mb-3">🏠 Fases Interiores</h6>
                <div class="timeline-phase">
                    ${generatePhaseHTML(interiorItems, 'INTERIOR', startDate, 0)}
                </div>
            </div>
            <div class="col-md-6">
                <h6 class="text-gold mb-3">🏡 Fases Exteriores</h6>
                <div class="timeline-phase">
                    ${generatePhaseHTML(exteriorItems, 'EXTERIOR', startDate, 45)}
                </div>
            </div>
        </div>
        
        <div class="mt-4">
            <h6 class="text-gold mb-3">📊 Progreso por Estado</h6>
            <div class="row">
                ${generateProgressByStatus(items)}
            </div>
        </div>
    `;
    
    timeline.innerHTML = html;
}

// Generate phase HTML
function generatePhaseHTML(items, category, startDate, dayOffset) {
    if (items.length === 0) {
        return '<p class="text-muted">No hay ítems en esta categoría</p>';
    }
    
    // Agrupar por área
    const areas = {};
    items.forEach(item => {
        if (!areas[item.area]) {
            areas[item.area] = [];
        }
        areas[item.area].push(item);
    });
    
    let html = '';
    let currentDay = dayOffset;
    
    Object.entries(areas).forEach(([area, areaItems]) => {
        const areaStart = new Date(startDate.getTime() + currentDay * 24 * 60 * 60 * 1000);
        const areaDuration = Math.max(7, areaItems.length * 3); // Mínimo 7 días por área
        const areaEnd = new Date(areaStart.getTime() + areaDuration * 24 * 60 * 60 * 1000);
        
        html += `
            <div class="card bg-dark text-white mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${area}</h6>
                        <small class="text-muted">
                            ${areaStart.toLocaleDateString('es-ES')} - ${areaEnd.toLocaleDateString('es-ES')}
                            (${areaDuration} días)
                        </small>
                    </div>
                    <div class="mt-2">
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar bg-success" style="width: ${calculateAreaProgress(areaItems)}%"></div>
                        </div>
                        <small class="text-muted">${areaItems.length} ítems</small>
                    </div>
                    <div class="mt-2">
                        ${areaItems.slice(0, 3).map(item => `
                            <span class="badge ${getStatusBadgeClass(item.status)} me-1" style="font-size: 0.7rem;">
                                ${item.description.substring(0, 20)}${item.description.length > 20 ? '...' : ''}
                            </span>
                        `).join('')}
                        ${areaItems.length > 3 ? `<small class="text-muted">+${areaItems.length - 3} más</small>` : ''}
                    </div>
                    <div class="mt-3">
                        <div class="row">
                            <div class="col-md-6">
                                <button class="btn btn-sm btn-outline-info w-100" onclick="managePhaseSuppliers('${area}', '${category}')">
                                    <i class="bi bi-people me-1"></i>Proveedores
                                </button>
                            </div>
                            <div class="col-md-6">
                                <button class="btn btn-sm btn-outline-warning w-100" onclick="managePhaseNotes('${area}', '${category}')">
                                    <i class="bi bi-sticky me-1"></i>Notas
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3 p-2" style="background: #2c3440; border-radius: 5px; border: 1px solid #d4af37;">
                        <div class="row text-center">
                            <div class="col-md-4">
                                <small class="text-muted">Tiempo Estimado</small>
                                <div class="fw-bold text-warning">${getPhaseDurationDisplay(area, category)}</div>
                            </div>
                            <div class="col-md-4">
                                <small class="text-muted">Proveedores</small>
                                <div class="fw-bold text-info">${getPhaseSuppliersCount(area, category)}</div>
                            </div>
                            <div class="col-md-4">
                                <small class="text-muted">Costo Total</small>
                                <div class="fw-bold text-success">${getPhaseTotalCost(area, category)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        currentDay += areaDuration;
    });
    
    return html;
}

// Generate progress by status
function generateProgressByStatus(items) {
    const statusCounts = {
        'PLANNING': 0,
        'IN_PROGRESS': 0,
        'COMPLETED': 0,
        'ON_HOLD': 0
    };
    
    items.forEach(item => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });
    
    const total = items.length;
    
    return `
        <div class="col-md-3">
            <div class="card bg-dark text-white text-center">
                <div class="card-body">
                    <h5 class="text-secondary">${statusCounts.PLANNING}</h5>
                    <small>Planificación</small>
                    <div class="progress mt-2" style="height: 6px;">
                        <div class="progress-bar bg-secondary" style="width: ${(statusCounts.PLANNING / total * 100)}%"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-dark text-white text-center">
                <div class="card-body">
                    <h5 class="text-warning">${statusCounts.IN_PROGRESS}</h5>
                    <small>En Progreso</small>
                    <div class="progress mt-2" style="height: 6px;">
                        <div class="progress-bar bg-warning" style="width: ${(statusCounts.IN_PROGRESS / total * 100)}%"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-dark text-white text-center">
                <div class="card-body">
                    <h5 class="text-success">${statusCounts.COMPLETED}</h5>
                    <small>Completado</small>
                    <div class="progress mt-2" style="height: 6px;">
                        <div class="progress-bar bg-success" style="width: ${(statusCounts.COMPLETED / total * 100)}%"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card bg-dark text-white text-center">
                <div class="card-body">
                    <h5 class="text-danger">${statusCounts.ON_HOLD}</h5>
                    <small>En Espera</small>
                    <div class="progress mt-2" style="height: 6px;">
                        <div class="progress-bar bg-danger" style="width: ${(statusCounts.ON_HOLD / total * 100)}%"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Calculate area progress
function calculateAreaProgress(items) {
    if (items.length === 0) return 0;
    
    const completed = items.filter(item => item.status === 'COMPLETED').length;
    return Math.round((completed / items.length) * 100);
}

// Render budget control
function renderBudgetControl() {
    const budget = document.getElementById('pm-budget-control');
    if (!budget || !currentProjectManager) return;
    
    const items = currentProjectManager.projectData.items;
    const dealRepairBudget = currentProjectManager.projectData.dealRepairBudget || 0;
    
    if (items.length === 0) {
        budget.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card bg-dark text-white">
                        <div class="card-body text-center">
                            <h4 class="text-gold mb-1">${formatCurrency(dealRepairBudget)}</h4>
                            <small>Presupuesto de Reparaciones (Deal)</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card bg-dark text-white">
                        <div class="card-body text-center">
                            <h4 class="text-info mb-1">$0</h4>
                            <small>Gastado en Reparaciones</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="text-center text-muted py-4">
                <i class="bi bi-cash-stack" style="font-size: 3rem;"></i>
                <p class="mt-3">No hay ítems agregados. Agrega ítems para ver el control de presupuesto.</p>
            </div>
        `;
        return;
    }
    
    // Calcular totales
    const totalEstimated = items.reduce((sum, item) => sum + item.totalEstimated, 0);
    const totalActual = items.reduce((sum, item) => sum + (item.totalActual || 0), 0);
    const totalMaterials = items.reduce((sum, item) => sum + item.materialsCost, 0);
    const totalLabor = items.reduce((sum, item) => sum + item.laborCost, 0);
    const totalOther = items.reduce((sum, item) => sum + item.otherCosts, 0);
    const totalMarkup = items.reduce((sum, item) => sum + (item.totalEstimated - item.materialsCost - item.laborCost - item.otherCosts), 0);
    
    // Agrupar por categoría
    const interiorItems = items.filter(item => item.category === 'INTERIOR');
    const exteriorItems = items.filter(item => item.category === 'EXTERIOR');
    
    const interiorEstimated = interiorItems.reduce((sum, item) => sum + item.totalEstimated, 0);
    const exteriorEstimated = exteriorItems.reduce((sum, item) => sum + item.totalEstimated, 0);
    
    // Agrupar por área
    const areaBudgets = {};
    items.forEach(item => {
        if (!areaBudgets[item.area]) {
            areaBudgets[item.area] = {
                estimated: 0,
                actual: 0,
                count: 0,
                items: []
            };
        }
        areaBudgets[item.area].estimated += item.totalEstimated;
        areaBudgets[item.area].actual += (item.totalActual || 0);
        areaBudgets[item.area].count += 1;
        areaBudgets[item.area].items.push(item);
    });
    
    // Calcular variación vs presupuesto del Deal
    const budgetVariance = totalEstimated - dealRepairBudget;
    const budgetVariancePercent = dealRepairBudget > 0 ? Math.round((budgetVariance / dealRepairBudget) * 100) : 0;
    
    let html = `
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-dark text-white">
                    <div class="card-body text-center">
                        <h4 class="text-gold mb-1">${formatCurrency(dealRepairBudget)}</h4>
                        <small>Presupuesto Deal</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-dark text-white">
                    <div class="card-body text-center">
                        <h4 class="text-warning mb-1">${formatCurrency(totalEstimated)}</h4>
                        <small>Presupuesto PM</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-dark text-white">
                    <div class="card-body text-center">
                        <h4 class="text-info mb-1">${formatCurrency(totalActual)}</h4>
                        <small>Gastado Actual</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-dark text-white">
                    <div class="card-body text-center">
                        <h4 class="${budgetVariance >= 0 ? 'text-success' : 'text-danger'} mb-1">${budgetVariance >= 0 ? '+' : ''}${formatCurrency(budgetVariance)}</h4>
                        <small>Variación Deal</small>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-12">
                <h6 class="text-gold mb-3">💰 Línea de Gastos de Reparaciones</h6>
                <div class="card bg-dark text-white">
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h5 class="text-gold mb-1">${formatCurrency(dealRepairBudget)}</h5>
                                    <small>Presupuesto Original (Deal)</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h5 class="text-warning mb-1">${formatCurrency(totalEstimated)}</h5>
                                    <small>Presupuesto Detallado (PM)</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h5 class="text-info mb-1">${formatCurrency(totalActual)}</h5>
                                    <small>Gasto Real Acumulado</small>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="text-center">
                                    <h5 class="${(dealRepairBudget - totalActual) >= 0 ? 'text-success' : 'text-danger'} mb-1">${formatCurrency(dealRepairBudget - totalActual)}</h5>
                                    <small>Restante del Deal</small>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12">
                                <div class="progress mb-2" style="height: 25px;">
                                    <div class="progress-bar bg-warning" style="width: ${Math.min((totalEstimated / dealRepairBudget) * 100, 100)}%">
                                        Presupuesto PM ${Math.round((totalEstimated / dealRepairBudget) * 100)}%
                                    </div>
                                    <div class="progress-bar bg-info" style="width: ${Math.min((totalActual / dealRepairBudget) * 100, 100)}%">
                                        Gastado ${Math.round((totalActual / dealRepairBudget) * 100)}%
                                    </div>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <small class="text-muted">
                                        <span class="badge ${budgetVariancePercent >= 0 ? 'bg-success' : 'bg-danger'}">
                                            Variación: ${budgetVariancePercent >= 0 ? '+' : ''}${budgetVariancePercent}%
                                        </span>
                                    </small>
                                    <small class="text-muted">
                                        Total Deal: ${formatCurrency(dealRepairBudget)} | Utilizado: ${Math.round((totalActual / dealRepairBudget) * 100)}%
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-md-6">
                <h6 class="text-gold mb-3">📊 Distribución por Categoría</h6>
                <div class="card bg-dark text-white">
                    <div class="card-body">
                        <div class="row text-center mb-3">
                            <div class="col-6">
                                <h5 class="text-warning">${formatCurrency(interiorEstimated)}</h5>
                                <small>Interior (${interiorItems.length} ítems)</small>
                            </div>
                            <div class="col-6">
                                <h5 class="text-info">${formatCurrency(exteriorEstimated)}</h5>
                                <small>Exterior (${exteriorItems.length} ítems)</small>
                            </div>
                        </div>
                        <div class="progress mb-2" style="height: 20px;">
                            <div class="progress-bar bg-warning" style="width: ${(interiorEstimated / totalEstimated * 100)}%">
                                Interior ${Math.round(interiorEstimated / totalEstimated * 100)}%
                            </div>
                            <div class="progress-bar bg-info" style="width: ${(exteriorEstimated / totalEstimated * 100)}%">
                                Exterior ${Math.round(exteriorEstimated / totalEstimated * 100)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <h6 class="text-gold mb-3">💰 Desglose de Costos</h6>
                <div class="card bg-dark text-white">
                    <div class="card-body">
                        <div class="row text-center">
                            <div class="col-3">
                                <h5 class="text-primary">${formatCurrency(totalMaterials)}</h5>
                                <small>Materiales</small>
                            </div>
                            <div class="col-3">
                                <h5 class="text-success">${formatCurrency(totalLabor)}</h5>
                                <small>Mano de Obra</small>
                            </div>
                            <div class="col-3">
                                <h5 class="text-secondary">${formatCurrency(totalOther)}</h5>
                                <small>Otros</small>
                            </div>
                            <div class="col-3">
                                <h5 class="text-warning">${formatCurrency(totalMarkup)}</h5>
                                <small>Margen</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mb-4">
            <div class="col-12">
                <h6 class="text-gold mb-3">🏗️ Presupuesto por Área</h6>
                <div class="table-responsive">
                    <table class="table table-dark table-sm">
                        <thead>
                            <tr>
                                <th>Área</th>
                                <th>Ítems</th>
                                <th>Presupuesto</th>
                                <th>Actual</th>
                                <th>Diferencia</th>
                                <th>% Completado</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(areaBudgets).map(([area, data]) => {
                                const difference = data.estimated - data.actual;
                                const percentComplete = data.estimated > 0 ? Math.round((data.actual / data.estimated) * 100) : 0;
                                const statusClass = percentComplete >= 100 ? 'text-success' : percentComplete >= 50 ? 'text-warning' : 'text-secondary';
                                
                                return `
                                    <tr>
                                        <td><strong>${area}</strong></td>
                                        <td class="text-center">${data.count}</td>
                                        <td class="text-gold">${formatCurrency(data.estimated)}</td>
                                        <td class="text-warning">${formatCurrency(data.actual)}</td>
                                        <td class="${difference >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(difference)}</td>
                                        <td class="text-center">
                                            <div class="progress" style="height: 15px; width: 100px;">
                                                <div class="progress-bar bg-${percentComplete >= 100 ? 'success' : percentComplete >= 50 ? 'warning' : 'secondary'}" 
                                                     style="width: ${percentComplete}%"></div>
                                            </div>
                                            <small>${percentComplete}%</small>
                                        </td>
                                        <td>
                                            <span class="badge ${statusClass}">
                                                ${percentComplete >= 100 ? '✅ Completado' : percentComplete >= 50 ? '🔄 En Progreso' : '📋 Planificado'}
                                            </span>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="border-top border-gold">
                                <th><strong>TOTAL</strong></th>
                                <th class="text-center"><strong>${items.length}</strong></th>
                                <th class="text-gold"><strong>${formatCurrency(totalEstimated)}</strong></th>
                                <th class="text-warning"><strong>${formatCurrency(totalActual)}</strong></th>
                                <th class="${(totalEstimated - totalActual) >= 0 ? 'text-success' : 'text-danger'}">
                                    <strong>${formatCurrency(totalEstimated - totalActual)}</strong>
                                </th>
                                <th class="text-center">
                                    <strong>${totalActual > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0}%</strong>
                                </th>
                                <th>
                                    <span class="badge ${totalActual >= totalEstimated ? 'text-success' : 'text-warning'}">
                                        ${totalActual >= totalEstimated ? '✅ Dentro de Presupuesto' : '⚠️ En Ejecución'}
                                    </span>
                                </th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-gold mb-3">📈 Análisis de Presupuesto</h6>
                <div class="card bg-dark text-white">
                    <div class="card-body">
                        <div class="row text-center">
                            <div class="col-6">
                                <h5 class="text-info mb-1">${formatCurrency(totalEstimated / items.length)}</h5>
                                <small>Promedio por Ítem</small>
                            </div>
                            <div class="col-6">
                                <h5 class="text-success mb-1">${formatCurrency(totalEstimated / 90)}</h5>
                                <small>Promedio Diario (90 días)</small>
                            </div>
                        </div>
                        <hr class="border-secondary">
                        <div class="row text-center">
                            <div class="col-6">
                                <h5 class="text-warning mb-1">${Math.round((totalMaterials / totalEstimated) * 100)}%</h5>
                                <small>% Materiales</small>
                            </div>
                            <div class="col-6">
                                <h5 class="text-primary mb-1">${Math.round((totalLabor / totalEstimated) * 100)}%</h5>
                                <small>% Mano de Obra</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <h6 class="text-gold mb-3">⚠️ Alertas de Presupuesto</h6>
                <div class="card bg-dark text-white">
                    <div class="card-body">
                        ${generateBudgetAlerts(items, dealRepairBudget, totalActual, totalEstimated)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    budget.innerHTML = html;
}

// Generate budget alerts
function generateBudgetAlerts(items, dealRepairBudget, totalActual, totalEstimated) {
    const alerts = [];
    
    // Alerta de sobrepresupuesto del Deal
    if (totalActual > dealRepairBudget) {
        alerts.push({
            type: 'danger',
            icon: '⚠️',
            message: `Presupuesto del Deal excedido en ${formatCurrency(totalActual - dealRepairBudget)}`
        });
    }
    
    // Alerta de presupuesto PM vs Deal
    if (totalEstimated > dealRepairBudget) {
        alerts.push({
            type: 'warning',
            icon: '📊',
            message: `Presupuesto PM supera Deal en ${formatCurrency(totalEstimated - dealRepairBudget)}`
        });
    }
    
    // Alerta de alto consumo del Deal
    const percentUsed = (totalActual / dealRepairBudget) * 100;
    if (percentUsed > 80 && percentUsed < 100) {
        alerts.push({
            type: 'warning',
            icon: '⚡',
            message: `Presupuesto del Deal casi agotado (${Math.round(percentUsed)}% utilizado)`
        });
    }
    
    // Alerta de ítems caros
    const expensiveItems = items.filter(item => item.totalEstimated > totalEstimated / items.length * 2);
    if (expensiveItems.length > 0) {
        alerts.push({
            type: 'info',
            icon: '💰',
            message: `${expensiveItems.length} ítems con presupuesto elevado`
        });
    }
    
    // Alerta de áreas sin progreso
    const areasWithoutProgress = items.filter(item => item.status === 'PLANNING').length;
    if (areasWithoutProgress > items.length * 0.5) {
        alerts.push({
            type: 'secondary',
            icon: '📋',
            message: `${areasWithoutProgress} ítems aún en planificación`
        });
    }
    
    // Alerta de buen control
    if (totalActual <= dealRepairBudget && percentUsed < 50 && items.length > 0) {
        alerts.push({
            type: 'success',
            icon: '✅',
            message: `Buen control del presupuesto del Deal (${Math.round(percentUsed)}% utilizado)`
        });
    }
    
    if (alerts.length === 0) {
        return `
            <div class="text-center text-success">
                <i class="bi bi-check-circle" style="font-size: 2rem;"></i>
                <p class="mt-2 mb-0">Presupuesto bajo control</p>
                <small>Todos los indicadores están dentro de los parámetros normales</small>
            </div>
        `;
    }
    
    return alerts.map(alert => `
        <div class="alert alert-${alert.type} alert-sm mb-2" style="padding: 8px 12px;">
            <div class="d-flex align-items-center">
                <span class="me-2">${alert.icon}</span>
                <small>${alert.message}</small>
            </div>
        </div>
    `).join('');
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
                        <label style="color: #d4af37;">Subcategorías Detalladas</label>
                        <div id="subcategory-options" style="max-height: 300px; overflow-y: auto; border: 1px solid #d4af37; border-radius: 5px; padding: 10px; background: #2c3440;">
                            <!-- Se llenará dinámicamente -->
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

// Toggle subcategory
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

// Update automatic totals
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

// Update work type
function updateWorkType(name, workType) {
    const subcategory = selectedSubcategories.find(sub => sub.name === name);
    if (subcategory) {
        subcategory.workType = workType;
    }
}

// Update subcategory cost
function updateSubcategoryCost(name, costType, value) {
    if (!selectedArea || !subcategoryDatabase[selectedArea]) return;
    
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

// Delete subcategory
function deleteSubcategory(name, event) {
    event.stopPropagation();
    
    if (confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) {
        delete subcategoryDatabase[selectedArea][name];
        updateSubcategories(selectedArea);
    }
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
    const other = parseFloat(document.getElementById('item-other').value) || 0;
    const markup = parseFloat(document.getElementById('item-markup').value) || 0;
    
    console.log('Form values - materials:', materials, 'labor:', labor, 'other:', other, 'markup:', markup);
    
    const subtotal = materials + labor + other;
    const markupAmount = subtotal * (markup / 100);
    const totalEstimated = subtotal + markupAmount;
    
    console.log('Calculated - subtotal:', subtotal, 'markupAmount:', markupAmount, 'totalEstimated:', totalEstimated);
    
    // Create description
    let description = document.getElementById('item-description').value;
    if (selectedSubcategories.length > 1 && (!description || description === '')) {
        description = selectedSubcategories.map(sub => sub.name).join(', ');
    } else if (!description || description === '') {
        description = 'Trabajo en ' + selectedArea;
    }
    
    // Get work type from first selected subcategory
    const workType = selectedSubcategories.length > 0 ? 
        (selectedSubcategories[0].workType || 'REPAIR') : 'REPAIR';
    
    // Create new item
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
        status: document.getElementById('item-status').value,
        notes: document.getElementById('item-notes').value || '',
        created: new Date().toISOString(),
        subcategories: [...selectedSubcategories] // Copy selected subcategories
    };
    
    console.log('New item to save:', newItem);
    
    // Add to project manager
    if (!currentProjectManager.projectData.items) {
        currentProjectManager.projectData.items = [];
    }
    
    currentProjectManager.projectData.items.push(newItem);
    currentProjectManager.projectData.lastUpdated = new Date().toISOString();
    
    console.log('Items after adding:', currentProjectManager.projectData.items.length);
    
    // Update budget
    updateBudget();
    
    // Save to localStorage
    try {
        localStorage.setItem(`pm_${currentProjectManager.dealId}`, JSON.stringify(currentProjectManager.projectData));
        console.log('Saved to localStorage successfully');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('Error al guardar el proyecto');
        return;
    }
    
    // Reload table
    renderModuleItems(category);
    
    // Update ALL sections automatically
    renderDashboard();
    renderTimeline();
    renderBudgetControl();
    
    // Close modal
    closeItemModal();
    
    // Clear variables
    selectedArea = '';
    selectedSubcategories = [];
    
    // Show notification
    showNotification('Ítem agregado exitosamente', 'success');
    
    console.log('Item saved successfully');
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

// Edit project item
function editProjectItem(itemId) {
    if (!currentProjectManager) {
        alert('Error: No hay un proyecto activo');
        return;
    }
    
    // Find the item to edit
    const item = currentProjectManager.projectData.items.find(i => i.id === itemId);
    if (!item) {
        alert('Ítem no encontrado');
        return;
    }
    
    console.log('Editing item:', item);
    
    // Set variables for the form
    selectedArea = item.area;
    selectedCategory = item.category;
    selectedSubcategories = item.subcategories || [];
    editingItemId = itemId; // Track which item we're editing
    
    // Create modal with item data
    const modal = document.createElement('div');
    modal.id = 'pm-item-edit-modal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
            <div style="background: #1a1f2e; color: white; padding: 30px; border-radius: 10px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto; border: 2px solid #d4af37;">
                <div style="background: #ffc107; color: black; padding: 15px; margin: -30px -30px 20px -30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h3 style="margin: 0; color: black;">✏️ Editar Ítem - ${item.category === 'INTERIOR' ? 'Interior' : 'Exterior'}</h3>
                    <button onclick="closeEditItemModal()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: black; font-size: 24px; cursor: pointer;">×</button>
                </div>
                
                <form id="pm-item-edit-form">
                    <div class="mb-3">
                        <label style="color: #d4af37;">Área/Subcategoría</label>
                        <select class="form-control" id="edit-item-area-search" onchange="selectEditArea(this.value)">
                            <option value="">Seleccionar...</option>
                            ${getSubcategoryOptions(item.category)}
                        </select>
                    </div>
                    
                    <div class="mb-3" id="edit-subcategory-row" style="display: none;">
                        <label style="color: #d4af37;">Subcategorías Detalladas</label>
                        <div id="edit-subcategory-options" style="max-height: 300px; overflow-y: auto; border: 1px solid #d4af37; border-radius: 5px; padding: 10px; background: #2c3440;">
                            <!-- Se llenará dinámicamente -->
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label style="color: #d4af37;">Descripción del Trabajo</label>
                        <textarea class="form-control" id="edit-item-description" rows="3" required placeholder="Describe el trabajo a realizar...">${item.description || ''}</textarea>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Cantidad</label>
                            <input type="number" class="form-control" id="edit-item-quantity" value="${item.quantity || 1}" min="1" required>
                        </div>
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Unidad</label>
                            <select class="form-control" id="edit-item-unit" required>
                                <option value="EACH" ${item.unit === 'EACH' ? 'selected' : ''}>Cada uno</option>
                                <option value="SQFT" ${item.unit === 'SQFT' ? 'selected' : ''}>Pie Cuadrado</option>
                                <option value="LINEAR_FT" ${item.unit === 'LINEAR_FT' ? 'selected' : ''}>Pie Lineal</option>
                                <option value="HOUR" ${item.unit === 'HOUR' ? 'selected' : ''}>Hora</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Prioridad</label>
                            <select class="form-control" id="edit-item-priority" required>
                                <option value="HIGH" ${item.priority === 'HIGH' ? 'selected' : ''}>Alta</option>
                                <option value="MEDIUM" ${item.priority === 'MEDIUM' ? 'selected' : ''}>Media</option>
                                <option value="LOW" ${item.priority === 'LOW' ? 'selected' : ''}>Baja</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Estado</label>
                            <select class="form-control" id="edit-item-status" required>
                                <option value="PLANNING" ${item.status === 'PLANNING' ? 'selected' : ''}>Planificación</option>
                                <option value="IN_PROGRESS" ${item.status === 'IN_PROGRESS' ? 'selected' : ''}>En Progreso</option>
                                <option value="COMPLETED" ${item.status === 'COMPLETED' ? 'selected' : ''}>Completado</option>
                                <option value="ON_HOLD" ${item.status === 'ON_HOLD' ? 'selected' : ''}>En Espera</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Materiales</label>
                            <input type="number" class="form-control" id="edit-item-materials" value="${item.materialsCost}" step="100">
                            <small class="text-muted">Suma automática de subcategorías</small>
                        </div>
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Mano de Obra</label>
                            <input type="number" class="form-control" id="edit-item-labor" value="${item.laborCost}" step="100">
                            <small class="text-muted">Suma automática de subcategorías</small>
                        </div>
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Otros Costos</label>
                            <input type="number" class="form-control" id="edit-item-other" value="${item.otherCosts || 0}" step="100">
                            <small class="text-muted">Permisos, impuestos, etc.</small>
                        </div>
                        <div class="col-md-3">
                            <label style="color: #d4af37;">Margen (%)</label>
                            <input type="number" class="form-control" id="edit-item-markup" value="${item.markup || 0}" step="5">
                            <small class="text-muted">% para ganancia del contratista</small>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label style="color: #d4af37;">Costo Real (Opcional)</label>
                        <input type="number" class="form-control" id="edit-item-actual" value="${item.totalActual || 0}" step="100" placeholder="Costo real del trabajo completado">
                        <small class="text-muted">Ingresa el costo real cuando el trabajo esté completado</small>
                    </div>
                    
                    <div class="mb-3">
                        <label style="color: #d4af37;">Notas</label>
                        <textarea class="form-control" id="edit-item-notes" rows="2" placeholder="Notas adicionales...">${item.notes || ''}</textarea>
                    </div>
                    
                    <div class="text-center">
                        <button type="button" class="btn btn-warning" onclick="updateProjectItem('${item.category}')">
                            <i class="bi bi-save me-2"></i>Actualizar Ítem
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="closeEditItemModal()">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize the form with the item's area
    setTimeout(() => {
        document.getElementById('edit-item-area-search').value = item.area;
        selectEditArea(item.area);
        
        // Pre-select the subcategories that were originally selected
        if (item.subcategories && item.subcategories.length > 0) {
            item.subcategories.forEach(sub => {
                const checkbox = document.getElementById(`edit-sub-${sub.name.replace(/[^a-zA-Z0-9]/g, '')}`);
                if (checkbox) {
                    checkbox.checked = true;
                    toggleEditSubcategory(sub.name, sub.materials, sub.labor, sub.unit, true);
                }
            });
        }
    }, 100);
}

// Select edit area
function selectEditArea(area) {
    selectedArea = area;
    updateEditSubcategories(area);
}

// Update edit subcategories
function updateEditSubcategories(area) {
    const subcategoryRow = document.getElementById('edit-subcategory-row');
    const subcategoryOptions = document.getElementById('edit-subcategory-options');
    
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
                            <input type="checkbox" class="form-check-input" id="edit-sub-${safeName}" onchange="toggleEditSubcategory('${name}', ${costs.materials}, ${costs.labor}, '${costs.unit}', this.checked)">
                            <span style="font-weight: normal;">${name}</span>
                        </div>
                        <div class="col-md-2">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text" style="font-size: 11px;">Mat:</span>
                                <input type="number" class="form-control form-control-sm" value="${costs.materials}" step="10" style="width: 70px;" onchange="updateEditSubcategoryCost('${name}', 'materials', this.value)">
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text" style="font-size: 11px;">MO:</span>
                                <input type="number" class="form-control form-control-sm" value="${costs.labor}" step="10" style="width: 70px;" onchange="updateEditSubcategoryCost('${name}', 'labor', this.value)">
                            </div>
                        </div>
                        <div class="col-md-3 text-end">
                            <small class="text-success">Total: <span id="edit-total-${safeName}">${formatCurrency(total)}</span></small>
                            <button type="button" class="btn btn-sm btn-outline-danger ms-2" onclick="deleteEditSubcategory('${name}', event)" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-md-12">
                            <div class="input-group input-group-sm">
                                <span class="input-group-text" style="font-size: 11px;">Tipo:</span>
                                <select class="form-control form-control-sm" id="edit-worktype-${safeName}" onchange="updateEditWorkType('${name}', this.value)">
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

// Toggle edit subcategory
function toggleEditSubcategory(name, materials, labor, unit, isChecked) {
    if (isChecked) {
        // Agregar a seleccionados
        selectedSubcategories.push({
            name: name,
            materials: materials,
            labor: labor,
            unit: unit,
            workType: document.getElementById(`edit-worktype-${name.replace(/[^a-zA-Z0-9]/g, '')}`)?.value || 'REPAIR'
        });
    } else {
        // Remover de seleccionados
        selectedSubcategories = selectedSubcategories.filter(sub => sub.name !== name);
    }
    
    // Actualizar sumas automáticas
    updateEditAutomaticTotals();
}

// Update edit automatic totals
function updateEditAutomaticTotals() {
    if (selectedSubcategories.length === 0) {
        document.getElementById('edit-item-materials').value = 0;
        document.getElementById('edit-item-labor').value = 0;
        return;
    }
    
    // Sumar materiales y mano de obra de todas las subcategorías seleccionadas
    const totalMaterials = selectedSubcategories.reduce((sum, sub) => sum + sub.materials, 0);
    const totalLabor = selectedSubcategories.reduce((sum, sub) => sum + sub.labor, 0);
    
    // Actualizar campos
    document.getElementById('edit-item-materials').value = totalMaterials;
    document.getElementById('edit-item-labor').value = totalLabor;
    
    // Actualizar unidad si hay una sola subcategoría seleccionada
    if (selectedSubcategories.length === 1) {
        document.getElementById('edit-item-unit').value = selectedSubcategories[0].unit;
    }
}

// Update edit work type
function updateEditWorkType(name, workType) {
    const subcategory = selectedSubcategories.find(sub => sub.name === name);
    if (subcategory) {
        subcategory.workType = workType;
    }
}

// Update edit subcategory cost
function updateEditSubcategoryCost(name, costType, value) {
    if (!selectedArea || !subcategoryDatabase[selectedArea]) return;
    
    const numValue = parseFloat(value) || 0;
    subcategoryDatabase[selectedArea][name][costType] = numValue;
    
    // Actualizar total en la subcategoría
    const costs = subcategoryDatabase[selectedArea][name];
    const total = costs.materials + costs.labor;
    const totalElement = document.getElementById(`edit-total-${name.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (totalElement) {
        totalElement.textContent = formatCurrency(total);
    }
    
    // Si esta subcategoría está seleccionada, actualizar las sumas automáticas
    const selectedSub = selectedSubcategories.find(sub => sub.name === name);
    if (selectedSub) {
        selectedSub[costType] = numValue;
        updateEditAutomaticTotals();
    }
}

// Delete edit subcategory
function deleteEditSubcategory(name, event) {
    event.stopPropagation();
    
    if (confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) {
        delete subcategoryDatabase[selectedArea][name];
        updateEditSubcategories(selectedArea);
    }
}

// Close edit modal
function closeEditItemModal() {
    const modal = document.getElementById('pm-item-edit-modal');
    if (modal) {
        modal.remove();
    }
    editingItemId = null;
    selectedArea = '';
    selectedSubcategories = [];
}

// Update project item
function updateProjectItem(category) {
    if (!editingItemId) {
        alert('Error: No hay ítem siendo editado');
        return;
    }
    
    // Get form values
    const materials = parseFloat(document.getElementById('edit-item-materials').value) || 0;
    const labor = parseFloat(document.getElementById('edit-item-labor').value) || 0;
    const other = parseFloat(document.getElementById('edit-item-other').value) || 0;
    const markup = parseFloat(document.getElementById('edit-item-markup').value) || 0;
    const actual = parseFloat(document.getElementById('edit-item-actual').value) || 0;
    
    console.log('Edit form values - materials:', materials, 'labor:', labor, 'other:', other, 'markup:', markup, 'actual:', actual);
    
    const subtotal = materials + labor + other;
    const markupAmount = subtotal * (markup / 100);
    const totalEstimated = subtotal + markupAmount;
    
    console.log('Edit calculated - subtotal:', subtotal, 'markupAmount:', markupAmount, 'totalEstimated:', totalEstimated);
    
    // Find and update the item
    const itemIndex = currentProjectManager.projectData.items.findIndex(item => item.id === editingItemId);
    if (itemIndex === -1) {
        alert('Error: Ítem no encontrado');
        return;
    }
    
    // Update item data
    const updatedItem = {
        ...currentProjectManager.projectData.items[itemIndex],
        area: selectedArea,
        description: document.getElementById('edit-item-description').value,
        workType: selectedSubcategories.length > 0 ? 
            (selectedSubcategories[0].workType || 'REPAIR') : 'REPAIR',
        priority: document.getElementById('edit-item-priority').value,
        quantity: parseInt(document.getElementById('edit-item-quantity').value) || 1,
        unit: document.getElementById('edit-item-unit').value || 'EACH',
        materialsCost: materials,
        laborCost: labor,
        otherCosts: other,
        markup: markup,
        totalEstimated: totalEstimated,
        totalActual: actual,
        status: document.getElementById('edit-item-status').value,
        notes: document.getElementById('edit-item-notes').value || '',
        lastUpdated: new Date().toISOString(),
        subcategories: [...selectedSubcategories]
    };
    
    // Replace the item
    currentProjectManager.projectData.items[itemIndex] = updatedItem;
    currentProjectManager.projectData.lastUpdated = new Date().toISOString();
    
    console.log('Updated item:', updatedItem);
    
    // Save to localStorage
    try {
        localStorage.setItem(`pm_${currentProjectManager.dealId}`, JSON.stringify(currentProjectManager.projectData));
        console.log('Updated item saved to localStorage successfully');
    } catch (error) {
        console.error('Error saving updated item to localStorage:', error);
        alert('Error al guardar el ítem actualizado');
        return;
    }
    
    // Update ALL sections automatically
    renderModuleItems(category);
    renderDashboard();
    renderTimeline();
    renderBudgetControl();
    
    // Close modal
    closeEditItemModal();
    
    // Clear variables
    selectedArea = '';
    selectedSubcategories = [];
    editingItemId = null;
    
    // Show notification
    showNotification('Ítem actualizado exitosamente', 'success');
    
    console.log('Item updated successfully');
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
        alert(t('projectNotFound'));
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

// Manage phase suppliers
function managePhaseSuppliers(area, category) {
    if (!currentProjectManager) {
        alert('Error: No hay un proyecto activo');
        return;
    }
    
    // Get existing suppliers for this phase
    const phaseKey = `${category}_${area}`;
    const existingSuppliers = currentProjectManager.projectData.phaseSuppliers && 
                            currentProjectManager.projectData.phaseSuppliers[phaseKey] ? 
                            currentProjectManager.projectData.phaseSuppliers[phaseKey] : [];
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'phase-suppliers-modal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
            <div style="background: #1a1f2e; color: white; padding: 30px; border-radius: 10px; max-width: 900px; width: 90%; max-height: 80vh; overflow-y: auto; border: 2px solid #17a2b8;">
                <div style="background: #17a2b8; color: white; padding: 15px; margin: -30px -30px 20px -30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h3 style="margin: 0; color: white;">
                        <i class="bi bi-people me-2"></i>Proveedores - ${area}
                    </h3>
                    <button onclick="closePhaseSuppliersModal()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
                </div>
                
                <div class="mb-3">
                    <label style="color: #17a2b8;">Tiempo Estimado para la Fase</label>
                    <div class="row">
                        <div class="col-md-4">
                            <input type="number" class="form-control" id="phase-duration" value="${getPhaseDuration(area, category)}" min="1" placeholder="Número">
                            <small class="text-muted">Número de tiempo</small>
                        </div>
                        <div class="col-md-4">
                            <select class="form-control" id="phase-duration-unit">
                                <option value="days" ${getPhaseDurationUnit(area, category) === 'days' ? 'selected' : ''}>Días</option>
                                <option value="weeks" ${getPhaseDurationUnit(area, category) === 'weeks' ? 'selected' : ''}>Semanas</option>
                                <option value="months" ${getPhaseDurationUnit(area, category) === 'months' ? 'selected' : ''}>Meses</option>
                            </select>
                            <small class="text-muted">Unidad de tiempo</small>
                        </div>
                        <div class="col-md-4">
                            <input type="text" class="form-control" id="phase-coordinator" value="${getPhaseCoordinator(area, category)}" placeholder="Coordinador de fase">
                            <small class="text-muted">Persona responsable de la fase</small>
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label style="color: #17a2b8;">Proveedores Asignados</label>
                    <div class="mb-2">
                        <div class="row">
                            <div class="col-md-8">
                                <select class="form-control" id="existing-supplier-select" onchange="selectExistingSupplier(this.value)">
                                    <option value="">Seleccionar proveedor existente...</option>
                                    ${getGlobalSuppliersHTML()}
                                </select>
                                <small class="text-muted">Busca y selecciona un proveedor guardado previamente</small>
                            </div>
                            <div class="col-md-4">
                                <button class="btn btn-sm btn-outline-info w-100" onclick="addNewSupplier()">
                                    <i class="bi bi-plus-circle me-1"></i>Nuevo Proveedor
                                </button>
                            </div>
                        </div>
                    </div>
                    <div id="suppliers-list">
                        ${existingSuppliers.map((supplier, index) => `
                            <div class="card bg-secondary mb-2" id="supplier-${index}">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-3">
                                            <input type="text" class="form-control form-control-sm" value="${supplier.name}" placeholder="Nombre del proveedor" id="supplier-name-${index}">
                                        </div>
                                        <div class="col-md-3">
                                            <input type="text" class="form-control form-control-sm" value="${supplier.type}" placeholder="Tipo de servicio" id="supplier-type-${index}">
                                        </div>
                                        <div class="col-md-2">
                                            <input type="text" class="form-control form-control-sm" value="${supplier.phone}" placeholder="Teléfono" id="supplier-phone-${index}">
                                        </div>
                                        <div class="col-md-2">
                                            <input type="text" class="form-control form-control-sm" value="${supplier.cost}" placeholder="Costo estimado" id="supplier-cost-${index}">
                                        </div>
                                        <div class="col-md-2">
                                            <button class="btn btn-sm btn-danger" onclick="removeSupplier(${index})">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-sm btn-outline-info mt-2" onclick="addSupplier()">
                        <i class="bi bi-plus-circle me-1"></i>Agregar Proveedor Manual
                    </button>
                </div>
                
                <div class="text-center">
                    <button class="btn btn-info" onclick="savePhaseSuppliers('${area}', '${category}')">
                        <i class="bi bi-save me-2"></i>Guardar Proveedores
                    </button>
                    <button class="btn btn-secondary" onclick="closePhaseSuppliersModal()">
                        Cancelar
                    </button>
                </div>
                
                <div class="mt-3 p-3" style="background: #2c3440; border-radius: 5px; border: 1px solid #17a2b8;">
                    <h6 class="text-info mb-3">
                        <i class="bi bi-info-circle me-2"></i>Resumen de la Fase - ${area}
                    </h6>
                    <div class="row text-center">
                        <div class="col-md-4">
                            <div class="card bg-dark">
                                <div class="card-body">
                                    <h5 class="text-warning mb-1" id="summary-duration">-</h5>
                                    <small>Tiempo Estimado</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-dark">
                                <div class="card-body">
                                    <h5 class="text-info mb-1" id="summary-suppliers">-</h5>
                                    <small>Proveedores</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-dark">
                                <div class="card-body">
                                    <h5 class="text-success mb-1" id="summary-cost">-</h5>
                                    <small>Costo Total</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Manage phase notes
function managePhaseNotes(area, category) {
    if (!currentProjectManager) {
        alert('Error: No hay un proyecto activo');
        return;
    }
    
    // Get existing notes for this phase
    const phaseKey = `${category}_${area}`;
    const existingNotes = currentProjectManager.projectData.phaseNotes && 
                        currentProjectManager.projectData.phaseNotes[phaseKey] ? 
                        currentProjectManager.projectData.phaseNotes[phaseKey] : [];
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'phase-notes-modal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
            <div style="background: #1a1f2e; color: white; padding: 30px; border-radius: 10px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto; border: 2px solid #ffc107;">
                <div style="background: #ffc107; color: black; padding: 15px; margin: -30px -30px 20px -30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h3 style="margin: 0; color: black;">
                        <i class="bi bi-sticky me-2"></i>Notas Importantes - ${area}
                    </h3>
                    <button onclick="closePhaseNotesModal()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: black; font-size: 24px; cursor: pointer;">×</button>
                </div>
                
                <div class="mb-3">
                    <label style="color: #ffc107;">Agregar Nueva Nota</label>
                    <div class="row">
                        <div class="col-md-8">
                            <textarea class="form-control" id="new-note-text" rows="3" placeholder="Escribe una nota importante para esta fase..."></textarea>
                        </div>
                        <div class="col-md-4">
                            <select class="form-control" id="new-note-priority">
                                <option value="HIGH">Alta Prioridad</option>
                                <option value="MEDIUM">Media Prioridad</option>
                                <option value="LOW">Baja Prioridad</option>
                            </select>
                            <button class="btn btn-warning btn-sm mt-2 w-100" onclick="addPhaseNote()">
                                <i class="bi bi-plus-circle me-1"></i>Agregar Nota
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label style="color: #ffc107;">Notas Existentes</label>
                    <div id="notes-list" style="max-height: 300px; overflow-y: auto;">
                        ${existingNotes.map((note, index) => `
                            <div class="card bg-secondary mb-2" id="note-${index}">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div class="flex-grow-1">
                                            <div class="d-flex align-items-center mb-2">
                                                <span class="badge ${note.priority === 'HIGH' ? 'bg-danger' : note.priority === 'MEDIUM' ? 'bg-warning' : 'bg-secondary'} me-2">
                                                    ${note.priority === 'HIGH' ? 'Alta' : note.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                                                </span>
                                                <small class="text-muted">${new Date(note.date).toLocaleString('es-ES')}</small>
                                            </div>
                                            <p class="mb-2">${note.text}</p>
                                        </div>
                                        <button class="btn btn-sm btn-outline-danger" onclick="removePhaseNote(${index})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        ${existingNotes.length === 0 ? '<p class="text-muted text-center">No hay notas agregadas aún</p>' : ''}
                    </div>
                </div>
                
                <div class="text-center">
                    <button class="btn btn-warning" onclick="savePhaseNotes('${area}', '${category}')">
                        <i class="bi bi-save me-2"></i>Guardar Notas
                    </button>
                    <button class="btn btn-secondary" onclick="closePhaseNotesModal()">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Helper functions for phase management
function getPhaseDuration(area, category) {
    const phaseKey = `${category}_${area}`;
    const duration = currentProjectManager.projectData.phaseDurations && 
           currentProjectManager.projectData.phaseDurations[phaseKey] ? 
           currentProjectManager.projectData.phaseDurations[phaseKey] : 7;
    
    // Convert to days if stored in different unit
    const unit = getPhaseDurationUnit(area, category);
    switch(unit) {
        case 'weeks': return duration * 7;
        case 'months': return duration * 30;
        default: return duration;
    }
}

function getPhaseDurationUnit(area, category) {
    const phaseKey = `${category}_${area}`;
    return currentProjectManager.projectData.phaseDurationUnits && 
           currentProjectManager.projectData.phaseDurationUnits[phaseKey] ? 
           currentProjectManager.projectData.phaseDurationUnits[phaseKey] : 'days';
}

function getPhaseDurationDisplay(area, category) {
    const phaseKey = `${category}_${area}`;
    const duration = currentProjectManager.projectData.phaseDurations && 
                   currentProjectManager.projectData.phaseDurations[phaseKey] ? 
                   currentProjectManager.projectData.phaseDurations[phaseKey] : 7;
    
    const unit = currentProjectManager.projectData.phaseDurationUnits && 
                currentProjectManager.projectData.phaseDurationUnits[phaseKey] ? 
                currentProjectManager.projectData.phaseDurationUnits[phaseKey] : 'days';
    
    const unitText = unit === 'weeks' ? 'semanas' : unit === 'months' ? 'meses' : 'días';
    return `${duration} ${unitText}`;
}

function getPhaseSuppliersCount(area, category) {
    const phaseKey = `${category}_${area}`;
    const suppliers = currentProjectManager.projectData.phaseSuppliers && 
                    currentProjectManager.projectData.phaseSuppliers[phaseKey] ? 
                    currentProjectManager.projectData.phaseSuppliers[phaseKey] : [];
    return suppliers.length;
}

function getPhaseTotalCost(area, category) {
    const phaseKey = `${category}_${area}`;
    const suppliers = currentProjectManager.projectData.phaseSuppliers && 
                    currentProjectManager.projectData.phaseSuppliers[phaseKey] ? 
                    currentProjectManager.projectData.phaseSuppliers[phaseKey] : [];
    
    const totalCost = suppliers.reduce((sum, supplier) => {
        const cost = parseFloat(supplier.cost.replace(/[^0-9.-]/g, '')) || 0;
        return sum + cost;
    }, 0);
    
    return formatCurrency(totalCost);
}

function getPhaseCoordinator(area, category) {
    const phaseKey = `${category}_${area}`;
    return currentProjectManager.projectData.phaseCoordinators && 
           currentProjectManager.projectData.phaseCoordinators[phaseKey] ? 
           currentProjectManager.projectData.phaseCoordinators[phaseKey] : '';
}

// Global suppliers management
function getGlobalSuppliers() {
    const globalSuppliers = localStorage.getItem('globalSuppliers');
    return globalSuppliers ? JSON.parse(globalSuppliers) : [];
}

function saveGlobalSuppliers(suppliers) {
    localStorage.setItem('globalSuppliers', JSON.stringify(suppliers));
}

function getGlobalSuppliersHTML() {
    const suppliers = getGlobalSuppliers();
    return suppliers.map(supplier => 
        `<option value="${supplier.id}">${supplier.name} - ${supplier.type}</option>`
    ).join('');
}

function selectExistingSupplier(supplierId) {
    if (!supplierId) return;
    
    const suppliers = getGlobalSuppliers();
    const supplier = suppliers.find(s => s.id === supplierId);
    
    if (supplier) {
        // Add to current phase suppliers list
        const suppliersList = document.getElementById('suppliers-list');
        const supplierCount = suppliersList.children.length;
        
        const newSupplier = document.createElement('div');
        newSupplier.className = 'card bg-secondary mb-2';
        newSupplier.id = `supplier-${supplierCount}`;
        newSupplier.innerHTML = `
            <div class="card-body">
                <div class="row">
                    <div class="col-md-3">
                        <input type="text" class="form-control form-control-sm" value="${supplier.name}" placeholder="Nombre del proveedor" id="supplier-name-${supplierCount}">
                    </div>
                    <div class="col-md-3">
                        <input type="text" class="form-control form-control-sm" value="${supplier.type}" placeholder="Tipo de servicio" id="supplier-type-${supplierCount}">
                    </div>
                    <div class="col-md-2">
                        <input type="text" class="form-control form-control-sm" value="${supplier.phone}" placeholder="Teléfono" id="supplier-phone-${supplierCount}">
                    </div>
                    <div class="col-md-2">
                        <input type="text" class="form-control form-control-sm" value="${supplier.cost || ''}" placeholder="Costo estimado" id="supplier-cost-${supplierCount}">
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-sm btn-danger" onclick="removeSupplier(${supplierCount})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        suppliersList.appendChild(newSupplier);
        
        // Clear the selection
        document.getElementById('existing-supplier-select').value = '';
        
        showNotification(`Proveedor "${supplier.name}" agregado a la fase`, 'success');
    }
}

// Suppliers management functions
function addNewSupplier() {
    const suppliers = getGlobalSuppliers();
    const supplierCount = suppliers.length;
    
    // Create modal for new supplier
    const modal = document.createElement('div');
    modal.id = 'new-supplier-modal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
            <div style="background: #1a1f2e; color: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 90%; border: 2px solid #17a2b8;">
                <div style="background: #17a2b8; color: white; padding: 15px; margin: -30px -30px 20px -30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h4 style="margin: 0; color: white;">
                        <i class="bi bi-person-plus me-2"></i>Agregar Nuevo Proveedor Global
                    </h4>
                    <button onclick="closeNewSupplierModal()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
                </div>
                
                <div class="mb-3">
                    <label style="color: #17a2b8;">Nombre del Proveedor</label>
                    <input type="text" class="form-control" id="new-supplier-name" placeholder="Ej: Constructora ABC">
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label style="color: #17a2b8;">Tipo de Servicio</label>
                        <input type="text" class="form-control" id="new-supplier-type" placeholder="Ej: Plomería, Electricidad">
                    </div>
                    <div class="col-md-6">
                        <label style="color: #17a2b8;">Teléfono</label>
                        <input type="text" class="form-control" id="new-supplier-phone" placeholder="Ej: 555-123-4567">
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label style="color: #17a2b8;">Email</label>
                        <input type="email" class="form-control" id="new-supplier-email" placeholder="Ej: contacto@proveedor.com">
                    </div>
                    <div class="col-md-6">
                        <label style="color: #17a2b8;">Costo Promedio</label>
                        <input type="text" class="form-control" id="new-supplier-cost" placeholder="Ej: $2,500">
                    </div>
                </div>
                
                <div class="mb-3">
                    <label style="color: #17a2b8;">Notas del Proveedor</label>
                    <textarea class="form-control" id="new-supplier-notes" rows="3" placeholder="Notas adicionales sobre este proveedor..."></textarea>
                </div>
                
                <div class="text-center">
                    <button class="btn btn-info" onclick="saveNewGlobalSupplier()">
                        <i class="bi bi-save me-2"></i>Guardar Proveedor Global
                    </button>
                    <button class="btn btn-secondary" onclick="closeNewSupplierModal()">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function saveNewGlobalSupplier() {
    const name = document.getElementById('new-supplier-name').value.trim();
    const type = document.getElementById('new-supplier-type').value.trim();
    const phone = document.getElementById('new-supplier-phone').value.trim();
    const email = document.getElementById('new-supplier-email').value.trim();
    const cost = document.getElementById('new-supplier-cost').value.trim();
    const notes = document.getElementById('new-supplier-notes').value.trim();
    
    if (!name || !type) {
        alert('Por favor completa al menos el nombre y tipo de servicio');
        return;
    }
    
    const suppliers = getGlobalSuppliers();
    const newSupplier = {
        id: Date.now().toString(),
        name: name,
        type: type,
        phone: phone,
        email: email,
        cost: cost,
        notes: notes,
        created: new Date().toISOString()
    };
    
    suppliers.push(newSupplier);
    saveGlobalSuppliers(suppliers);
    
    showNotification(`Proveedor "${name}" guardado globalmente`, 'success');
    closeNewSupplierModal();
    
    // Refresh the suppliers dropdown
    const dropdown = document.getElementById('existing-supplier-select');
    if (dropdown) {
        dropdown.innerHTML = '<option value="">Seleccionar proveedor existente...</option>' + getGlobalSuppliersHTML();
    }
}

function closeNewSupplierModal() {
    const modal = document.getElementById('new-supplier-modal');
    if (modal) {
        modal.remove();
    }
}

function addSupplier() {
    const suppliersList = document.getElementById('suppliers-list');
    const supplierCount = suppliersList.children.length;
    
    const newSupplier = document.createElement('div');
    newSupplier.className = 'card bg-secondary mb-2';
    newSupplier.id = `supplier-${supplierCount}`;
    newSupplier.innerHTML = `
        <div class="card-body">
            <div class="row">
                <div class="col-md-3">
                    <input type="text" class="form-control form-control-sm" placeholder="Nombre del proveedor" id="supplier-name-${supplierCount}">
                </div>
                <div class="col-md-3">
                    <input type="text" class="form-control form-control-sm" placeholder="Tipo de servicio" id="supplier-type-${supplierCount}">
                </div>
                <div class="col-md-2">
                    <input type="text" class="form-control form-control-sm" placeholder="Teléfono" id="supplier-phone-${supplierCount}">
                </div>
                <div class="col-md-2">
                    <input type="text" class="form-control form-control-sm" placeholder="Costo estimado" id="supplier-cost-${supplierCount}">
                </div>
                <div class="col-md-2">
                    <button class="btn btn-sm btn-danger" onclick="removeSupplier(${supplierCount})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    suppliersList.appendChild(newSupplier);
}

function removeSupplier(index) {
    const supplier = document.getElementById(`supplier-${index}`);
    if (supplier) {
        supplier.remove();
    }
}

function savePhaseSuppliers(area, category) {
    const phaseKey = `${category}_${area}`;
    const suppliers = [];
    
    // Collect all suppliers from form
    const suppliersList = document.getElementById('suppliers-list');
    Array.from(suppliersList.children).forEach((supplierElement, index) => {
        const supplierData = {
            name: document.getElementById(`supplier-name-${index}`).value,
            type: document.getElementById(`supplier-type-${index}`).value,
            phone: document.getElementById(`supplier-phone-${index}`).value,
            cost: document.getElementById(`supplier-cost-${index}`).value
        };
        
        // Add to global suppliers if not already there
        addToGlobalSuppliers(supplierData);
        
        suppliers.push(supplierData);
    });
    
    // Save to project data
    if (!currentProjectManager.projectData.phaseSuppliers) {
        currentProjectManager.projectData.phaseSuppliers = {};
    }
    currentProjectManager.projectData.phaseSuppliers[phaseKey] = suppliers;
    
    // Save duration and coordinator with unit
    if (!currentProjectManager.projectData.phaseDurations) {
        currentProjectManager.projectData.phaseDurations = {};
    }
    if (!currentProjectManager.projectData.phaseDurationUnits) {
        currentProjectManager.projectData.phaseDurationUnits = {};
    }
    
    const durationValue = parseInt(document.getElementById('phase-duration').value);
    const durationUnit = document.getElementById('phase-duration-unit').value;
    
    // Convert to days for storage
    let durationInDays = durationValue;
    switch(durationUnit) {
        case 'weeks': durationInDays = durationValue * 7; break;
        case 'months': durationInDays = durationValue * 30; break;
    }
    
    currentProjectManager.projectData.phaseDurations[phaseKey] = durationValue;
    currentProjectManager.projectData.phaseDurationUnits[phaseKey] = durationUnit;
    
    if (!currentProjectManager.projectData.phaseCoordinators) {
        currentProjectManager.projectData.phaseCoordinators = {};
    }
    currentProjectManager.projectData.phaseCoordinators[phaseKey] = document.getElementById('phase-coordinator').value;
    
    // Update summary in modal
    updatePhaseSummary(area, category, suppliers, durationValue, durationUnit);
    
    // Save to localStorage
    try {
        localStorage.setItem(`pm_${currentProjectManager.dealId}`, JSON.stringify(currentProjectManager.projectData));
        showNotification('Proveedores guardados exitosamente', 'success');
        closePhaseSuppliersModal();
        renderTimeline(); // Refresh timeline to show updates
    } catch (error) {
        console.error('Error saving suppliers:', error);
        alert('Error al guardar los proveedores');
    }
}

// Update phase summary in modal
function updatePhaseSummary(area, category, suppliers, durationValue, durationUnit) {
    // Update duration
    const durationElement = document.getElementById('summary-duration');
    if (durationElement) {
        const unitText = durationUnit === 'weeks' ? 'semanas' : durationUnit === 'months' ? 'meses' : 'días';
        durationElement.textContent = `${durationValue} ${unitText}`;
    }
    
    // Update suppliers count
    const suppliersElement = document.getElementById('summary-suppliers');
    if (suppliersElement) {
        suppliersElement.textContent = suppliers.length;
    }
    
    // Calculate total cost
    const totalCost = suppliers.reduce((sum, supplier) => {
        const cost = parseFloat(supplier.cost.replace(/[^0-9.-]/g, '')) || 0;
        return sum + cost;
    }, 0);
    
    // Update total cost
    const costElement = document.getElementById('summary-cost');
    if (costElement) {
        costElement.textContent = formatCurrency(totalCost);
    }
}

function addToGlobalSuppliers(supplierData) {
    const globalSuppliers = getGlobalSuppliers();
    
    // Check if supplier already exists (by name and type)
    const exists = globalSuppliers.find(s => 
        s.name.toLowerCase() === supplierData.name.toLowerCase() && 
        s.type.toLowerCase() === supplierData.type.toLowerCase()
    );
    
    if (!exists && supplierData.name && supplierData.type) {
        const newGlobalSupplier = {
            id: Date.now().toString(),
            name: supplierData.name,
            type: supplierData.type,
            phone: supplierData.phone,
            email: '',
            cost: supplierData.cost,
            notes: '',
            created: new Date().toISOString()
        };
        
        globalSuppliers.push(newGlobalSupplier);
        saveGlobalSuppliers(globalSuppliers);
    }
}

// Notes management functions
function addPhaseNote() {
    const notesList = document.getElementById('notes-list');
    const noteText = document.getElementById('new-note-text').value.trim();
    const notePriority = document.getElementById('new-note-priority').value;
    
    if (!noteText) {
        alert('Por favor escribe una nota');
        return;
    }
    
    const newNote = {
        text: noteText,
        priority: notePriority,
        date: new Date().toISOString()
    };
    
    // Add to existing notes array
    if (!currentProjectManager.tempNotes) {
        currentProjectManager.tempNotes = [];
    }
    currentProjectManager.tempNotes.push(newNote);
    
    // Clear form
    document.getElementById('new-note-text').value = '';
    
    // Refresh notes display
    refreshNotesDisplay();
}

function removePhaseNote(index) {
    if (currentProjectManager.tempNotes) {
        currentProjectManager.tempNotes.splice(index, 1);
        refreshNotesDisplay();
    }
}

function refreshNotesDisplay() {
    const notesList = document.getElementById('notes-list');
    const phaseKey = 'temp'; // Using temp key for editing
    
    const allNotes = currentProjectManager.tempNotes || [];
    
    notesList.innerHTML = allNotes.map((note, index) => `
        <div class="card bg-secondary mb-2" id="note-${index}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-2">
                            <span class="badge ${note.priority === 'HIGH' ? 'bg-danger' : note.priority === 'MEDIUM' ? 'bg-warning' : 'bg-secondary'} me-2">
                                ${note.priority === 'HIGH' ? 'Alta' : note.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                            </span>
                            <small class="text-muted">${new Date(note.date).toLocaleString('es-ES')}</small>
                        </div>
                        <p class="mb-2">${note.text}</p>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="removePhaseNote(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function savePhaseNotes(area, category) {
    const phaseKey = `${category}_${area}`;
    
    // Get existing notes and add new ones
    const existingNotes = currentProjectManager.projectData.phaseNotes && 
                        currentProjectManager.projectData.phaseNotes[phaseKey] ? 
                        currentProjectManager.projectData.phaseNotes[phaseKey] : [];
    
    const allNotes = [...existingNotes, ...(currentProjectManager.tempNotes || [])];
    
    // Save to project data
    if (!currentProjectManager.projectData.phaseNotes) {
        currentProjectManager.projectData.phaseNotes = {};
    }
    currentProjectManager.projectData.phaseNotes[phaseKey] = allNotes;
    
    // Clear temp notes
    currentProjectManager.tempNotes = [];
    
    // Save to localStorage
    try {
        localStorage.setItem(`pm_${currentProjectManager.dealId}`, JSON.stringify(currentProjectManager.projectData));
        showNotification('Notas guardadas exitosamente', 'success');
        closePhaseNotesModal();
        renderTimeline(); // Refresh timeline to show updates
    } catch (error) {
        console.error('Error saving notes:', error);
        alert('Error al guardar las notas');
    }
}

// Modal close functions
function closePhaseSuppliersModal() {
    const modal = document.getElementById('phase-suppliers-modal');
    if (modal) {
        modal.remove();
    }
}

function closePhaseNotesModal() {
    const modal = document.getElementById('phase-notes-modal');
    if (modal) {
        modal.remove();
    }
    currentProjectManager.tempNotes = [];
}

// Edit project start date
function editProjectStartDate() {
    if (!currentProjectManager) {
        alert('Error: No hay un proyecto activo');
        return;
    }
    
    const currentStartDate = currentProjectManager.projectData.timeline.startDate;
    const currentDate = new Date(currentStartDate);
    
    // Create modal for date editing
    const modal = document.createElement('div');
    modal.id = 'edit-start-date-modal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
            <div style="background: #1a1f2e; color: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; border: 2px solid #007bff;">
                <div style="background: #007bff; color: white; padding: 15px; margin: -30px -30px 20px -30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h4 style="margin: 0; color: white;">
                        <i class="bi bi-calendar-date me-2"></i>Editar Fecha de Inicio del Proyecto
                    </h4>
                    <button onclick="closeEditStartDateModal()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
                </div>
                
                <div class="mb-3">
                    <label style="color: #007bff;">Fecha de Inicio Actual</label>
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        <strong>Fecha actual:</strong> ${currentDate.toLocaleDateString('es-ES')}
                    </div>
                </div>
                
                <div class="mb-3">
                    <label style="color: #007bff;">Nueva Fecha de Inicio</label>
                    <input type="date" class="form-control" id="new-start-date" value="${currentDate.toISOString().split('T')[0]}">
                    <small class="text-muted">Selecciona la nueva fecha de inicio para el proyecto</small>
                </div>
                
                <div class="mb-3">
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        <strong>Atención:</strong> Al cambiar la fecha de inicio, todas las fechas del cronograma se recalcularán automáticamente.
                    </div>
                </div>
                
                <div class="text-center">
                    <button class="btn btn-primary" onclick="saveProjectStartDate()">
                        <i class="bi bi-save me-2"></i>Guardar Nueva Fecha
                    </button>
                    <button class="btn btn-secondary" onclick="closeEditStartDateModal()">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function saveProjectStartDate() {
    const newDateInput = document.getElementById('new-start-date');
    const newStartDate = new Date(newDateInput.value + 'T00:00:00');
    
    if (!newStartDate || isNaN(newStartDate.getTime())) {
        alert('Por favor selecciona una fecha válida');
        return;
    }
    
    // Update project data
    currentProjectManager.projectData.timeline.startDate = newStartDate.toISOString();
    currentProjectManager.projectData.lastUpdated = new Date().toISOString();
    
    // Save to localStorage
    try {
        localStorage.setItem(`pm_${currentProjectManager.dealId}`, JSON.stringify(currentProjectManager.projectData));
        showNotification('Fecha de inicio actualizada exitosamente', 'success');
        closeEditStartDateModal();
        renderTimeline(); // Refresh timeline to show new dates
    } catch (error) {
        console.error('Error saving start date:', error);
        alert('Error al guardar la fecha de inicio');
    }
}

function closeEditStartDateModal() {
    const modal = document.getElementById('edit-start-date-modal');
    if (modal) {
        modal.remove();
    }
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
