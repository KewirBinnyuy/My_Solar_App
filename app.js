// Solar System Sizer PWA - Main Application Logic

class SolarSystemSizer {
    constructor() {
        // App state
        this.state = {
            appliances: [],
            projects: [],
            currentStep: 1,
            systemParams: {
                voltage: 24,
                autonomyDays: 5,
                depthOfDischarge: 0.7,
                batteryType: 'lifepo4',
                peakSunHours: 4.5,
                panelType: 'mono',
                panelWattage: 400,
                deratingFactor: 0.85,
                electricityRate: 0.15
            },
            results: {
                dailyEnergy: 0,
                batteryAh: 0,
                pvPower: 0,
                inverterSize: 0,
                controllerSize: 0,
                totalCost: 0
            }
        };

        // Initialize
        this.init();
    }

    init() {
        // DOM Elements
        this.elements = {
            // Steps
            steps: document.querySelectorAll('.step'),
            progressSteps: document.querySelectorAll('.progress-step'),
            
            // Step 1: Load Calculator
            applianceTableBody: document.getElementById('applianceTableBody'),
            totalEnergy: document.getElementById('totalEnergy'),
            dcLoads: document.getElementById('dcLoads'),
            acLoads: document.getElementById('acLoads'),
            totalEnergyDisplay: document.getElementById('totalEnergyDisplay'),
            addCustomAppliance: document.getElementById('addCustomAppliance'),
            quickButtons: document.querySelectorAll('.btn-chip'),
            
            // Step 2: Battery
            systemVoltage: document.getElementById('systemVoltage'),
            autonomyDays: document.getElementById('autonomyDays'),
            depthOfDischarge: document.getElementById('depthOfDischarge'),
            dodValue: document.getElementById('dodValue'),
            batteryType: document.getElementById('batteryType'),
            dailyAh: document.getElementById('dailyAh'),
            autonomyAh: document.getElementById('autonomyAh'),
            dodAh: document.getElementById('dodAh'),
            minBattery: document.getElementById('minBattery'),
            recBattery: document.getElementById('recBattery'),
            
            // Step 3: Solar
            peakSunHours: document.getElementById('peakSunHours'),
            locationSelect: document.getElementById('locationSelect'),
            useGPS: document.getElementById('useGPS'),
            panelType: document.getElementById('panelType'),
            panelWattage: document.getElementById('panelWattage'),
            deratingFactor: document.getElementById('deratingFactor'),
            deratingValue: document.getElementById('deratingValue'),
            dailyPVEnergy: document.getElementById('dailyPVEnergy'),
            arrayPower: document.getElementById('arrayPower'),
            arrayPowerAdj: document.getElementById('arrayPowerAdj'),
            panelCount: document.getElementById('panelCount'),
            arrayConfig: document.getElementById('arrayConfig'),
            totalArrayPower: document.getElementById('totalArrayPower'),
            
            // Step 4: Results
            summaryEnergy: document.getElementById('summaryEnergy'),
            summaryBattery: document.getElementById('summaryBattery'),
            summaryPV: document.getElementById('summaryPV'),
            summaryCost: document.getElementById('summaryCost'),
            detailPVPower: document.getElementById('detailPVPower'),
            detailPanelCount: document.getElementById('detailPanelCount'),
            detailPanelWattage: document.getElementById('detailPanelWattage'),
            detailArrayConfig: document.getElementById('detailArrayConfig'),
            detailDailyProd: document.getElementById('detailDailyProd'),
            detailBatteryAh: document.getElementById('detailBatteryAh'),
            detailVoltage: document.getElementById('detailVoltage'),
            detailBatteryType: document.getElementById('detailBatteryType'),
            detailAutonomy: document.getElementById('detailAutonomy'),
            detailDoD: document.getElementById('detailDoD'),
            detailInverterSize: document.getElementById('detailInverterSize'),
            detailInverterSurge: document.getElementById('detailInverterSurge'),
            detailControllerCurrent: document.getElementById('detailControllerCurrent'),
            detailControllerVoltage: document.getElementById('detailControllerVoltage'),
            electricityRate: document.getElementById('electricityRate'),
            monthlySavings: document.getElementById('monthlySavings'),
            annualSavings: document.getElementById('annualSavings'),
            paybackPeriod: document.getElementById('paybackPeriod'),
            lifetimeSavings: document.getElementById('lifetimeSavings'),
            costPanelsQty: document.getElementById('costPanelsQty'),
            costPanelUnit: document.getElementById('costPanelUnit'),
            costPanelsTotal: document.getElementById('costPanelsTotal'),
            costBatteryQty: document.getElementById('costBatteryQty'),
            costBatteryUnit: document.getElementById('costBatteryUnit'),
            costBatteryTotal: document.getElementById('costBatteryTotal'),
            costInverterUnit: document.getElementById('costInverterUnit'),
            costInverterTotal: document.getElementById('costInverterTotal'),
            costControllerUnit: document.getElementById('costControllerUnit'),
            costControllerTotal: document.getElementById('costControllerTotal'),
            costMounting: document.getElementById('costMounting'),
            costSystemTotal: document.getElementById('costSystemTotal'),
            
            // Navigation buttons
            nextToStep2: document.getElementById('nextToStep2'),
            nextToStep3: document.getElementById('nextToStep3'),
            nextToStep4: document.getElementById('nextToStep4'),
            backToStep1: document.getElementById('backToStep1'),
            backToStep2: document.getElementById('backToStep2'),
            backToStep3: document.getElementById('backToStep3'),
            
            // Other actions
            restartDesign: document.getElementById('restartDesign'),
            exportDesign: document.getElementById('exportDesign'),
            saveProject: document.getElementById('saveProject'),
            loadProject: document.getElementById('loadProject'),
            exportPDF: document.getElementById('exportPDF'),
            themeToggle: document.getElementById('themeToggle'),
            
            // Status indicators
            connectionStatus: document.getElementById('connectionStatus'),
            storageStatus: document.getElementById('storageStatus')
        };

        // Initialize event listeners
        this.bindEvents();
        
        // Load saved data
        this.loadFromStorage();
        
        // Set initial state
        this.updateStep(1);
        
        // Calculate initial values
        this.calculateAll();
        
        // Update network status
        this.updateNetworkStatus();
        
        // Set theme
        this.initTheme();
    }

    bindEvents() {
        // Navigation
        this.elements.nextToStep2.addEventListener('click', () => this.nextStep());
        this.elements.nextToStep3.addEventListener('click', () => this.nextStep());
        this.elements.nextToStep4.addEventListener('click', () => this.nextStep());
        
        this.elements.backToStep1.addEventListener('click', () => this.prevStep());
        this.elements.backToStep2.addEventListener('click', () => this.prevStep());
        this.elements.backToStep3.addEventListener('click', () => this.prevStep());

        // Progress steps click
        this.elements.progressSteps.forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNum = parseInt(e.target.dataset.step);
                this.updateStep(stepNum);
            });
        });

        // Appliance management
        this.elements.addCustomAppliance.addEventListener('click', () => this.addAppliance());
        this.elements.quickButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const appliance = JSON.parse(e.target.dataset.appliance);
                this.addAppliance(appliance.name, appliance.power, appliance.type, 1, appliance.hours);
            });
        });

        // System parameter changes
        this.elements.systemVoltage.addEventListener('change', (e) => {
            this.state.systemParams.voltage = parseInt(e.target.value);
            this.calculateAll();
        });

        this.elements.autonomyDays.addEventListener('change', (e) => {
            this.state.systemParams.autonomyDays = parseInt(e.target.value);
            this.calculateAll();
        });

        this.elements.depthOfDischarge.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.state.systemParams.depthOfDischarge = value / 100;
            this.elements.dodValue.textContent = `${value}%`;
            this.calculateAll();
        });

        this.elements.batteryType.addEventListener('change', (e) => {
            this.state.systemParams.batteryType = e.target.value;
            this.calculateAll();
        });

        this.elements.peakSunHours.addEventListener('change', (e) => {
            this.state.systemParams.peakSunHours = parseFloat(e.target.value);
            this.calculateAll();
        });

        this.elements.locationSelect.addEventListener('change', (e) => {
            const pshMap = {
                'tropical': 5.5,
                'subtropical': 5.0,
                'temperate': 4.0,
                'northern': 3.0
            };
            if (pshMap[e.target.value]) {
                this.state.systemParams.peakSunHours = pshMap[e.target.value];
                this.elements.peakSunHours.value = pshMap[e.target.value];
                this.calculateAll();
            }
        });

        this.elements.useGPS.addEventListener('click', () => this.getLocationFromGPS());

        this.elements.panelType.addEventListener('change', (e) => {
            this.state.systemParams.panelType = e.target.value;
            this.calculateAll();
        });

        this.elements.panelWattage.addEventListener('change', (e) => {
            this.state.systemParams.panelWattage = parseInt(e.target.value);
            this.calculateAll();
        });

        this.elements.deratingFactor.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.state.systemParams.deratingFactor = value / 100;
            this.elements.deratingValue.textContent = `${value}%`;
            this.calculateAll();
        });

        this.elements.electricityRate.addEventListener('change', (e) => {
            this.state.systemParams.electricityRate = parseFloat(e.target.value);
            this.calculateAll();
        });

        // Actions
        this.elements.restartDesign.addEventListener('click', () => this.resetDesign());
        this.elements.exportDesign.addEventListener('click', () => this.exportReport());
        this.elements.saveProject.addEventListener('click', () => this.saveProject());
        this.elements.loadProject.addEventListener('click', () => this.showProjects());
        this.elements.exportPDF.addEventListener('click', () => this.exportPDF());
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Network status
        window.addEventListener('online', () => this.updateNetworkStatus());
        window.addEventListener('offline', () => this.updateNetworkStatus());
    }

    // Step Navigation
    updateStep(stepNumber) {
        // Update current step
        this.state.currentStep = stepNumber;
        
        // Update UI
        this.elements.steps.forEach(step => step.classList.remove('active'));
        this.elements.progressSteps.forEach(step => step.classList.remove('active'));
        
        document.getElementById(`step${stepNumber}`).classList.add('active');
        this.elements.progressSteps[stepNumber - 1].classList.add('active');
        
        // Recalculate if needed
        if (stepNumber === 4) {
            this.calculateAll();
        }
    }

    nextStep() {
        if (this.state.currentStep < 4) {
            this.updateStep(this.state.currentStep + 1);
        }
    }

    prevStep() {
        if (this.state.currentStep > 1) {
            this.updateStep(this.state.currentStep - 1);
        }
    }

    // Appliance Management
    addAppliance(name = '', power = 0, type = 'AC', quantity = 1, hours = 0) {
        if (!name) {
            name = prompt('Enter appliance name:', 'New Appliance');
            if (!name) return;
            
            power = parseFloat(prompt('Enter power in watts:', '100')) || 0;
            type = prompt('Enter type (AC or DC):', 'AC').toUpperCase();
            if (!['AC', 'DC'].includes(type)) type = 'AC';
            quantity = parseInt(prompt('Enter quantity:', '1')) || 1;
            hours = parseFloat(prompt('Enter hours of use per day:', '4')) || 0;
        }
        
        this.state.appliances.push({
            id: Date.now(),
            name,
            power,
            type,
            quantity,
            hours
        });
        
        this.updateApplianceTable();
        this.calculateAll();
    }

    removeAppliance(id) {
        this.state.appliances = this.state.appliances.filter(app => app.id !== id);
        this.updateApplianceTable();
        this.calculateAll();
    }

    updateApplianceTable() {
        const tbody = this.elements.applianceTableBody;
        tbody.innerHTML = '';
        
        if (this.state.appliances.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #666;">
                        No appliances added. Click "Add Custom Appliance" or use quick buttons above.
                    </td>
                </tr>
            `;
            return;
        }
        
        this.state.appliances.forEach(appliance => {
            const dailyEnergy = appliance.power * appliance.quantity * appliance.hours;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appliance.name}</td>
                <td><span class="badge ${appliance.type === 'AC' ? 'warning' : 'success'}">${appliance.type}</span></td>
                <td>${appliance.power} W</td>
                <td>
                    <input type="number" value="${appliance.quantity}" min="1" 
                           data-id="${appliance.id}" data-field="quantity" 
                           style="width: 60px; padding: 4px;">
                </td>
                <td>
                    <input type="number" value="${appliance.hours}" min="0" step="0.5" 
                           data-id="${appliance.id}" data-field="hours" 
                           style="width: 80px; padding: 4px;">
                </td>
                <td>${dailyEnergy.toFixed(0)} Wh</td>
                <td>
                    <button class="btn-small delete-appliance" data-id="${appliance.id}">
                        <span class="material-icons">delete</span>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Add event listeners to inputs and delete buttons
        tbody.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                const field = e.target.dataset.field;
                const value = parseFloat(e.target.value);
                
                const appliance = this.state.appliances.find(app => app.id === id);
                if (appliance) {
                    appliance[field] = value;
                    this.calculateAll();
                }
            });
        });
        
        tbody.querySelectorAll('.delete-appliance').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('button').dataset.id);
                this.removeAppliance(id);
            });
        });
    }

    // Calculations
    calculateAll() {
        this.calculateEnergy();
        this.calculateBattery();
        this.calculateSolar();
        this.calculateInverter();
        this.calculateController();
        this.calculateCosts();
        this.updateResultsUI();
    }

    calculateEnergy() {
        let totalEnergy = 0;
        let dcEnergy = 0;
        let acEnergy = 0;
        
        this.state.appliances.forEach(app => {
            const energy = app.power * app.quantity * app.hours;
            totalEnergy += energy;
            
            if (app.type === 'DC') {
                dcEnergy += energy;
            } else {
                acEnergy += energy;
            }
        });
        
        this.state.results.dailyEnergy = totalEnergy;
        
        // Update UI
        this.elements.totalEnergy.textContent = `${totalEnergy.toFixed(0)} Wh`;
        this.elements.dcLoads.textContent = `${dcEnergy.toFixed(0)} Wh`;
        this.elements.acLoads.textContent = `${acEnergy.toFixed(0)} Wh`;
        this.elements.totalEnergyDisplay.textContent = `${totalEnergy.toFixed(0)} Wh`;
        
        return totalEnergy;
    }

    calculateBattery() {
        const dailyEnergy = this.state.results.dailyEnergy;
        const voltage = this.state.systemParams.voltage;
        const autonomyDays = this.state.systemParams.autonomyDays;
        const dod = this.state.systemParams.depthOfDischarge;
        
        // Daily Ah required
        const dailyAh = dailyEnergy / voltage;
        
        // For autonomy days
        const autonomyAh = dailyAh * autonomyDays;
        
        // Adjust for DoD
        const dodAh = autonomyAh / dod;
        
        // Minimum battery (rounded up to nearest 50Ah)
        const minBattery = Math.ceil(dodAh / 50) * 50;
        
        // Recommended battery (10% extra)
        const recBattery = Math.ceil(minBattery * 1.1 / 50) * 50;
        
        this.state.results.batteryAh = recBattery;
        
        // Update UI
        this.elements.dailyAh.textContent = `${dailyAh.toFixed(1)} Ah`;
        this.elements.autonomyAh.textContent = `${autonomyAh.toFixed(1)} Ah`;
        this.elements.dodAh.textContent = `${dodAh.toFixed(1)} Ah`;
        this.elements.minBattery.textContent = `${minBattery.toFixed(0)} Ah`;
        this.elements.recBattery.textContent = `${recBattery.toFixed(0)} Ah`;
        
        // Update parameter displays
        this.elements.autonomyDaysValue.textContent = autonomyDays;
        this.elements.dodPercent.textContent = Math.round(dod * 100);
        
        return recBattery;
    }

    calculateSolar() {
        const batteryAh = this.state.results.batteryAh;
        const voltage = this.state.systemParams.voltage;
        const psh = this.state.systemParams.peakSunHours;
        const derating = this.state.systemParams.deratingFactor;
        const panelWattage = this.state.systemParams.panelWattage;
        
        // Account for battery efficiency (90%)
        const pvAh = batteryAh / 0.9;
        
        // Daily PV energy required
        const dailyPVEnergy = pvAh * voltage;
        
        // Required array power
        const arrayPower = dailyPVEnergy / psh;
        
        // Adjust for system losses
        const arrayPowerAdj = arrayPower / derating;
        
        // Number of panels
        const panelCount = Math.ceil(arrayPowerAdj / panelWattage);
        
        // Array configuration
        const panelsPerString = Math.ceil(voltage / (panelWattage === 300 ? 32 : 
                                                     panelWattage === 400 ? 40 : 
                                                     panelWattage === 550 ? 49 : 50));
        const strings = Math.ceil(panelCount / panelsPerString);
        const totalPanels = panelsPerString * strings;
        const totalArrayPower = totalPanels * panelWattage;
        
        this.state.results.pvPower = totalArrayPower;
        this.state.results.arrayConfig = `${panelsPerString}S × ${strings}P`;
        
        // Update UI
        this.elements.dailyPVEnergy.textContent = `${dailyPVEnergy.toFixed(0)} Wh`;
        this.elements.arrayPower.textContent = `${arrayPower.toFixed(0)} W`;
        this.elements.arrayPowerAdj.textContent = `${arrayPowerAdj.toFixed(0)} W`;
        this.elements.panelCount.textContent = `${panelCount}`;
        this.elements.arrayConfig.textContent = `${panelsPerString}S × ${strings}P`;
        this.elements.totalArrayPower.textContent = `${totalArrayPower.toFixed(0)} W`;
        
        this.elements.pshValue.textContent = psh;
        this.elements.deratingPercent.textContent = Math.round(derating * 100);
        this.elements.panelWattageValue.textContent = panelWattage;
        
        return totalArrayPower;
    }

    calculateInverter() {
        // Find max AC load
        let maxAcLoad = 0;
        let totalAcLoad = 0;
        
        this.state.appliances.forEach(app => {
            if (app.type === 'AC') {
                const load = app.power * app.quantity;
                totalAcLoad += load;
                if (load > maxAcLoad) maxAcLoad = load;
            }
        });
        
        // Inverter size (25% oversize for safety)
        const inverterSize = Math.ceil(totalAcLoad * 1.25 / 100) * 100;
        const surgeSize = inverterSize * 2.5;
        
        this.state.results.inverterSize = inverterSize;
        
        return inverterSize;
    }

    calculateController() {
        const pvPower = this.state.results.pvPower;
        const voltage = this.state.systemParams.voltage;
        
        // Controller current (add 25% safety margin)
        const controllerCurrent = Math.ceil((pvPower / voltage) * 1.25 / 10) * 10;
        
        // Controller voltage
        const panelVoc = this.state.systemParams.panelWattage === 300 ? 38 :
                        this.state.systemParams.panelWattage === 400 ? 48 :
                        this.state.systemParams.panelWattage === 550 ? 57 : 60;
        const controllerVoltage = Math.ceil(panelVoc * 1.2);
        
        this.state.results.controllerSize = controllerCurrent;
        
        return controllerCurrent;
    }

    calculateCosts() {
        const pvPower = this.state.results.pvPower;
        const batteryAh = this.state.results.batteryAh;
        const voltage = this.state.systemParams.voltage;
        const inverterSize = this.state.results.inverterSize;
        const controllerSize = this.state.results.controllerSize;
        const panelWattage = this.state.systemParams.panelWattage;
        const batteryType = this.state.systemParams.batteryType;
        const electricityRate = this.state.systemParams.electricityRate;
        
        // Panel cost ($0.50 per watt)
        const panelCostPerW = 0.50;
        const panelCount = Math.ceil(pvPower / panelWattage);
        const panelCost = pvPower * panelCostPerW;
        
        // Battery cost
        const batteryKwh = (batteryAh * voltage) / 1000;
        const batteryCostPerKwh = batteryType === 'lifepo4' ? 300 :
                                 batteryType === 'lithium' ? 250 : 100;
        const batteryCost = batteryKwh * batteryCostPerKwh;
        
        // Inverter cost ($0.30 per watt)
        const inverterCost = inverterSize * 0.30;
        
        // Controller cost ($5 per amp)
        const controllerCost = controllerSize * 5;
        
        // Mounting and wiring (20% of hardware)
        const hardwareCost = panelCost + batteryCost + inverterCost + controllerCost;
        const mountingCost = hardwareCost * 0.2;
        
        // Total cost
        const totalCost = hardwareCost + mountingCost;
        
        // ROI calculations
        const dailyKwh = this.state.results.dailyEnergy / 1000;
        const monthlySavings = dailyKwh * 30 * electricityRate;
        const annualSavings = monthlySavings * 12;
        const paybackYears = totalCost / annualSavings;
        const lifetimeSavings = annualSavings * 25 - totalCost;
        
        this.state.results.totalCost = totalCost;
        
        // Update UI
        this.elements.costPanelsQty.textContent = `${panelCount}`;
        this.elements.costPanelUnit.textContent = panelCostPerW.toFixed(2);
        this.elements.costPanelsTotal.textContent = `$${panelCost.toFixed(0)}`;
        
        this.elements.costBatteryQty.textContent = `${batteryKwh.toFixed(1)} kWh`;
        this.elements.costBatteryUnit.textContent = batteryCostPerKwh;
        this.elements.costBatteryTotal.textContent = `$${batteryCost.toFixed(0)}`;
        
        this.elements.costInverterUnit.textContent = '0.30';
        this.elements.costInverterTotal.textContent = `$${inverterCost.toFixed(0)}`;
        
        this.elements.costControllerUnit.textContent = '5';
        this.elements.costControllerTotal.textContent = `$${controllerCost.toFixed(0)}`;
        
        this.elements.costMounting.textContent = `$${mountingCost.toFixed(0)}`;
        this.elements.costSystemTotal.textContent = `$${totalCost.toFixed(0)}`;
        
        this.elements.monthlySavings.textContent = `$${monthlySavings.toFixed(2)}`;
        this.elements.annualSavings.textContent = `$${annualSavings.toFixed(0)}`;
        this.elements.paybackPeriod.textContent = `${paybackYears.toFixed(1)} years`;
        this.elements.lifetimeSavings.textContent = `$${lifetimeSavings.toFixed(0)}`;
        
        return totalCost;
    }

    updateResultsUI() {
        // Summary
        this.elements.summaryEnergy.textContent = `${this.state.results.dailyEnergy.toFixed(0)} Wh`;
        this.elements.summaryBattery.textContent = `${this.state.results.batteryAh.toFixed(0)} Ah`;
        this.elements.summaryPV.textContent = `${this.state.results.pvPower.toFixed(0)} W`;
        this.elements.summaryCost.textContent = `$${this.state.results.totalCost.toFixed(0)}`;
        
        // Details
        this.elements.detailPVPower.textContent = `${this.state.results.pvPower.toFixed(0)} W`;
        this.elements.detailPanelCount.textContent = `${Math.ceil(this.state.results.pvPower / this.state.systemParams.panelWattage)}`;
        this.elements.detailPanelWattage.textContent = `${this.state.systemParams.panelWattage}W`;
        this.elements.detailArrayConfig.textContent = this.state.results.arrayConfig;
        this.elements.detailDailyProd.textContent = `${(this.state.results.pvPower * this.state.systemParams.peakSunHours * 0.77).toFixed(0)} Wh`;
        
        this.elements.detailBatteryAh.textContent = `${this.state.results.batteryAh.toFixed(0)} Ah`;
        this.elements.detailVoltage.textContent = `${this.state.systemParams.voltage}V`;
        this.elements.detailBatteryType.textContent = this.state.systemParams.batteryType === 'lifepo4' ? 'LiFePO4' :
                                                     this.state.systemParams.batteryType === 'lithium' ? 'Lithium-ion' : 'Lead-Acid';
        this.elements.detailAutonomy.textContent = this.state.systemParams.autonomyDays;
        this.elements.detailDoD.textContent = `${(this.state.systemParams.depthOfDischarge * 100).toFixed(0)}%`;
        
        this.elements.detailInverterSize.textContent = `${this.state.results.inverterSize.toFixed(0)} VA`;
        this.elements.detailInverterSurge.textContent = `${(this.state.results.inverterSize * 2.5).toFixed(0)} VA`;
        
        this.elements.detailControllerCurrent.textContent = `${this.state.results.controllerSize.toFixed(0)} A`;
        this.elements.detailControllerVoltage.textContent = `${Math.ceil(this.state.systemParams.panelWattage === 300 ? 38 :
                                                                       this.state.systemParams.panelWattage === 400 ? 48 :
                                                                       this.state.systemParams.panelWattage === 550 ? 57 : 60) * 1.2} V`;
    }

    // Location Services
    getLocationFromGPS() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                this.estimatePSHFromCoordinates(lat, lng);
            },
            (error) => {
                alert('Unable to retrieve location. Please enable location services.');
                console.error('Geolocation error:', error);
            }
        );
    }

    estimatePSHFromCoordinates(lat, lng) {
        // Simple estimation based on latitude
        const absLat = Math.abs(lat);
        let psh;
        
        if (absLat < 10) psh = 5.5;      // Tropical
        else if (absLat < 30) psh = 5.0;  // Subtropical
        else if (absLat < 50) psh = 4.0;  // Temperate
        else psh = 3.0;                   // Northern
        
        this.state.systemParams.peakSunHours = psh;
        this.elements.peakSunHours.value = psh;
        this.calculateAll();
        
        // Show success message
        alert(`Location detected! PSH set to ${psh} hours based on your latitude.`);
    }

    // Project Management
    saveProject() {
        const projectName = prompt('Enter project name:', `Solar Project ${new Date().toLocaleDateString()}`);
        if (!projectName) return;
        
        const project = {
            id: Date.now(),
            name: projectName,
            date: new Date().toISOString(),
            state: JSON.parse(JSON.stringify(this.state))
        };
        
        this.state.projects.push(project);
        this.saveToStorage();
        
        alert(`Project "${projectName}" saved successfully!`);
        this.updateStorageStatus();
    }

    showProjects() {
        if (this.state.projects.length === 0) {
            alert('No saved projects found.');
            return;
        }
        
        let projectList = 'Saved Projects:\n\n';
        this.state.projects.forEach((project, index) => {
            projectList += `${index + 1}. ${project.name} (${new Date(project.date).toLocaleDateString()})\n`;
        });
        
        const choice = prompt(`${projectList}\nEnter project number to load:`);
        if (choice) {
            const index = parseInt(choice) - 1;
            if (index >= 0 && index < this.state.projects.length) {
                this.loadProject(index);
            }
        }
    }

    loadProject(index) {
        const project = this.state.projects[index];
        this.state = JSON.parse(JSON.stringify(project.state));
        
        // Update UI
        this.updateApplianceTable();
        this.updateInputValues();
        this.calculateAll();
        
        alert(`Project "${project.name}" loaded successfully!`);
    }

    // Storage
    saveToStorage() {
        try {
            localStorage.setItem('solarSizerProjects', JSON.stringify(this.state.projects));
            localStorage.setItem('solarSizerState', JSON.stringify(this.state));
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    }

    loadFromStorage() {
        try {
            const savedProjects = localStorage.getItem('solarSizerProjects');
            const savedState = localStorage.getItem('solarSizerState');
            
            if (savedProjects) {
                this.state.projects = JSON.parse(savedProjects);
            }
            
            if (savedState) {
                const loadedState = JSON.parse(savedState);
                // Merge loaded state with current state
                Object.assign(this.state, loadedState);
            }
        } catch (e) {
            console.error('Error loading from storage:', e);
        }
        
        this.updateStorageStatus();
    }

    updateStorageStatus() {
        const count = this.state.projects.length;
        this.elements.storageStatus.textContent = `Storage: ${count} project${count !== 1 ? 's' : ''}`;
    }

    // UI Updates
    updateInputValues() {
        // Update form inputs from state
        this.elements.systemVoltage.value = this.state.systemParams.voltage;
        this.elements.autonomyDays.value = this.state.systemParams.autonomyDays;
        this.elements.depthOfDischarge.value = this.state.systemParams.depthOfDischarge * 100;
        this.elements.dodValue.textContent = `${this.state.systemParams.depthOfDischarge * 100}%`;
        this.elements.batteryType.value = this.state.systemParams.batteryType;
        this.elements.peakSunHours.value = this.state.systemParams.peakSunHours;
        this.elements.panelType.value = this.state.systemParams.panelType;
        this.elements.panelWattage.value = this.state.systemParams.panelWattage;
        this.elements.deratingFactor.value = this.state.systemParams.deratingFactor * 100;
        this.elements.deratingValue.textContent = `${this.state.systemParams.deratingFactor * 100}%`;
        this.elements.electricityRate.value = this.state.systemParams.electricityRate;
    }

    updateNetworkStatus() {
        const isOnline = navigator.onLine;
        this.elements.connectionStatus.textContent = isOnline ? 'Online' : 'Offline';
        this.elements.connectionStatus.className = isOnline ? 'online' : 'offline';
    }

    // Theme
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const icon = this.elements.themeToggle.querySelector('.material-icons');
        icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    // Export
    exportReport() {
        const report = this.generateReport();
        this.downloadText(report, 'solar-system-design.txt');
    }

    exportPDF() {
        alert('PDF export would require a backend service. Here\'s a text report instead.');
        this.exportReport();
    }

    generateReport() {
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();
        
        let report = `SOLAR SYSTEM DESIGN REPORT\n`;
        report += `Generated: ${date} ${time}\n`;
        report += `================================\n\n`;
        
        report += `ENERGY REQUIREMENTS\n`;
        report += `-------------------\n`;
        report += `Total Daily Energy: ${this.state.results.dailyEnergy.toFixed(0)} Wh\n\n`;
        
        report += `APPLIANCES\n`;
        report += `-----------\n`;
        this.state.appliances.forEach(app => {
            report += `${app.name}: ${app.power}W × ${app.quantity} × ${app.hours}h = ${(app.power * app.quantity * app.hours).toFixed(0)} Wh\n`;
        });
        report += `\n`;
        
        report += `SYSTEM PARAMETERS\n`;
        report += `-----------------\n`;
        report += `System Voltage: ${this.state.systemParams.voltage}V\n`;
        report += `Days of Autonomy: ${this.state.systemParams.autonomyDays}\n`;
        report += `Depth of Discharge: ${(this.state.systemParams.depthOfDischarge * 100).toFixed(0)}%\n`;
        report += `Battery Type: ${this.state.systemParams.batteryType}\n`;
        report += `Peak Sun Hours: ${this.state.systemParams.peakSunHours}\n`;
        report += `Panel Type: ${this.state.systemParams.panelType}\n`;
        report += `Panel Wattage: ${this.state.systemParams.panelWattage}W\n\n`;
        
        report += `SYSTEM DESIGN\n`;
        report += `-------------\n`;
        report += `Battery Bank: ${this.state.results.batteryAh.toFixed(0)} Ah at ${this.state.systemParams.voltage}V\n`;
        report += `PV Array: ${this.state.results.pvPower.toFixed(0)} W\n`;
        report += `Array Configuration: ${this.state.results.arrayConfig}\n`;
        report += `Inverter: ${this.state.results.inverterSize.toFixed(0)} VA\n`;
        report += `Charge Controller: ${this.state.results.controllerSize.toFixed(0)} A\n\n`;
        
        report += `COST ESTIMATION\n`;
        report += `---------------\n`;
        report += `Total System Cost: $${this.state.results.totalCost.toFixed(0)}\n`;
        report += `Monthly Savings: $${(this.state.results.dailyEnergy / 1000 * 30 * this.state.systemParams.electricityRate).toFixed(2)}\n`;
        report += `Payback Period: ${(this.state.results.totalCost / (this.state.results.dailyEnergy / 1000 * 365 * this.state.systemParams.electricityRate)).toFixed(1)} years\n`;
        
        return report;
    }

    downloadText(text, filename) {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Reset
    resetDesign() {
        if (confirm('Are you sure you want to start a new design? Current data will be lost.')) {
            this.state.appliances = [];
            this.state.systemParams = {
                voltage: 24,
                autonomyDays: 5,
                depthOfDischarge: 0.7,
                batteryType: 'lifepo4',
                peakSunHours: 4.5,
                panelType: 'mono',
                panelWattage: 400,
                deratingFactor: 0.85,
                electricityRate: 0.15
            };
            this.updateApplianceTable();
            this.updateInputValues();
            this.calculateAll();
            this.updateStep(1);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.solarApp = new SolarSystemSizer();
});