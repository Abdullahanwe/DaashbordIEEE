let applications = [];
let currentPage = 1;
const itemsPerPage = 10;
let filteredData = [];
const API_BASE_URL = 'https://omarmuhammed.pythonanywhere.com';

// دالة لجلب البيانات من API
async function fetchData() {
    const tableBody = document.getElementById('tableBody');
    const errorMessage = document.getElementById('errorMessage');
    
    try {
        tableBody.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <p>Loading data from API...</p>
            </div>
        `;
        
        errorMessage.style.display = 'none';
        
        const response = await fetch(`${API_BASE_URL}/api/applications`);
        console.log('Raw Response:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Data:', data);
        
        // معالجة البيانات بناءً على التنسيق الجديد
        if (Array.isArray(data)) {
            // إذا كانت البيانات مصفوفة مباشرة
            applications = data;
            filteredData = [...applications];
            renderTable();
        } else if (data.applications && Array.isArray(data.applications)) {
            // إذا كانت البيانات في شكل {applications: [...]}
            applications = data.applications;
            filteredData = [...applications];
            renderTable();
        } else if (data.data && Array.isArray(data.data)) {
            // إذا كانت البيانات في شكل {data: [...]}
            applications = data.data;
            filteredData = [...applications];
            renderTable();
        } else {
            console.log('Unknown data format:', data);
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
                <button onclick="fetchData()" style="margin-top: 10px; padding: 8px 16px; background: #00629B; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Try Again
                </button>
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
        
        // تنسيق التاريخ - استخدام الحقول الصحيحة بناءً على البيانات
        const dateField = app.created_at || app.submittedAt || app.date;
        const createdAt = dateField ? new Date(dateField).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }) : 'N/A';
        
        // استخراج اسم الملف من المسار
        const fileName = app.cvFile ? app.cvFile.split('/').pop() : 'No file';
        
        // استخدام الأسماء الصحيحة للحقول بناءً على البيانات الفعلية
        const name = app.fullName || app.name || 'N/A';
        const email = app.email || 'N/A';
        const phone = app.phone || 'N/A';
        const college = app.faculty || app.collage || 'N/A';
        const fileUrl = app.cvFileUrl || (app.cvFile ? `${API_BASE_URL}/api/uploads/${app.cvFile}` : null);
        
        row.innerHTML = `
            <div>${app.id || 'N/A'}</div>
            <div>${name}</div>
            <div>${email}</div>
            <div>${phone}</div>
            <div>${college}</div>
            <div>
                ${fileUrl ? 
                    `<a href="${fileUrl}" target="_blank" class="file-link" title="Open CV in new tab" onclick="event.stopPropagation()">
                        <i class="fas fa-external-link-alt"></i> ${fileName}
                    </a>` : 
                    'No file'
                }
            </div>
            <div>${createdAt}</div>
            <div class="actions">
                <button class="action-btn view-btn" onclick="viewApplication('${app.id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn download-btn" onclick="downloadCV('${app.cvFile || app.file}')" title="Download CV" ${!fileUrl ? 'disabled' : ''}>
                    <i class="fas fa-download"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteApplication('${app.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
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

// دالة لعرض تفاصيل الطلب
function viewApplication(id) {
    const app = applications.find(a => a.id === id);
    if (app) {
        const name = app.fullName || app.name || 'N/A';
        const email = app.email || 'N/A';
        const phone = app.phone || 'N/A';
        const college = app.faculty || app.collage || 'N/A';
        const dateField = app.created_at || app.submittedAt || app.date;
        const createdAt = dateField ? new Date(dateField).toLocaleString() : 'N/A';
        const status = app.status || 'N/A';
        
        alert(`Application Details:\n\nID: ${app.id}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nCollege: ${college}\nStatus: ${status}\nCreated: ${createdAt}`);
    }
}

// دالة لتحميل السيرة الذاتية في تاب جديد
function downloadCV(filePath) {
    if (filePath) {
        const fullUrl = `${API_BASE_URL}/api/uploads/${filePath}`;
        // فتح الرابط في تاب جديد
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
    } else {
        alert('No CV file available');
    }
}

// دالة لحذف الطلب من الـ API
async function deleteApplication(id) {
    if (!confirm('Are you sure you want to delete this application?')) {
        return;
    }

    try {
        // إظهار مؤشر التحميل
        const deleteBtn = event.target.closest('.delete-btn');
        const originalHTML = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        deleteBtn.disabled = true;

        // إرسال طلب الحذف إلى الـ API
        const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // إزالة التطبيق من المصفوفات المحلية
            applications = applications.filter(app => app.id !== id);
            filteredData = filteredData.filter(app => app.id !== id);
            
            // إعادة عرض الجدول
            renderTable();
            
            // عرض رسالة نجاح
            showMessage('Application deleted successfully!', 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to delete application. Status: ${response.status}`);
        }

    } catch (error) {
        console.error('Error deleting application:', error);
        showMessage(`Error deleting application: ${error.message}`, 'error');
        
        // إعادة تعيين زر الحذف
        const deleteBtn = event.target.closest('.delete-btn');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.disabled = false;
    }
}

// دالة لعرض الرسائل
function showMessage(message, type) {
    let messageDiv = document.getElementById('actionMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'actionMessage';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(messageDiv);
    }

    messageDiv.textContent = message;
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#28a745';
    } else {
        messageDiv.style.backgroundColor = '#dc3545';
    }

    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// البحث في البيانات
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    filteredData = applications.filter(app => {
        const name = (app.fullName || app.name || '').toLowerCase();
        const email = (app.email || '').toLowerCase();
        const phone = (app.phone || '').toLowerCase();
        const college = (app.faculty || app.collage || '').toLowerCase();
        
        return name.includes(searchTerm) ||
               email.includes(searchTerm) ||
               phone.includes(searchTerm) ||
               college.includes(searchTerm);
    });
    currentPage = 1;
    renderTable();
});

// زر تحديث البيانات
document.getElementById('refreshBtn').addEventListener('click', function() {
    fetchData();
});

// زر تصدير البيانات
document.getElementById('exportBtn').addEventListener('click', function() {
    exportToCSV();
});

function exportToCSV() {
    const dataToExport = filteredData.length > 0 ? filteredData : applications;
    
    if (dataToExport.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'College', 'CV File', 'Created At', 'Status'];
    const csvContent = [
        headers.join(','),
        ...dataToExport.map(app => {
            const name = app.fullName || app.name || '';
            const email = app.email || '';
            const phone = app.phone || '';
            const college = app.faculty || app.collage || '';
            const dateField = app.created_at || app.submittedAt || app.date;
            const createdAt = dateField ? new Date(dateField).toLocaleDateString() : '';
            const status = app.status || '';
            
            return [
                app.id,
                `"${name}"`,
                `"${email}"`,
                `"${phone}"`,
                `"${college}"`,
                `"${app.cvFile || app.file}"`,
                `"${createdAt}"`,
                `"${status}"`
            ].join(',');
        })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ieee-applications-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', fetchData);