// CSV Table Handler for Energy Network Visualisations

console.log('Loading CSV Handler Script...');

class CSVTableHandler {
    constructor() {
        console.log('Creating CSVTableHandler instance');
        this.csvData = {};
        this.filteredData = {};
        this.sortState = {};
        this.paperData = {};
        this.visualChannelColumns = [
            'Animation', 'Colour', 'Fill (Coverage)', 'Orientation', 'Position',
            'Saturation/Luminance', 'Shape', 'Size', 'Text', 'Texture'
        ];

        // Bind methods
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.showSidebar = this.showSidebar.bind(this);
        this.closeSidebar = this.closeSidebar.bind(this);

        this.init();
    }

    init() {
        console.log('Initializing CSV Handler');
        this.loadPaperData();
        this.setupEventListeners();
    }

    // Load energynetworks.csv to map paper data
    async loadPaperData() {
        try {
            const response = await fetch('energynetworks.csv');
            const text = await response.text();
            const rows = d3.csvParse(text);

            rows.forEach(row => {
                if (row.image) {
                    this.paperData[row.image] = row;
                }
            });

            console.log('Paper data loaded:', Object.keys(this.paperData).length, 'papers');
        } catch (error) {
            console.error('Error loading paper data:', error);
        }
    }

    // Add CSV buttons to paper cards
    addCSVButtons() {
        console.log('Adding CSV buttons to cards...');

        const container = document.querySelector('#container');
        if (!container) {
            console.log('Container not found');
            return;
        }

        // Find all images in the container
        const images = container.querySelectorAll('img');
        console.log(`Found ${images.length} images`);

        let buttonsAdded = 0;
        images.forEach((img, index) => {
            // Find the parent element that represents the card
            let card = img.parentElement;

            // Go up the DOM tree if needed to find a suitable container
            while (card && card.parentElement !== container && !card.classList.contains('grid-item')) {
                card = card.parentElement;
            }

            if (!card) {
                console.log(`Image ${index}: Could not find card container`);
                return;
            }

            // Check if button already exists
            if (card.querySelector('.csv-button')) {
                console.log(`Image ${index}: Button already exists`);
                return;
            }

            // Extract paper ID from image filename
            const imgSrc = img.src;
            const filename = imgSrc.split('/').pop();
            const paperId = filename.split('.')[0];

            console.log(`Image ${index}: Paper ID = ${paperId}`);

            // Create button
            const button = document.createElement('button');
            button.className = 'csv-button';
            button.dataset.paperId = paperId;
            button.textContent = 'View Tasks';
            button.style.display = 'block';
            button.style.margin = '10px auto';
            button.style.padding = '8px 16px';
            button.style.backgroundColor = '#2c3e50';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';
            button.style.fontSize = '14px';

            // Add hover effect
            button.onmouseover = function () {
                this.style.backgroundColor = '#34495e';
            };
            button.onmouseout = function () {
                this.style.backgroundColor = '#2c3e50';
            };

            // Add button to card
            card.appendChild(button);
            buttonsAdded++;
            console.log(`Added button to card ${index}`);
        });

        console.log(`Total buttons added: ${buttonsAdded}`);

        // FIX MASONRY LAYOUT WITH EXACT SETTINGS FROM script.js
        if (buttonsAdded > 0) {
            setTimeout(() => {
                console.log('Refreshing Masonry with correct settings...');

                // Use the exact same settings as script.js
                imagesLoaded(".grid", function () {
                    // If there's an existing Masonry instance, destroy it first
                    if (window.msnry) {
                        console.log('Destroying old Masonry instance...');
                        window.msnry.destroy();
                    }

                    // Recreate with the exact same configuration
                    var elem = document.querySelector(".grid");
                    window.msnry = new Masonry(elem, {
                        itemSelector: ".grid-item",
                        columnWidth: 241,
                        gutter: 15
                    });

                    console.log('Masonry layout refreshed with correct settings');
                });
            }, 100);
        }




        return buttonsAdded;
    }

    // Setup event listeners
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('csv-button')) {
                this.handleButtonClick(e.target);
            }
            if (e.target.classList.contains('close-sidebar')) {
                this.closeSidebar();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSidebar();
            }
        });
    }

    // Handle button click
    async handleButtonClick(button) {
        const paperId = button.dataset.paperId;
        console.log('Loading tasks for paper:', paperId);

        button.disabled = true;
        button.textContent = 'Loading...';

        try {
            const data = await this.loadCSVData(paperId);
            if (data.length > 0) {
                this.showSidebar(paperId, data);
            } else {
                alert(`No tasks found for paper: ${paperId}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error loading data. Check console for details.');
        } finally {
            button.disabled = false;
            button.textContent = 'View Tasks';
        }
    }

    // Load CSV data
    async loadCSVData(paperId) {
        if (this.csvData[paperId]) {
            return this.csvData[paperId];
        }

        const response = await fetch('literature_tasks.csv');
        const text = await response.text();
        const allData = d3.csvParse(text);

        const paperData = allData.filter(row => row.paper_ID === paperId);

        if (paperData.length === 0) {
            console.log('No data found for paper_ID:', paperId);
            console.log('Available paper_IDs:', [...new Set(allData.map(row => row.paper_ID))].slice(0, 10));
        }

        this.csvData[paperId] = paperData;
        this.filteredData[paperId] = [...paperData];

        return paperData;
    }

    // Show sidebar
    showSidebar(paperId, data) {
        this.closeSidebar();

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'table-sidebar-backdrop';
        backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        z-index: 999;
    `;
        backdrop.onclick = () => this.closeSidebar();

        // Create sidebar
        const sidebar = document.createElement('div');
        sidebar.className = 'table-sidebar';
        sidebar.style.cssText = `
        position: fixed;
        top: 0;
        right: -50%;
        width: 50%;
        height: 100%;
        background-color: white;
        z-index: 1000;
        box-shadow: -4px 0 20px rgba(0,0,0,0.2);
        transition: right 0.3s ease-in-out;
        overflow-y: auto;
    `;

        // Create content - FIXED: Added color: black to table text
        sidebar.innerHTML = `
        <div style="background-color: #2c3e50; color: white; padding: 20px;">
            <button class="close-sidebar" style="float: right; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
            <h2 style="margin: 0;">Visualisation Tasks</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Paper: ${paperId}</p>
        </div>
        <div style="padding: 20px; color: #333;">
            <p style="color: #333; font-weight: bold;">Found ${data.length} tasks</p>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #ecf0f1;">
                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #bdc3c7; color: #2c3e50;">Task ID</th>
                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #bdc3c7; color: #2c3e50;">User Task</th>
                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #bdc3c7; color: #2c3e50;">Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #ecf0f1; color: #333;">${row.task_ID || ''}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ecf0f1; color: #333;">${row['User Task'] || ''}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #ecf0f1; color: #333;">${row['Task Type (network, geospatial, temporal, neither, all)'] || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

        // Add to DOM
        document.body.appendChild(backdrop);
        document.body.appendChild(sidebar);

        // Trigger animation
        setTimeout(() => {
            backdrop.style.display = 'block';
            sidebar.style.right = '0';
        }, 10);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    // Close sidebar
    closeSidebar() {
        const sidebar = document.querySelector('.table-sidebar');
        const backdrop = document.querySelector('.table-sidebar-backdrop');

        if (sidebar) {
            sidebar.style.right = '-50%';
            backdrop.style.display = 'none';

            setTimeout(() => {
                sidebar.remove();
                backdrop.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }
}

// Initialize when DOM is ready
console.log('Setting up initialization...');

function initializeCSVHandler() {
    console.log('Initializing CSV Handler...');

    // Create instance
    const csvHandler = new CSVTableHandler();
    window.csvHandler = csvHandler;

    // Create global function for manual trigger
    window.addCSVButtons = function () {
        console.log('Manually adding CSV buttons...');
        return csvHandler.addCSVButtons();
    };

    // Try to add buttons after delays
    const tryAddButtons = () => {
        const images = document.querySelectorAll('#container img');
        if (images.length > 0 && document.querySelectorAll('.csv-button').length === 0) {
            console.log(`Found ${images.length} images, adding buttons...`);
            csvHandler.addCSVButtons();
            return true;
        }
        return false;
    };

    // Try multiple times
    setTimeout(() => tryAddButtons(), 500);
    setTimeout(() => tryAddButtons(), 1000);
    setTimeout(() => tryAddButtons(), 2000);
    setTimeout(() => tryAddButtons(), 3000);
    setTimeout(() => tryAddButtons(), 5000);

    console.log('CSV Handler ready. Use window.addCSVButtons() to manually add buttons.');
}

// Initialize on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCSVHandler);
} else {
    // DOM already loaded
    initializeCSVHandler();
}

console.log('CSV Handler script loaded successfully');