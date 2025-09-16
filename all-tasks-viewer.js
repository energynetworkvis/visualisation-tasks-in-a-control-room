// All Tasks Table Viewer - Fixed Search Functionality
console.log('Loading All Tasks Viewer...');

class AllTasksViewer {
    constructor() {
        console.log('Creating AllTasksViewer instance');
        this.allTasksData = [];
        this.filteredData = [];
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.filters = {};
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

        // Create "Observation Tasks" tab
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
            console.log('All Tasks tab clicked');
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
        console.log('Showing all tasks view');

        // Update tab styles
        if (this.allTasksTab) this.allTasksTab.style.background = '#2c3e50';
        if (this.papersTab) this.papersTab.style.background = '#95a5a6';

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
            console.log('Loading tasks data...');
            await this.loadAllTasks();
        }

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

    // Show papers grid view
    showPapersView() {
        console.log('Showing papers view');

        // Update tab styles
        if (this.papersTab) this.papersTab.style.background = '#2c3e50';
        if (this.allTasksTab) this.allTasksTab.style.background = '#95a5a6';

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

        // Get unique values for filter dropdowns
        const uniquePapers = [...new Set(this.allTasksData.map(row => row.paper_ID))].filter(v => v).sort();
        const uniqueTypes = [...new Set(this.allTasksData.map(row => row['Task Type (network, geospatial, temporal, neither, all)']))].filter(v => v).sort();
        const uniqueArchetypes = [...new Set(this.allTasksData.map(row => row.Archetype))].filter(v => v).sort();
        const uniqueWhyL1 = [...new Set(this.allTasksData.map(row => row['Why L1 Action']))].filter(v => v).sort();
        const uniqueWhyL2 = [...new Set(this.allTasksData.map(row => row['Why L2 Action']))].filter(v => v).sort();
        const uniqueWhatCat = [...new Set(this.allTasksData.map(row => row['What Cat.']))].filter(v => v).sort();
        const uniqueWhatSubcat = [...new Set(this.allTasksData.map(row => row['What Subcat.']))].filter(v => v).sort();

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

        // Table with filters and more columns
        tableContainer.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">
                Visualisation Tasks (${this.filteredData.length} of ${this.allTasksData.length} tasks)
            </h2>
            
            <!-- Filter controls -->
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
                    
                    <!-- Search All -->
                    <div>
                        <label style="display: block; font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">Search All</label>
                        <input type="text" id="search-all" placeholder="Type to search..." value="${currentSearchValue}"
                            style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; color: #333; background-color: white; box-sizing: border-box;">
                    </div>
                    
                    <!-- Paper ID Filter -->
                    <div>
                        <label style="display: block; font-size: 11px; font-weight: 600; color: #666; margin-bottom: 4px;">Paper ID</label>
                        <select id="filter-paper" style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; box-sizing: border-box;">
                            <option value="">All Papers</option>
                            ${uniquePapers.map(val => `<option value="${val}" ${val === currentPaperValue ? 'selected' : ''}>${val}</option>`).join('')}
                        </select>
                    </div>
                    
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
        <div style="overflow-x: auto; border: 1px solid #ecf0f1; border-radius: 4px;">
            <div style="max-height: calc(100vh - 400px); overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; font-family: 'Open Sans', sans-serif; font-size: 13px;">
                    <thead>
                        <tr style="background: #2c3e50; color: white; position: sticky; top: 0; z-index: 10;">
                            <th style="padding: 10px 8px; text-align: left; font-weight: 600; white-space: nowrap;">ID</th>
                            <th style="padding: 10px 8px; text-align: left; font-weight: 600; white-space: nowrap;">Paper</th>
                            <th style="padding: 10px 8px; text-align: left; font-weight: 600; min-width: 250px;">User Task</th>
                            <th style="padding: 10px 8px; text-align: left; font-weight: 600; white-space: nowrap;">Type</th>
                            <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Rule</th>
                            <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Archetype</th>
                            <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Why L1</th>
                            <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Why L2</th>
                            <th style="padding: 10px 8px; text-align: left; font-weight: 600;">What Cat</th>
                            <th style="padding: 10px 8px; text-align: left; font-weight: 600;">What Subcat</th>
                            <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Colour</th>
                            <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Shape</th>
                            <th style="padding: 10px 8px; text-align: left; font-weight: 600;">Position</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.filteredData.length > 0 ? this.filteredData.map((row, index) => `
                            <tr style="${index % 2 === 0 ? 'background: #fafbfc;' : 'background: white;'}">
                                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row.task_ID || ''}</td>
                                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1; font-weight: 500;">${row.paper_ID || ''}</td>
                                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;" title="${(row['User Task'] || '').replace(/"/g, '&quot;')}">${row['User Task'] || ''}</td>
                                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row['Task Type (network, geospatial, temporal, neither, all)'] || ''}</td>
                                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row.Rule || ''}</td>
                                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row.Archetype || ''}</td>
                                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row['Why L1 Action'] || ''}</td>
                                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row['Why L2 Action'] || ''}</td>
                                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row['What Cat.'] || ''}</td>
                                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row['What Subcat.'] || ''}</td>
                                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1; text-align: center;">${this.formatVisualChannel(row.Colour)}</td>
                                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1; text-align: center;">${this.formatVisualChannel(row.Shape)}</td>
                                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1; text-align: center;">${this.formatVisualChannel(row.Position)}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="13" style="padding: 20px; text-align: center; color: #666;">No tasks found matching filters...</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;

        // Make sure it's visible
        tableContainer.style.display = 'block';

        // Add event listeners for filters
        this.attachFilterListeners();
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
        document.getElementById('filter-paper')?.addEventListener('change', this.boundApplyFilters);
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

        const searchTerm = document.getElementById('search-all')?.value.toLowerCase() || '';
        const paperFilter = document.getElementById('filter-paper')?.value || '';
        const typeFilter = document.getElementById('filter-type')?.value || '';
        const archetypeFilter = document.getElementById('filter-archetype')?.value || '';
        const whyL1Filter = document.getElementById('filter-whyl1')?.value || '';
        const whyL2Filter = document.getElementById('filter-whyl2')?.value || '';
        const whatCatFilter = document.getElementById('filter-whatcat')?.value || '';
        const whatSubcatFilter = document.getElementById('filter-whatsubcat')?.value || '';

        this.filteredData = this.allTasksData.filter(row => {
            // Search all columns
            if (searchTerm) {
                const rowText = Object.values(row).join(' ').toLowerCase();
                if (!rowText.includes(searchTerm)) return false;
            }

            // Apply individual filters
            if (paperFilter && row.paper_ID !== paperFilter) return false;
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

        const tbody = tableContainer.querySelector('tbody');
        if (!tbody) return;

        // Update count in header
        const header = tableContainer.querySelector('h2');
        if (header) {
            header.innerHTML = `Visualisation Tasks (${this.filteredData.length} of ${this.allTasksData.length} tasks)`;
        }

        // Update table rows
        tbody.innerHTML = this.filteredData.length > 0 ? this.filteredData.map((row, index) => `
            <tr style="${index % 2 === 0 ? 'background: #fafbfc;' : 'background: white;'}">
                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row.task_ID || ''}</td>
                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1; font-weight: 500;">${row.paper_ID || ''}</td>
                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;" title="${(row['User Task'] || '').replace(/"/g, '&quot;')}">${row['User Task'] || ''}</td>
                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row['Task Type (network, geospatial, temporal, neither, all)'] || ''}</td>
                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row.Rule || ''}</td>
                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row.Archetype || ''}</td>
                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row['Why L1 Action'] || ''}</td>
                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row['Why L2 Action'] || ''}</td>
                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row['What Cat.'] || ''}</td>
                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1;">${row['What Subcat.'] || ''}</td>
                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1; text-align: center;">${this.formatVisualChannel(row.Colour)}</td>
                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1; text-align: center;">${this.formatVisualChannel(row.Shape)}</td>
                <td style="padding: 8px; color: #333; border-bottom: 1px solid #ecf0f1; text-align: center;">${this.formatVisualChannel(row.Position)}</td>
            </tr>
        `).join('') : '<tr><td colspan="13" style="padding: 20px; text-align: center; color: #666;">No tasks found matching filters...</td></tr>';
    }

    // Update filter options based on current filtered data
    updateFilterOptions() {
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

        // Get all possible options from all data
        const allPapers = [...new Set(this.allTasksData.map(row => row.paper_ID))].filter(v => v).sort();
        const allTypes = [...new Set(this.allTasksData.map(row => row['Task Type (network, geospatial, temporal, neither, all)']))].filter(v => v).sort();
        const allArchetypes = [...new Set(this.allTasksData.map(row => row.Archetype))].filter(v => v).sort();
        const allWhyL1 = [...new Set(this.allTasksData.map(row => row['Why L1 Action']))].filter(v => v).sort();
        const allWhyL2 = [...new Set(this.allTasksData.map(row => row['Why L2 Action']))].filter(v => v).sort();
        const allWhatCat = [...new Set(this.allTasksData.map(row => row['What Cat.']))].filter(v => v).sort();
        const allWhatSubcat = [...new Set(this.allTasksData.map(row => row['What Subcat.']))].filter(v => v).sort();

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
        updateSelect('filter-paper', allPapers, availablePapers, currentPaper);
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
        document.getElementById('filter-paper').value = '';
        document.getElementById('filter-type').value = '';
        document.getElementById('filter-archetype').value = '';
        document.getElementById('filter-whyl1').value = '';
        document.getElementById('filter-whyl2').value = '';
        document.getElementById('filter-whatcat').value = '';
        document.getElementById('filter-whatsubcat').value = '';

        // Reset filtered data to all data
        this.filteredData = [...this.allTasksData];

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