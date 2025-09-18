// All Tasks Table Viewer - Fixed Search Functionality
console.log('Loading All Tasks Viewer...');

class AllTasksViewer {
    constructor() {
        console.log('Creating AllTasksViewer instance');
        this.allTasksData = [];
        this.fieldTasksData = [];
        this.filteredData = [];
        this.currentView = 'literature'; // 'literature' or 'field'
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.filters = {};

        // Default visible columns (without Colour, Shape, Position)
        this.visibleColumns = new Set([
            'task_ID',
            'paper_ID',
            'User Task',
            'Task Type (network, geospatial, temporal, neither, all)',
            'Rule',
            'Archetype',
            'Why L1 Action',
            'Why L2 Action',
            'What Cat.',
            'What Subcat.'
        ]);

        // Store bound methods to maintain references
        this.boundApplyFilters = this.applyFilters.bind(this);
        this.boundClearFilters = this.clearFilters.bind(this);
        this.init();
    }

    init() {
        console.log('Initializing All Tasks Viewer');
        this.addTabButton();
        this.setupEventListeners();
    }

    // Add tab button to the controls section
    addTabButton() {
        console.log('Adding tab buttons...');

        const controls = document.querySelector('#controls');
        if (!controls) {
            console.error('Controls section not found!');
            return;
        }

        // Check if tabs already exist
        if (document.querySelector('.tab-button')) {
            console.log('Tabs already exist');
            return;
        }

        // Create tab container
        const tabContainer = document.createElement('div');
        tabContainer.id = 'tab-container';
        tabContainer.style.cssText = `
            margin: 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #ecf0f1;
            display: flex;
            gap: 10px;
        `;

        // Create "Papers" tab (default view)
        const papersTab = document.createElement('button');
        papersTab.className = 'tab-button active';
        papersTab.textContent = 'Papers View';
        papersTab.style.cssText = `
            padding: 10px 20px;
            background: #2c3e50;
            color: white;
            border: none;
            border-radius: 4px 4px 0 0;
            cursor: pointer;
            font-family: 'Open Sans', sans-serif;
            font-weight: 600;
            font-size: 14px;
        `;

        // Create "All Tasks" tab
        const allTasksTab = document.createElement('button');
        allTasksTab.className = 'tab-button';
        allTasksTab.textContent = 'Literature Tasks';
        allTasksTab.style.cssText = `
            padding: 10px 20px;
            background: #95a5a6;
            color: white;
            border: none;
            border-radius: 4px 4px 0 0;
            cursor: pointer;
            font-family: 'Open Sans', sans-serif;
            font-weight: 600;
            font-size: 14px;
        `;

        // Create "Field Tasks" tab
        const fieldTasksTab = document.createElement('button');
        fieldTasksTab.className = 'tab-button';
        fieldTasksTab.textContent = 'Field Tasks';
        fieldTasksTab.style.cssText = `
            padding: 10px 20px;
            background: #95a5a6;
            color: white;
            border: none;
            border-radius: 4px 4px 0 0;
            cursor: pointer;
            font-family: 'Open Sans', sans-serif;
            font-weight: 600;
            font-size: 14px;
        `;

        // Add click handlers
        papersTab.onclick = () => {
            console.log('Papers tab clicked');
            this.showPapersView();
        };

        allTasksTab.onclick = () => {
            console.log('Literature Tasks tab clicked');
            this.showAllTasksView();
        };

        fieldTasksTab.onclick = () => {
            console.log('Field Tasks tab clicked');
            this.showFieldTasksView();
        };

        tabContainer.appendChild(papersTab);
        tabContainer.appendChild(allTasksTab);
        tabContainer.appendChild(fieldTasksTab);

        // Insert after the first paragraph
        const firstP = controls.querySelector('p');
        if (firstP && firstP.nextSibling) {
            controls.insertBefore(tabContainer, firstP.nextSibling);
        } else {
            controls.insertBefore(tabContainer, controls.firstChild);
        }

        // Store references
        this.papersTab = papersTab;
        this.allTasksTab = allTasksTab;
        this.fieldTasksTab = fieldTasksTab;

        console.log('Tab buttons added successfully');
    }

    // Show all tasks table view
    async showAllTasksView() {
        console.log('Showing literature tasks view');

        this.currentView = 'literature';

        // Update tab styles
        if (this.allTasksTab) this.allTasksTab.style.background = '#2c3e50';
        if (this.papersTab) this.papersTab.style.background = '#95a5a6';
        if (this.fieldTasksTab) this.fieldTasksTab.style.background = '#95a5a6';

        // Make sure grid container is still a grid
        const gridContainer = document.querySelector('.grid-container');
        if (gridContainer) {
            gridContainer.style.display = 'grid';
            console.log('Grid container display:', gridContainer.style.display);
        }

        // Hide ONLY the papers container
        const container = document.querySelector('#container');
        if (container) {
            container.style.display = 'none';
            console.log('Papers container hidden');
        }

        // Hide the filter sections
        const pubFilters = document.querySelector('#filters_pubdata');
        if (pubFilters) {
            pubFilters.style.display = 'none';
            let prevH3 = pubFilters.previousElementSibling;
            if (prevH3 && prevH3.tagName === 'H3') {
                prevH3.style.display = 'none';
            }
        }

        const dataFilters = document.querySelector('#filters_data');
        if (dataFilters) {
            dataFilters.style.display = 'none';
            let prevH3 = dataFilters.previousElementSibling;
            if (prevH3 && prevH3.tagName === 'H3') {
                prevH3.style.display = 'none';
            }
        }

        // Hide the "Select multiple data features" paragraph
        const controls = document.querySelector('#controls');
        if (controls) {
            const paragraphs = controls.querySelectorAll('p');
            paragraphs.forEach(p => {
                if (p.textContent.includes('Select multiple')) {
                    p.style.display = 'none';
                }
            });
        }

        // Load data if needed
        if (this.allTasksData.length === 0) {
            console.log('Loading literature tasks data...');
            await this.loadAllTasks();
        }

        // Set filtered data to literature tasks
        this.filteredData = [...this.allTasksData];

        // Show table
        this.showTable();
    }

    // Load all tasks from CSV
    async loadAllTasks() {
        console.log('Loading all tasks...');
        try {
            const response = await fetch('literature_tasks.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            this.allTasksData = d3.csvParse(text);
            this.filteredData = [...this.allTasksData];
            console.log(`Loaded ${this.allTasksData.length} total tasks`);
        } catch (error) {
            console.error('Error loading all tasks:', error);
            alert('Error loading tasks data. Make sure literature_tasks.csv is in the root directory.');
            this.allTasksData = [];
            this.filteredData = [];
        }
    }

    // Show field tasks view
    async showFieldTasksView() {
        console.log('Showing field tasks view');

        this.currentView = 'field';

        // Update tab styles
        if (this.fieldTasksTab) this.fieldTasksTab.style.background = '#2c3e50';
        if (this.papersTab) this.papersTab.style.background = '#95a5a6';
        if (this.allTasksTab) this.allTasksTab.style.background = '#95a5a6';

        // Make sure grid container is still a grid
        const gridContainer = document.querySelector('.grid-container');
        if (gridContainer) {
            gridContainer.style.display = 'grid';
            console.log('Grid container display:', gridContainer.style.display);
        }

        // Hide ONLY the papers container
        const container = document.querySelector('#container');
        if (container) {
            container.style.display = 'none';
            console.log('Papers container hidden');
        }

        // Hide the filter sections
        const pubFilters = document.querySelector('#filters_pubdata');
        if (pubFilters) {
            pubFilters.style.display = 'none';
            let prevH3 = pubFilters.previousElementSibling;
            if (prevH3 && prevH3.tagName === 'H3') {
                prevH3.style.display = 'none';
            }
        }

        const dataFilters = document.querySelector('#filters_data');
        if (dataFilters) {
            dataFilters.style.display = 'none';
            let prevH3 = dataFilters.previousElementSibling;
            if (prevH3 && prevH3.tagName === 'H3') {
                prevH3.style.display = 'none';
            }
        }

        // Hide the "Select multiple data features" paragraph
        const controls = document.querySelector('#controls');
        if (controls) {
            const paragraphs = controls.querySelectorAll('p');
            paragraphs.forEach(p => {
                if (p.textContent.includes('Select multiple')) {
                    p.style.display = 'none';
                }
            });
        }

        // Load field data if needed - you can change this to load a different CSV
        if (this.fieldTasksData.length === 0) {
            console.log('Loading field tasks data...');
            await this.loadFieldTasks();
        }

        // Set filtered data to field tasks
        this.filteredData = [...this.fieldTasksData];

        // Show table
        this.showTable();
    }

    // Load field tasks from CSV
    async loadFieldTasks() {
        console.log('Loading field tasks...');
        try {
            // Load from field_tasks.csv
            const response = await fetch('field_tasks.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            this.fieldTasksData = d3.csvParse(text);
            this.filteredData = [...this.fieldTasksData];
            console.log(`Loaded ${this.fieldTasksData.length} field tasks`);
        } catch (error) {
            console.error('Error loading field tasks:', error);
            alert('Error loading field tasks data. Make sure field_tasks.csv is in the root directory.');
            this.fieldTasksData = [];
            this.filteredData = [];
        }
    }

    // Show papers grid view
    showPapersView() {
        console.log('Showing papers view');

        // Update tab styles
        if (this.papersTab) this.papersTab.style.background = '#2c3e50';
        if (this.allTasksTab) this.allTasksTab.style.background = '#95a5a6';
        if (this.fieldTasksTab) this.fieldTasksTab.style.background = '#95a5a6';

        // Show the papers container
        const container = document.querySelector('#container');
        if (container) {
            container.style.display = '';
        }

        // Show the filter sections
        const pubFilters = document.querySelector('#filters_pubdata');
        if (pubFilters) {
            pubFilters.style.display = '';
            // Also show the heading before it
            let prevH3 = pubFilters.previousElementSibling;
            if (prevH3 && prevH3.tagName === 'H3') {
                prevH3.style.display = '';
            }
        }

        const dataFilters = document.querySelector('#filters_data');
        if (dataFilters) {
            dataFilters.style.display = '';
            // Also show the heading before it
            let prevH3 = dataFilters.previousElementSibling;
            if (prevH3 && prevH3.tagName === 'H3') {
                prevH3.style.display = '';
            }
        }

        // Show the paragraphs
        const controls = document.querySelector('#controls');
        if (controls) {
            controls.querySelectorAll('p, h3').forEach(el => {
                el.style.display = '';
            });
        }

        // Hide table container
        const tableContainer = document.querySelector('#all-tasks-container');
        if (tableContainer) {
            tableContainer.style.display = 'none';
        }

        // Refresh Masonry
        setTimeout(() => {
            if (window.msnry) {
                window.msnry.layout();
            }
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }

    // Get column width based on column type
    getColumnWidth(col) {
        const widths = {
            'task_ID': '30px',
            'paper_ID': '120px',
            'User Task': '200px',
            'Direct Quote from Paper': '300px',
            'How User Carries Out Task': '300px',
            'Task Type (network, geospatial, temporal, neither, all)': '80px',
            'Rule': '40px',
            'Archetype': '70px',
            'Why L1 Action': '80px',
            'Why L2 Action': '80px',
            'Why L3 Action': '80px',
            'What Cat.': '90px',
            'What Subcat.': '90px',
            'Colour': '80px',
            'Shape': '80px',
            'Position': '80px',
            'Size': '80px',
            'Orientation': '80px',
            'Texture': '80px',
            'Saturation/Luminance': '80px',
            'Fill (Coverage)': '80px',
            'Animation': '80px',
            'Text': '80px'
        };
        return widths[col] || '80px';
    }

    // Create and show the table
    showTable() {
        console.log('showTable called');

        let tableContainer = document.querySelector('#all-tasks-container');

        if (!tableContainer) {
            console.log('Creating new table container');
            tableContainer = document.createElement('div');
            tableContainer.id = 'all-tasks-container';
            tableContainer.style.cssText = `
                grid-column: 2;
                grid-row: 1;
                margin-left: 40px;
                background: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: #282828 0 0 7px;
                display: block;
                min-height: 500px;
            `;

            const gridContainer = document.querySelector('.grid-container');
            if (gridContainer) {
                gridContainer.appendChild(tableContainer);
            }
        }

        // Get the appropriate data based on current view
        const currentData = this.currentView === 'field' ? this.fieldTasksData : this.allTasksData;
        const tableTitle = this.currentView === 'field' ? 'Field Tasks' : 'Literature Tasks';

        // Get unique values for filter dropdowns from current data source
        const uniquePapers = [...new Set(currentData.map(row => row.paper_ID))].filter(v => v).sort();
        const uniqueTypes = [...new Set(currentData.map(row => row['Task Type (network, geospatial, temporal, neither, all)']))].filter(v => v).sort();
        const uniqueArchetypes = [...new Set(currentData.map(row => row.Archetype))].filter(v => v).sort();
        const uniqueWhyL1 = [...new Set(currentData.map(row => row['Why L1 Action']))].filter(v => v).sort();
        const uniqueWhyL2 = [...new Set(currentData.map(row => row['Why L2 Action']))].filter(v => v).sort();
        const uniqueWhatCat = [...new Set(currentData.map(row => row['What Cat.']))].filter(v => v).sort();
        const uniqueWhatSubcat = [...new Set(currentData.map(row => row['What Subcat.']))].filter(v => v).sort();

        console.log(`Showing ${this.filteredData.length} tasks`);

        // Store current filter values before rebuilding
        const currentSearchValue = document.getElementById('search-all')?.value || '';
        const currentPaperValue = document.getElementById('filter-paper')?.value || '';
        const currentTypeValue = document.getElementById('filter-type')?.value || '';
        const currentArchetypeValue = document.getElementById('filter-archetype')?.value || '';
        const currentWhyL1Value = document.getElementById('filter-whyl1')?.value || '';
        const currentWhyL2Value = document.getElementById('filter-whyl2')?.value || '';
        const currentWhatCatValue = document.getElementById('filter-whatcat')?.value || '';
        const currentWhatSubcatValue = document.getElementById('filter-whatsubcat')?.value || '';

        // Get all available columns from the data
        const allColumns = currentData.length > 0 ? Object.keys(currentData[0]) : [];

        // Create column selector HTML
        const columnSelectorHTML = `
            <div style="background: #e8f4f8; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #bee5eb;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #2c3e50; font-size: 16px;">Column Selector</h3>
                    <button id="toggle-columns" style="padding: 6px 12px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        Show/Hide Columns
                    </button>
                </div>
                <div id="column-selector-content" style="display: none;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; max-height: 200px; overflow-y: auto; padding: 10px; background: white; border-radius: 4px;">
                        ${allColumns.map(col => {
            const checked = this.visibleColumns.has(col) ? 'checked' : '';
            const disabled = col === 'task_ID' || col === 'User Task' || (col === 'paper_ID' && this.currentView !== 'field') ? 'disabled' : '';
            return `
                                <label style="display: flex; align-items: center; cursor: pointer; font-size: 12px;">
                                    <input type="checkbox" 
                                           class="column-toggle" 
                                           data-column="${col}" 
                                           ${checked} 
                                           ${disabled}
                                           style="margin-right: 6px;">
                                    <span style="color: ${disabled ? '#999' : '#333'};">${this.getReadableColumnName(col)}</span>
                                </label>
                            `;
        }).join('')}
                    </div>
                    <div style="margin-top: 10px; display: flex; gap: 10px;">
                        <button id="select-all-columns" style="padding: 6px 12px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            Select All
                        </button>
                        <button id="select-default-columns" style="padding: 6px 12px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            Reset to Default
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Table with filters and more columns
        tableContainer.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">
                ${tableTitle} (${this.filteredData.length} of ${currentData.length} tasks)
            </h2>
            
            ${columnSelectorHTML}
            
            <!-- Filter controls -->
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                    
                    <!-- Search All -->
                    <div>
                        <label style="display: block; font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">Search All</label>
                        <input type="text" id="search-all" placeholder="Type to search..." value="${currentSearchValue}"
                            style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; color: #333; background-color: white; box-sizing: border-box;">
                    </div>
                    
                    ${this.currentView !== 'field' ? `
                    <!-- Paper ID Filter -->
                    <div>
                        <label style="display: block; font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">Paper ID</label>
                        <select id="filter-paper" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
                            <option value="">All Papers</option>
                            ${uniquePapers.map(val => `<option value="${val}" ${val === currentPaperValue ? 'selected' : ''}>${val}</option>`).join('')}
                        </select>
                    </div>
                    ` : ''}
                    
                    <!-- Task Type Filter -->
                    <div>
                        <label style="display: block; font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">Task Type</label>
                        <select id="filter-type" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
                            <option value="">All Types</option>
                            ${uniqueTypes.map(val => `<option value="${val}" ${val === currentTypeValue ? 'selected' : ''}>${val}</option>`).join('')}
                        </select>
                    </div>
                    
                    <!-- Archetype Filter -->
                    <div>
                        <label style="display: block; font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">Archetype</label>
                        <select id="filter-archetype" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
                            <option value="">All Archetypes</option>
                            ${uniqueArchetypes.map(val => `<option value="${val}" ${val === currentArchetypeValue ? 'selected' : ''}>${val}</option>`).join('')}
                        </select>
                    </div>
                    
                    <!-- Why L1 Filter -->
                    <div>
                        <label style="display: block; font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">Why L1 Action</label>
                        <select id="filter-whyl1" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
                            <option value="">All L1 Actions</option>
                            ${uniqueWhyL1.map(val => `<option value="${val}" ${val === currentWhyL1Value ? 'selected' : ''}>${val}</option>`).join('')}
                        </select>
                    </div>
                    
                    <!-- Why L2 Filter -->
                    <div>
                        <label style="display: block; font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">Why L2 Action</label>
                        <select id="filter-whyl2" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
                            <option value="">All L2 Actions</option>
                            ${uniqueWhyL2.map(val => `<option value="${val}" ${val === currentWhyL2Value ? 'selected' : ''}>${val}</option>`).join('')}
                        </select>
                    </div>
                    
                    <!-- What Cat Filter -->
                    <div>
                        <label style="display: block; font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">What Category</label>
                        <select id="filter-whatcat" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
                            <option value="">All Categories</option>
                            ${uniqueWhatCat.map(val => `<option value="${val}" ${val === currentWhatCatValue ? 'selected' : ''}>${val}</option>`).join('')}
                        </select>
                    </div>
                    
                    <!-- What Subcat Filter -->
                    <div>
                        <label style="display: block; font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">What Subcategory</label>
                        <select id="filter-whatsubcat" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
                            <option value="">All Subcategories</option>
                            ${uniqueWhatSubcat.map(val => `<option value="${val}" ${val === currentWhatSubcatValue ? 'selected' : ''}>${val}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button id="clear-filters" style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                        Clear All Filters
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Table -->
        <div style="overflow-x: auto; border: 1px solid #ecf0f1; border-radius: 4px; max-width: 100%;">
            <div style="max-height: calc(100vh - 400px); overflow-y: auto;">
                <table style="border-collapse: collapse; font-family: 'Open Sans', sans-serif; font-size: 13px; width: 100%; table-layout: fixed;">
                    <thead>
                        <tr style="background: #2c3e50; color: white; position: sticky; top: 0; z-index: 10;">
                            ${Array.from(this.visibleColumns).map(col => {
            // Skip paper_ID column for field tasks
            if (col === 'paper_ID' && this.currentView === 'field') return '';

            const displayName = this.getReadableColumnName(col);
            const width = this.getColumnWidth(col);

            return `<th style="padding: 10px 8px; text-align: left; font-weight: 600; width: ${width}; word-wrap: break-word; overflow-wrap: break-word;">${displayName}</th>`;
        }).join('')}
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        ${this.generateTableRows()}
                    </tbody>
                </table>
            </div>
        </div>
    `;

        // Make sure it's visible
        tableContainer.style.display = 'block';

        // Add event listeners for filters
        this.attachFilterListeners();

        // Add event listeners for column selector
        this.attachColumnSelectorListeners();
    }

    // Generate table rows HTML
    generateTableRows() {
        if (this.filteredData.length === 0) {
            const colCount = this.currentView === 'field' ?
                this.visibleColumns.size - (this.visibleColumns.has('paper_ID') ? 1 : 0) :
                this.visibleColumns.size;
            return `<tr><td colspan="${colCount}" style="padding: 20px; text-align: center; color: #666;">No tasks found matching filters...</td></tr>`;
        }

        return this.filteredData.map((row, index) => `
            <tr style="${index % 2 === 0 ? 'background: #fafbfc;' : 'background: white;'}">
                ${Array.from(this.visibleColumns).map(col => {
            // Skip paper_ID column for field tasks
            if (col === 'paper_ID' && this.currentView === 'field') return '';

            const value = row[col] || '';
            const fontWeight = col === 'paper_ID' ? 'font-weight: 500;' : '';
            const title = ['User Task', 'Direct Quote from Paper', 'How User Carries Out Task'].includes(col) ?
                `title="${value.toString().replace(/"/g, '&quot;')}"` : '';
            const textAlign = ['Colour', 'Shape', 'Position', 'Size', 'Orientation', 'Texture', 'Saturation/Luminance', 'Fill (Coverage)', 'Animation'].includes(col)
                ? 'text-align: center;' : '';
            const width = this.getColumnWidth(col);

            // Format visual channel columns
            const displayValue = ['Colour', 'Shape', 'Position', 'Size', 'Orientation', 'Texture', 'Saturation/Luminance', 'Fill (Coverage)', 'Animation'].includes(col)
                ? this.formatVisualChannel(value)
                : value;

            return `<td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1; ${fontWeight} ${textAlign} width: ${width}; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; vertical-align: top;" ${title}>${displayValue}</td>`;
        }).join('')}
            </tr>
        `).join('');
    }

    // Get readable column names
    getReadableColumnName(col) {
        const nameMap = {
            'task_ID': 'Task ID',
            'paper_ID': 'Paper ID',
            'User Task': 'User Task',
            'Direct Quote from Paper': 'Direct Quote',
            'Visualisation Tools/Technique': 'Vis Tools/Technique',
            'How User Carries Out Task': 'How User Carries Out Task',
            'Task Type (network, geospatial, temporal, neither, all)': 'Task Type',
            'Geo_Modifier': 'Geo Modifier',
            'Rule': 'Rule',
            'Archetype': 'Archetype',
            'WHY Details': 'Why Details',
            'Why L1 Action': 'Why L1 Action',
            'Why L2 Action': 'Why L2 Action',
            'Why L3 Action': 'Why L3 Action',
            'Why L1 Target': 'Why L1 Target',
            'Why L2 Target': 'Why L2 Target',
            'HOW Encode': 'How Encode',
            'HOW Manipulate (Interactive)': 'How Manipulate',
            'HOW Facet (Dashboards/Multiple Views)': 'How Facet',
            'HOW Reduce (Large datasets)': 'How Reduce',
            'Animation': 'Animation',
            'Colour': 'Colour',
            'Fill (Coverage)': 'Fill (Coverage)',
            'Orientation': 'Orientation',
            'Position': 'Position',
            'Saturation/Luminance': 'Saturation/Luminance',
            'Shape': 'Shape',
            'Size': 'Size',
            'Text': 'Text',
            'Texture': 'Texture',
            'What Cat.': 'What Category',
            'What Subcat.': 'What Subcategory'
        };

        return nameMap[col] || col;
    }

    // Attach column selector event listeners
    attachColumnSelectorListeners() {
        // Toggle column selector visibility
        document.getElementById('toggle-columns')?.addEventListener('click', () => {
            const content = document.getElementById('column-selector-content');
            if (content) {
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
            }
        });

        // Column checkboxes
        document.querySelectorAll('.column-toggle').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const column = e.target.dataset.column;
                if (e.target.checked) {
                    this.visibleColumns.add(column);
                } else {
                    this.visibleColumns.delete(column);
                }
                // Rebuild the entire table to update headers and cells
                this.showTable();
            });
        });

        // Select all columns button
        document.getElementById('select-all-columns')?.addEventListener('click', () => {
            const currentData = this.currentView === 'field' ? this.fieldTasksData : this.allTasksData;
            const allColumns = currentData.length > 0 ? Object.keys(currentData[0]) : [];

            allColumns.forEach(col => {
                if (col !== 'paper_ID' || this.currentView !== 'field') {
                    this.visibleColumns.add(col);
                }
            });

            // Rebuild the entire table
            this.showTable();
        });

        // Reset to default columns button
        document.getElementById('select-default-columns')?.addEventListener('click', () => {
            this.visibleColumns.clear();
            this.visibleColumns.add('task_ID');
            this.visibleColumns.add('paper_ID');
            this.visibleColumns.add('User Task');
            this.visibleColumns.add('Task Type (network, geospatial, temporal, neither, all)');
            this.visibleColumns.add('Rule');
            this.visibleColumns.add('Archetype');
            this.visibleColumns.add('Why L1 Action');
            this.visibleColumns.add('Why L2 Action');
            this.visibleColumns.add('What Cat.');
            this.visibleColumns.add('What Subcat.');

            // Rebuild the entire table
            this.showTable();
        });
    }

    // Format visual channel values
    formatVisualChannel(value) {
        if (!value) return '<span style="color: #999;">—</span>';
        if (value === '1' || value === 'TRUE' || value === 'true') {
            return '<span style="color: #27ae60; font-weight: bold;">✓</span>';
        } else if (value === '0' || value === 'FALSE' || value === 'false') {
            return '<span style="color: #e74c3c;">✗</span>';
        }
        return value;
    }

    // Attach filter event listeners
    attachFilterListeners() {
        console.log('Attaching filter listeners');

        // Search input with debouncing
        const searchInput = document.getElementById('search-all');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    console.log('Search triggered:', e.target.value);
                    this.applyFilters();
                }, 300); // 300ms debounce
            });
        }

        // Individual filters
        if (this.currentView !== 'field') {
            document.getElementById('filter-paper')?.addEventListener('change', this.boundApplyFilters);
        }
        document.getElementById('filter-type')?.addEventListener('change', this.boundApplyFilters);
        document.getElementById('filter-archetype')?.addEventListener('change', this.boundApplyFilters);
        document.getElementById('filter-whyl1')?.addEventListener('change', this.boundApplyFilters);
        document.getElementById('filter-whyl2')?.addEventListener('change', this.boundApplyFilters);
        document.getElementById('filter-whatcat')?.addEventListener('change', this.boundApplyFilters);
        document.getElementById('filter-whatsubcat')?.addEventListener('change', this.boundApplyFilters);

        // Clear filters button
        document.getElementById('clear-filters')?.addEventListener('click', this.boundClearFilters);
    }

    // Apply all filters
    applyFilters() {
        console.log('Applying filters');

        // Get the appropriate data based on current view
        const currentData = this.currentView === 'field' ? this.fieldTasksData : this.allTasksData;

        const searchTerm = document.getElementById('search-all')?.value.toLowerCase() || '';
        const paperFilter = this.currentView !== 'field' ? (document.getElementById('filter-paper')?.value || '') : '';
        const typeFilter = document.getElementById('filter-type')?.value || '';
        const archetypeFilter = document.getElementById('filter-archetype')?.value || '';
        const whyL1Filter = document.getElementById('filter-whyl1')?.value || '';
        const whyL2Filter = document.getElementById('filter-whyl2')?.value || '';
        const whatCatFilter = document.getElementById('filter-whatcat')?.value || '';
        const whatSubcatFilter = document.getElementById('filter-whatsubcat')?.value || '';

        this.filteredData = currentData.filter(row => {
            // Search all columns
            if (searchTerm) {
                const rowText = Object.values(row).join(' ').toLowerCase();
                if (!rowText.includes(searchTerm)) return false;
            }

            // Apply individual filters (skip paper filter for field tasks)
            if (this.currentView !== 'field' && paperFilter && row.paper_ID !== paperFilter) return false;
            if (typeFilter && row['Task Type (network, geospatial, temporal, neither, all)'] !== typeFilter) return false;
            if (archetypeFilter && row.Archetype !== archetypeFilter) return false;
            if (whyL1Filter && row['Why L1 Action'] !== whyL1Filter) return false;
            if (whyL2Filter && row['Why L2 Action'] !== whyL2Filter) return false;
            if (whatCatFilter && row['What Cat.'] !== whatCatFilter) return false;
            if (whatSubcatFilter && row['What Subcat.'] !== whatSubcatFilter) return false;

            return true;
        });

        console.log(`Filtered to ${this.filteredData.length} results`);
        this.updateFilterOptions();
        this.updateTable();
    }

    // Update only the table content without rebuilding filters
    updateTable() {
        const tableContainer = document.querySelector('#all-tasks-container');
        if (!tableContainer) return;

        // Get the appropriate data based on current view
        const currentData = this.currentView === 'field' ? this.fieldTasksData : this.allTasksData;
        const tableTitle = this.currentView === 'field' ? 'Field Tasks' : 'Literature Tasks';

        // Update count in header
        const header = tableContainer.querySelector('h2');
        if (header) {
            header.innerHTML = `${tableTitle} (${this.filteredData.length} of ${currentData.length} tasks)`;
        }

        // Find the table wrapper div and rebuild the entire table structure
        const tableWrapper = tableContainer.querySelector('div[style*="overflow-x"]');
        if (tableWrapper) {
            tableWrapper.innerHTML = `
                <div style="max-height: calc(100vh - 400px); overflow-y: auto;">
                    <table style="border-collapse: collapse; font-family: 'Open Sans', sans-serif; font-size: 13px; width: 100%; table-layout: fixed;">
                        <thead>
                            <tr style="background: #2c3e50; color: white; position: sticky; top: 0; z-index: 10;">
                                ${Array.from(this.visibleColumns).map(col => {
                // Skip paper_ID column for field tasks
                if (col === 'paper_ID' && this.currentView === 'field') return '';

                const displayName = this.getReadableColumnName(col);
                const width = this.getColumnWidth(col);

                return `<th style="padding: 10px 8px; text-align: left; font-weight: 600; width: ${width}; word-wrap: break-word; overflow-wrap: break-word;">${displayName}</th>`;
            }).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generateTableRows()}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    // Update filter options based on current filtered data
    updateFilterOptions() {
        // Get the appropriate data based on current view
        const currentData = this.currentView === 'field' ? this.fieldTasksData : this.allTasksData;

        // Store current selections
        const currentPaper = document.getElementById('filter-paper')?.value || '';
        const currentType = document.getElementById('filter-type')?.value || '';
        const currentArchetype = document.getElementById('filter-archetype')?.value || '';
        const currentWhyL1 = document.getElementById('filter-whyl1')?.value || '';
        const currentWhyL2 = document.getElementById('filter-whyl2')?.value || '';
        const currentWhatCat = document.getElementById('filter-whatcat')?.value || '';
        const currentWhatSubcat = document.getElementById('filter-whatsubcat')?.value || '';

        // Get available options from filtered data
        const availablePapers = [...new Set(this.filteredData.map(row => row.paper_ID))].filter(v => v).sort();
        const availableTypes = [...new Set(this.filteredData.map(row => row['Task Type (network, geospatial, temporal, neither, all)']))].filter(v => v).sort();
        const availableArchetypes = [...new Set(this.filteredData.map(row => row.Archetype))].filter(v => v).sort();
        const availableWhyL1 = [...new Set(this.filteredData.map(row => row['Why L1 Action']))].filter(v => v).sort();
        const availableWhyL2 = [...new Set(this.filteredData.map(row => row['Why L2 Action']))].filter(v => v).sort();
        const availableWhatCat = [...new Set(this.filteredData.map(row => row['What Cat.']))].filter(v => v).sort();
        const availableWhatSubcat = [...new Set(this.filteredData.map(row => row['What Subcat.']))].filter(v => v).sort();

        // Get all possible options from current data source
        const allPapers = [...new Set(currentData.map(row => row.paper_ID))].filter(v => v).sort();
        const allTypes = [...new Set(currentData.map(row => row['Task Type (network, geospatial, temporal, neither, all)']))].filter(v => v).sort();
        const allArchetypes = [...new Set(currentData.map(row => row.Archetype))].filter(v => v).sort();
        const allWhyL1 = [...new Set(currentData.map(row => row['Why L1 Action']))].filter(v => v).sort();
        const allWhyL2 = [...new Set(currentData.map(row => row['Why L2 Action']))].filter(v => v).sort();
        const allWhatCat = [...new Set(currentData.map(row => row['What Cat.']))].filter(v => v).sort();
        const allWhatSubcat = [...new Set(currentData.map(row => row['What Subcat.']))].filter(v => v).sort();

        // Helper function to update a select element
        const updateSelect = (id, allOptions, availableOptions, currentValue) => {
            const select = document.getElementById(id);
            if (!select) return;

            const options = ['<option value="">All ' + select.parentElement.querySelector('label').textContent + '</option>'];

            allOptions.forEach(val => {
                const isAvailable = availableOptions.includes(val);
                const isSelected = val === currentValue;
                const disabled = !isAvailable && !isSelected ? 'disabled' : '';
                const style = !isAvailable && !isSelected ? 'style="color: #999;"' : '';
                options.push(`<option value="${val}" ${disabled} ${style} ${isSelected ? 'selected' : ''}>${val}${!isAvailable && !isSelected ? ' (0)' : ''}</option>`);
            });

            select.innerHTML = options.join('');
        };

        // Update all selects
        if (this.currentView !== 'field') {
            updateSelect('filter-paper', allPapers, availablePapers, currentPaper);
        }
        updateSelect('filter-type', allTypes, availableTypes, currentType);
        updateSelect('filter-archetype', allArchetypes, availableArchetypes, currentArchetype);
        updateSelect('filter-whyl1', allWhyL1, availableWhyL1, currentWhyL1);
        updateSelect('filter-whyl2', allWhyL2, availableWhyL2, currentWhyL2);
        updateSelect('filter-whatcat', allWhatCat, availableWhatCat, currentWhatCat);
        updateSelect('filter-whatsubcat', allWhatSubcat, availableWhatSubcat, currentWhatSubcat);
    }

    // Clear all filters
    clearFilters() {
        console.log('Clearing all filters');
        document.getElementById('search-all').value = '';
        if (this.currentView !== 'field' && document.getElementById('filter-paper')) {
            document.getElementById('filter-paper').value = '';
        }
        document.getElementById('filter-type').value = '';
        document.getElementById('filter-archetype').value = '';
        document.getElementById('filter-whyl1').value = '';
        document.getElementById('filter-whyl2').value = '';
        document.getElementById('filter-whatcat').value = '';
        document.getElementById('filter-whatsubcat').value = '';

        // Reset filtered data to appropriate data source
        const currentData = this.currentView === 'field' ? this.fieldTasksData : this.allTasksData;
        this.filteredData = [...currentData];

        // Update filter options to show all available
        this.updateFilterOptions();
        this.updateTable();
    }

    // Setup general event listeners
    setupEventListeners() {
        console.log('Setting up event listeners');
        // Add any additional event listeners here if needed
    }
}

// Initialize immediately
console.log('Creating AllTasksViewer instance...');
window.allTasksViewer = new AllTasksViewer();

// Also try after DOM loads to be sure
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!document.querySelector('.tab-button')) {
            console.log('Re-adding tab buttons after DOM load');
            window.allTasksViewer.addTabButton();
        }
    });
}

console.log('All Tasks Viewer ready. Access via window.allTasksViewer');