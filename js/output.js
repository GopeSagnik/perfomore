// js/output.js
import { db, COLLECTIONS, collection, getDocs, query, where, orderBy } from './config.js';

const dateFilter = document.getElementById('report-date');
const refreshBtn = document.getElementById('refresh-report');
const reportTableBody = document.querySelector('#work-report-table tbody');
const reportTableHead = document.querySelector('#work-report-table thead tr');
const copyImageBtn = document.getElementById('copy-image-btn');

// Ensure "Actions" header exists
const ensureActionsHeader = () => {
    if (!reportTableHead) return;
    const headers = reportTableHead.querySelectorAll('th');
    if (headers[headers.length - 1].textContent !== 'Actions') {
        const th = document.createElement('th');
        th.textContent = 'Actions';
        reportTableHead.appendChild(th);
    }
};

const loadReportTable = async () => {
    const selectedDate = dateFilter.value;
    if (!selectedDate) return;

    ensureActionsHeader();

    // Update Report Header
    const reportHeader = document.getElementById('report-header');
    if (reportHeader) {
        const [year, month, day] = selectedDate.split('-');
        reportHeader.textContent = `${month}/${day}/${year} Standard Tracker`;
    }

    reportTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>';

    try {
        // Fetch all employees
        const employeesQuery = query(collection(db, COLLECTIONS.EMPLOYEES), orderBy("name"));
        const employeesSnapshot = await getDocs(employeesQuery);

        // Fetch logs for the selected date
        const logsQuery = query(
            collection(db, COLLECTIONS.DAILY_LOGS),
            where("dateSubmitted", "==", selectedDate)
        );
        const logsSnapshot = await getDocs(logsQuery);

        // Create a map of logs by employeeId for quick lookup
        const logsMap = {};
        logsSnapshot.forEach((doc) => {
            const logData = doc.data();
            logsMap[logData.employeeId] = { id: doc.id, ...logData };
        });

        reportTableBody.innerHTML = '';

        if (employeesSnapshot.empty) {
            reportTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No employees found. Please add employees in the Manage tab.</td></tr>';
            return;
        }

        // Create rows for all employees
        const employees = [];
        employeesSnapshot.forEach((doc) => {
            employees.push({ id: doc.id, name: doc.data().name });
        });

        employees.sort((a, b) => a.name.localeCompare(b.name));

        employees.forEach((employee) => {
            const logData = logsMap[employee.id] || {}; // Get log data or empty object
            const row = document.createElement('tr');

            // If no log exists, add a subtle visual indicator
            if (!logData.employeeId) {
                row.style.opacity = '0.5';
            }

            // Name
            const nameCell = document.createElement('td');
            nameCell.textContent = employee.name;
            row.appendChild(nameCell);

            // Ticket
            const ticketCell = document.createElement('td');
            ticketCell.textContent = logData.ticketNumber || '-';
            row.appendChild(ticketCell);

            // Work Done
            const workCell = document.createElement('td');
            workCell.className = 'wrap-text';
            workCell.textContent = logData.workDone || '-';
            row.appendChild(workCell);

            // Blockers
            const blockerCell = document.createElement('td');
            blockerCell.className = 'wrap-text';
            blockerCell.textContent = logData.blockers || '-';
            row.appendChild(blockerCell);

            // Actions (Edit/Add Button)
            const actionCell = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.textContent = logData.employeeId ? 'Edit' : 'Add';
            editBtn.className = 'btn btn-secondary';
            editBtn.style.padding = '0.3rem 0.8rem';
            editBtn.style.fontSize = '0.8rem';

            editBtn.onclick = () => {
                const event = new CustomEvent('editLog', {
                    detail: {
                        id: logData.id || null,
                        employeeId: employee.id,
                        employeeName: employee.name,
                        dateSubmitted: selectedDate,
                        ticketNumber: logData.ticketNumber || '',
                        workDone: logData.workDone || '',
                        blockers: logData.blockers || ''
                    }
                });
                document.dispatchEvent(event);

                const inputTabBtn = document.querySelector('.tab-button[data-tab="input"]');
                if (inputTabBtn) inputTabBtn.click();
            };

            actionCell.appendChild(editBtn);
            row.appendChild(actionCell);
            reportTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading report:", error);
        reportTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: red;">Error loading data: ${error.message}</td></tr>`;
    }
};

const copyTableAsImage = () => {
    const tableElement = document.querySelector('.report-container');
    if (!tableElement) return;

    html2canvas(tableElement, {
        backgroundColor: '#121212',
        scale: 2
    }).then(canvas => {
        canvas.toBlob(blob => {
            if (!blob) {
                alert("Failed to capture image.");
                return;
            }
            navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
                alert("Report copied to clipboard as image!");
            }).catch(err => {
                console.error("Clipboard write failed:", err);
                alert("Failed to copy image to clipboard.");
            });
        });
    });
};

const initializeOutput = () => {
    const today = new Date().toISOString().split('T')[0];
    if (dateFilter) dateFilter.value = today;

    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadReportTable);
    }

    if (copyImageBtn) {
        copyImageBtn.addEventListener('click', copyTableAsImage);
    }
};

export { initializeOutput, loadReportTable };
