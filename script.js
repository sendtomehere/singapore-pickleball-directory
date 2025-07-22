let courts = JSON.parse(localStorage.getItem('pickleballCourts')) || [];
let adminMode = false;
let editingCourtId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadCourts();
    setupEventListeners();
});

function setupEventListeners() {
    const courtForm = document.getElementById('courtForm');
    
    // Form submission
    courtForm.addEventListener('submit', addCourt);
    
    // Make admin panel draggable
    makeDraggable();
    
    // Setup tab functionality
    setupTabs();
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const region = this.getAttribute('data-region');
            switchToTab(region);
        });
    });
}

function switchToTab(region) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
        panel.setAttribute('aria-hidden', 'true');
    });
    
    // Add active class to selected tab and panel
    const activeTab = document.querySelector(`[data-region="${region}"].tab-btn`);
    const activePanel = document.querySelector(`#${region}-panel`);
    
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
    activePanel.classList.add('active');
    activePanel.setAttribute('aria-hidden', 'false');
}

function makeDraggable() {
    const adminPanel = document.getElementById('adminPanel');
    const dragHandle = adminPanel.querySelector('.admin-header');
    
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    dragHandle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    
    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        
        if (e.target === dragHandle || dragHandle.contains(e.target)) {
            isDragging = true;
            adminPanel.style.transition = 'none';
        }
    }
    
    function dragMove(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            xOffset = currentX;
            yOffset = currentY;
            
            // Keep panel within viewport bounds
            const rect = adminPanel.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            
            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));
            
            setTranslate(currentX, currentY, adminPanel);
        }
    }
    
    function dragEnd() {
        if (isDragging) {
            isDragging = false;
            adminPanel.style.transition = 'all 0.3s ease';
        }
    }
    
    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
}

function addCourt(event) {
    event.preventDefault();
    
    const courtData = {
        id: editingCourtId || Date.now(),
        region: document.getElementById('regionSelect').value,
        name: document.getElementById('courtName').value,
        address: document.getElementById('courtAddress').value,
        websiteLink: document.getElementById('websiteLink').value,
        bookingLink: document.getElementById('bookingLink').value,
        googleMapsLink: document.getElementById('googleMapsLink').value,
        instagramLink: document.getElementById('instagramLink').value
    };
    
    // Validation
    if (!courtData.region) {
        alert('Please select a region');
        return;
    }
    if (!courtData.name.trim()) {
        alert('Please enter a court name');
        return;
    }
    if (!courtData.address.trim()) {
        alert('Please enter an address');
        return;
    }
    if (!courtData.googleMapsLink.trim()) {
        alert('Please enter a Google Maps link');
        return;
    }

    if (editingCourtId) {
        // Update existing court
        const courtIndex = courts.findIndex(court => court.id === editingCourtId);
        if (courtIndex !== -1) {
            courts[courtIndex] = courtData;
        }
        editingCourtId = null;
        document.getElementById('adminFormTitle').textContent = 'Add New Court (Admin)';
        document.getElementById('submitBtn').textContent = 'Add Court';
        document.getElementById('cancelBtn').style.display = 'none';
    } else {
        // Add new court
        courts.push(courtData);
    }

    localStorage.setItem('pickleballCourts', JSON.stringify(courts));
    loadCourts(); // Refresh all courts
    
    // Reset form
    document.getElementById('courtForm').reset();
    
    // Show success message
    alert(editingCourtId ? 'Court updated successfully!' : 'Court added successfully!');
}

function addCourtToRegion(court) {
    const regionContainer = document.getElementById(`${court.region}-courts`);
    
    const courtItem = document.createElement('div');
    courtItem.className = 'court-item';
    courtItem.setAttribute('data-court-id', court.id);
    
    courtItem.innerHTML = `
        <article itemscope itemtype="https://schema.org/SportsActivityLocation">
            <h4 itemprop="name">🏓 ${court.name}</h4>
            <div class="court-address" itemprop="address">📍 ${court.address}</div>
            <meta itemprop="sport" content="Pickleball">
            <div class="court-links">
                ${court.websiteLink ? `<a href="${court.websiteLink}" target="_blank" rel="noopener noreferrer" itemprop="url" aria-label="Visit ${court.name} official website">🌐 Website</a>` : '<span class="missing-link">🌐 Website: Not Available</span>'}
                ${court.bookingLink ? `<a href="${court.bookingLink}" target="_blank" rel="noopener noreferrer" aria-label="Book court at ${court.name}">📅 Book Online</a>` : '<span class="missing-link">📅 Booking: Not Available</span>'}
                <a href="${court.googleMapsLink}" target="_blank" rel="noopener noreferrer" aria-label="View ${court.name} on Google Maps">📍 Google Maps</a>
                ${court.instagramLink ? `<a href="${court.instagramLink}" target="_blank" rel="noopener noreferrer" aria-label="Follow ${court.name} on Instagram">📷 Instagram</a>` : '<span class="missing-link">📷 Instagram: Not Available</span>'}
                ${adminMode ? `<button onclick="editCourt(${court.id})" class="edit-btn" aria-label="Edit ${court.name}">✏️ Edit</button> <button onclick="deleteCourt(${court.id})" class="delete-btn" aria-label="Delete ${court.name}">🗑️ Delete</button>` : ''}
            </div>
        </article>
    `;
    
    regionContainer.appendChild(courtItem);
}


function loadCourts() {
    // Clear all region containers first
    const regions = ['north', 'east', 'south', 'west', 'central'];
    regions.forEach(region => {
        const container = document.getElementById(`${region}-courts`);
        if (container) {
            container.innerHTML = '';
        }
    });
    
    // Add courts to their respective regions
    courts.forEach(court => {
        if (court.region) {
            addCourtToRegion(court);
        }
    });
    
    // Add empty state messages for regions with no courts
    regions.forEach(region => {
        const container = document.getElementById(`${region}-courts`);
        if (container && container.children.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; font-style: italic;">No courts listed yet</p>';
        }
    });
}


function editCourt(courtId) {
    const court = courts.find(c => c.id === courtId);
    if (court) {
        editingCourtId = courtId;
        
        // Populate form with court data
        document.getElementById('regionSelect').value = court.region;
        document.getElementById('courtName').value = court.name;
        document.getElementById('courtAddress').value = court.address;
        document.getElementById('websiteLink').value = court.websiteLink || '';
        document.getElementById('bookingLink').value = court.bookingLink || '';
        document.getElementById('googleMapsLink').value = court.googleMapsLink;
        document.getElementById('instagramLink').value = court.instagramLink || '';
        
        // Update form UI
        document.getElementById('adminFormTitle').textContent = 'Edit Court (Admin)';
        document.getElementById('submitBtn').textContent = 'Update Court';
        document.getElementById('cancelBtn').style.display = 'inline-block';
        
        // Scroll to form
        document.getElementById('adminPanel').scrollIntoView({ behavior: 'smooth' });
    }
}

function cancelEdit() {
    editingCourtId = null;
    document.getElementById('adminFormTitle').textContent = 'Add New Court (Admin)';
    document.getElementById('submitBtn').textContent = 'Add Court';
    document.getElementById('cancelBtn').style.display = 'none';
    document.getElementById('courtForm').reset();
}

function deleteCourt(courtId) {
    if (confirm('Are you sure you want to delete this court?')) {
        courts = courts.filter(court => court.id !== courtId);
        localStorage.setItem('pickleballCourts', JSON.stringify(courts));
        
        // If we're editing this court, cancel the edit
        if (editingCourtId === courtId) {
            cancelEdit();
        }
        
        // Refresh the display
        loadCourts();
    }
}

// Admin functionality
function showAdminLogin() {
    document.getElementById('adminLogin').style.display = 'flex';
}

function closeAdminLogin() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

function checkPassword() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'pickleballsg2024') {
        adminMode = true;
        document.getElementById('adminPanel').style.display = 'block';
        closeAdminLogin();
        loadCourts(); // Refresh to show delete buttons
        alert('Admin mode activated! You can now add and delete courts.');
    } else {
        alert('Incorrect password');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        adminMode = false;
        document.getElementById('adminPanel').style.display = 'none';
        loadCourts(); // Refresh to hide delete buttons
        alert('Logged out successfully.');
    }
}

// Double-click to show admin login
document.addEventListener('dblclick', function(e) {
    if (!adminMode) {
        showAdminLogin();
    }
});

// Add some sample courts for demonstration
if (courts.length === 0) {
    const sampleCourts = [
        {
            id: 1,
            region: "central",
            name: "Marina Bay Sports Complex",
            address: "1 Marina Bay, Singapore",
            websiteLink: "https://www.marinabay.sg",
            bookingLink: "https://www.marinabay.sg/book",
            googleMapsLink: "https://maps.google.com/maps?q=Marina+Bay+Sports+Complex+Singapore",
            instagramLink: "https://instagram.com/marinabaysg"
        },
        {
            id: 2,
            region: "east",
            name: "East Coast Park Courts",
            address: "East Coast Park, Singapore",
            websiteLink: "https://www.nparks.gov.sg/gardens-parks-and-nature/parks-and-nature-reserves/east-coast-park",
            bookingLink: "",
            googleMapsLink: "https://maps.google.com/maps?q=East+Coast+Park+Singapore",
            instagramLink: "https://instagram.com/eastcoastpark"
        },
        {
            id: 3,
            region: "north",
            name: "Sembawang Sports Hub",
            address: "57 Sembawang Road, Singapore",
            websiteLink: "https://www.myactivesg.com",
            bookingLink: "https://www.myactivesg.com/facilities/sembawang-sports-hub",
            googleMapsLink: "https://maps.google.com/maps?q=Sembawang+Sports+Hub+Singapore",
            instagramLink: ""
        }
    ];
    
    courts = sampleCourts;
    localStorage.setItem('pickleballCourts', JSON.stringify(courts));
}