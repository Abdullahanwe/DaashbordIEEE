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
                        <i class="fas fa-spinner"></i>
                        <p>Loading data from API...</p>
                    </div>
                `;
                
                errorMessage.style.display = 'none';
                
                const response = await fetch('https://ieee.wuaze.com/api/data');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    applications = data;
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
                
                // تنسيق التاريخ
                const createdAt = new Date(app.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                // استخراج اسم الملف من المسار
                const fileName = app.file ? app.file.split('/').pop() : 'No file';
                
                row.innerHTML = `
                    <div>${app.id}</div>
                    <div>${app.name}</div>
                    <div>${app.email}</div>
                    <div>${app.phone}</div>
                    <div>${app.collage}</div>
                    <div>
                        ${app.file ? 
                            `<a href="https://ieee.wuaze.com/${app.file}" target="_blank" class="file-link" title="Download CV">
                                <i class="fas fa-file-pdf"></i> ${fileName}
                            </a>` : 
                            'No file'
                        }
                    </div>
                    <div>${createdAt}</div>
                    <div class="actions">
                        <button class="action-btn view-btn" onclick="viewApplication(${app.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn download-btn" onclick="downloadCV('${app.file}')" title="Download CV" ${!app.file ? 'disabled' : ''}>
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteApplication(${app.id})" title="Delete">
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
                alert(`Application Details:\n\nID: ${app.id}\nName: ${app.name}\nEmail: ${app.email}\nPhone: ${app.phone}\nCollege: ${app.collage}\nCreated: ${new Date(app.created_at).toLocaleString()}`);
            }
        }

        // دالة لتحميل السيرة الذاتية
        function downloadCV(filePath) {
            if (filePath) {
                const fullUrl = `https://ieee.wuaze.com/${filePath}`;
                window.open(fullUrl, '_blank');
            }
        }

        // دالة لحذف الطلب
        function deleteApplication(id) {
            if (confirm('Are you sure you want to delete this application?')) {
                // هنا يمكنك إضافة كود لحذف البيانات من الـ API
                alert(`Application with ID ${id} would be deleted (API integration required)`);
                // بعد الحذف الناجح، يمكنك إعادة تحميل البيانات
                // fetchData();
            }
        }

        // البحث في البيانات
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filteredData = applications.filter(app => 
                app.name.toLowerCase().includes(searchTerm) ||
                app.email.toLowerCase().includes(searchTerm) ||
                app.phone.toLowerCase().includes(searchTerm) ||
                app.collage.toLowerCase().includes(searchTerm)
            );
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

            const headers = ['ID', 'Name', 'Email', 'Phone', 'College', 'CV File', 'Created At'];
            const csvContent = [
                headers.join(','),
                ...dataToExport.map(app => [
                    app.id,
                    `"${app.name}"`,
                    `"${app.email}"`,
                    `"${app.phone}"`,
                    `"${app.collage}"`,
                    `"${app.file}"`,
                    `"${new Date(app.created_at).toLocaleDateString()}"`
                ].join(','))
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