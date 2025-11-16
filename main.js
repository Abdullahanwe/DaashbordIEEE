let applications = [];
let currentPage = 1;
const itemsPerPage = 10;
let filteredData = [];

// دالة لجلب البيانات من API
async function fetchData() {
    const tableBody = document.getElementById('tableBody');
    const errorMessage = document.getElementById('errorMessage');
    
    try {
        tableBody.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading data from API...</p>
            </div>
        `;
        
        errorMessage.style.display = 'none';
        
        const response = await fetch('https://omarmuhammed.pythonanywhere.com/api/applications');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        if (data.applications && Array.isArray(data.applications)) {
            applications = data.applications;
            filteredData = [...applications];
            renderTable();
        } else {
            throw new Error('Invalid data format received from API');
        }
        
    } catch (error) {
        console.error('Error fetching data:', error);
        errorMessage.textContent = `Error loading data: ${error.message}`;
        errorMessage.style.display = 'block';
        
        tableBody.innerHTML = `
            <div class="no-data">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <p>Failed to load data. Please try again later.</p>
            </div>
        `;
    }
}

// دالة لعرض البيانات في الجدول
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    
    if (filteredData.length === 0) {
        tableBody.innerHTML = '<div class="table-row no-data"><div>No applications found</div></div>';
        renderPagination(0);
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    pageData.forEach(app => {
        const row = document.createElement('div');
        row.className = 'table-row';
        
        const createdAt = new Date(app.submittedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        row.innerHTML = `
            <div>${app.id}</div>
            <div>${app.fullName}</div>
            <div>${app.email}</div>
            <div>${app.phone}</div>
            <div>${app.faculty}</div>
            <div>
                ${app.cvFile ? 
                    `<a href="https://omarmuhammed.pythonanywhere.com/api/uploads/${app.cvFile}" target="_blank">
                        Download CV
                    </a>` : 
                    'No CV'
                }
            </div>
            <div>${createdAt}</div>
        `;
        tableBody.appendChild(row);
    });

    renderPagination(filteredData.length);
}

// دالة لعرض أزرار الترقيم
function renderPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            renderTable();
        };
        pagination.appendChild(pageBtn);
    }
}

// البحث في البيانات
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    filteredData = applications.filter(app => 
        app.fullName.toLowerCase().includes(searchTerm) ||
        app.email.toLowerCase().includes(searchTerm) ||
        app.phone.toLowerCase().includes(searchTerm) ||
        app.faculty.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    renderTable();
});

// زر تحديث البيانات
document.getElementById('refreshBtn').addEventListener('click', fetchData);

// تحميل البيانات عند بدء الصفحة
document.addEventListener('DOMContentLoaded', fetchData);
