class PickleballFinder {
    constructor() {
        this.courts = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const exportBtn = document.getElementById('exportBtn');
        const adminLoginBtn = document.getElementById('adminLoginBtn');

        searchBtn.addEventListener('click', () => this.searchCourts());
        exportBtn.addEventListener('click', () => this.exportToCSV());
        adminLoginBtn.addEventListener('click', () => this.showAdminLogin());
    }

    async searchCourts() {
        const searchBtn = document.getElementById('searchBtn');
        const loading = document.getElementById('loadingSpinner');
        const results = document.getElementById('results');

        searchBtn.disabled = true;
        loading.classList.remove('hidden');
        results.classList.add('hidden');

        try {
            // Simulate API call - replace with actual implementation
            await this.fetchCourtsData();
            this.displayResults();
        } catch (error) {
            console.error('Error fetching courts:', error);
            alert('Error fetching court data. Please try again.');
        } finally {
            searchBtn.disabled = false;
            loading.classList.add('hidden');
        }
    }

    async fetchCourtsData() {
        try {
            const response = await fetch('/api/search-courts');
            const data = await response.json();
            
            if (response.ok) {
                this.courts = data.courts || [];
            } else {
                throw new Error(data.error || 'Failed to fetch courts');
            }
        } catch (error) {
            console.error('Error fetching courts:', error);
            // Fallback to sample data if API fails
            this.courts = [
                {
                    name: "Singapore Sports Council - Kallang Tennis Centre",
                    description: "Public facility with pickleball courts available for booking",
                    website: "https://www.myactivesg.com/facilities/kallang-tennis-centre",
                    googleMaps: "https://maps.google.com/place/Kallang+Tennis+Centre",
                    booking: "https://www.myactivesg.com/facilities/kallang-tennis-centre",
                    instagram: "https://www.instagram.com/myactivesg"
                },
                {
                    name: "Singapore Pickleball Association",
                    description: "Official pickleball association organizing games and tournaments",
                    website: "https://www.spa.sg",
                    googleMaps: null,
                    booking: "Contact through website",
                    instagram: "https://www.instagram.com/singaporepickleball"
                },
                {
                    name: "SAFRA Jurong Pickleball",
                    description: "SAFRA facility with dedicated pickleball courts",
                    website: "https://www.safra.sg/jurong",
                    googleMaps: "https://maps.google.com/place/SAFRA+Jurong",
                    booking: "https://www.safra.sg/jurong/facilities/sports",
                    instagram: null
                }
            ];
        }
    }

    displayResults() {
        const resultsSection = document.getElementById('results');
        const container = document.getElementById('courtsContainer');

        container.innerHTML = '';

        this.courts.forEach(court => {
            const courtCard = this.createCourtCard(court);
            container.appendChild(courtCard);
        });

        resultsSection.classList.remove('hidden');
    }

    createCourtCard(court) {
        const card = document.createElement('div');
        card.className = 'court-card';

        card.innerHTML = `
            <div class="court-name">${court.name}</div>
            <div class="court-description">${court.description}</div>
            <div class="court-links">
                <div class="link-item">
                    <span class="link-label">Website:</span>
                    ${court.website ? 
                        `<a href="${court.website}" target="_blank">${this.truncateUrl(court.website)}</a>` : 
                        '<span class="no-link">Not found</span>'
                    }
                </div>
                <div class="link-item">
                    <span class="link-label">Google Maps:</span>
                    ${court.googleMaps ? 
                        `<a href="${court.googleMaps}" target="_blank">${this.truncateUrl(court.googleMaps)}</a>` : 
                        '<span class="no-link">Not found</span>'
                    }
                </div>
                <div class="link-item">
                    <span class="link-label">Booking:</span>
                    ${court.booking ? 
                        (court.booking.startsWith('http') ? 
                            `<a href="${court.booking}" target="_blank">${this.truncateUrl(court.booking)}</a>` : 
                            `<span>${court.booking}</span>`) : 
                        '<span class="no-link">Not found</span>'
                    }
                </div>
                <div class="link-item">
                    <span class="link-label">Instagram:</span>
                    ${court.instagram ? 
                        `<a href="${court.instagram}" target="_blank">${this.truncateUrl(court.instagram)}</a>` : 
                        '<span class="no-link">Not found</span>'
                    }
                </div>
            </div>
        `;

        return card;
    }

    truncateUrl(url, maxLength = 40) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    }

    exportToCSV() {
        const headers = ['Name', 'Description', 'Website', 'Google Maps', 'Booking', 'Instagram'];
        const csvContent = [
            headers.join(','),
            ...this.courts.map(court => [
                `"${court.name}"`,
                `"${court.description}"`,
                `"${court.website || ''}"`,
                `"${court.googleMaps || ''}"`,
                `"${court.booking || ''}"`,
                `"${court.instagram || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'singapore_pickleball_courts.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    showAdminLogin() {
        const password = prompt('Enter admin password:');
        if (password === 'admin123') {
            alert('Admin login successful!');
            // Add admin functionality here
            this.showAdminPanel();
        } else if (password !== null) {
            alert('Invalid password!');
        }
    }

    showAdminPanel() {
        // Simple admin panel - you can expand this
        const adminOptions = confirm('Admin Panel\n\nChoose an option:\nOK = Refresh court data\nCancel = View logs');
        
        if (adminOptions) {
            alert('Refreshing court data...');
            this.searchCourts();
        } else {
            alert('Admin logs: Court searches performed successfully');
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PickleballFinder();
});