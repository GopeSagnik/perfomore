// js/manage.js
import { db, COLLECTIONS, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from './config.js';

const newEmployeeInput = document.getElementById('new-employee-name');
const addEmployeeBtn = document.getElementById('add-employee-btn');
const employeeList = document.getElementById('employee-list');
const downloadCsvBtn = document.getElementById('download-csv-btn');

/**
 * Loads employees into the management list.
 */
const loadEmployeeList = async () => {
    if (!employeeList) return;
    employeeList.innerHTML = 'Loading...';

    try {
        const q = query(collection(db, COLLECTIONS.EMPLOYEES), orderBy("name"));
        const querySnapshot = await getDocs(q);

        employeeList.innerHTML = ''; // Clear loading

        querySnapshot.forEach((docSnap) => {
            const employee = docSnap.data();
            const li = document.createElement('li');
            li.className = 'employee-item';
            li.innerHTML = `
                <span>${employee.name}</span>
                <button class="btn-delete" data-id="${docSnap.id}">Remove</button>
            `;
            employeeList.appendChild(li);
        });

        // Add delete listeners
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', handleDeleteEmployee);
        });

    } catch (error) {
        console.error("Error loading employees:", error);
        employeeList.innerHTML = `<li class="error">Error loading employees: ${error.message}. <br>Check console and Firestore Rules.</li>`;
    }
};

/**
 * Adds a new employee.
 */
const handleAddEmployee = async () => {
    const name = newEmployeeInput.value.trim();
    if (!name) return;

    try {
        addEmployeeBtn.disabled = true;
        addEmployeeBtn.textContent = 'Adding...';

        await addDoc(collection(db, COLLECTIONS.EMPLOYEES), {
            name: name,
            isActive: true
        });

        newEmployeeInput.value = '';
        loadEmployeeList(); // Reload list
        alert(`Employee "${name}" added!`);

    } catch (error) {
        console.error("Error adding employee:", error);
        alert(`Failed to add employee. Error: ${error.message}`);
    } finally {
        addEmployeeBtn.disabled = false;
        addEmployeeBtn.textContent = 'Add Employee';
    }
};

/**
 * Deletes an employee.
 */
const handleDeleteEmployee = async (e) => {
    const id = e.target.getAttribute('data-id');
    if (!confirm("Are you sure you want to remove this employee?")) return;

    try {
        await deleteDoc(doc(db, COLLECTIONS.EMPLOYEES, id));
        loadEmployeeList(); // Reload list
    } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Failed to delete employee.");
    }
};

/**
 * Downloads all logs as CSV.
 */
const downloadCSV = async () => {
    try {
        downloadCsvBtn.textContent = 'Generating CSV...';

        const querySnapshot = await getDocs(collection(db, COLLECTIONS.DAILY_LOGS));

        if (querySnapshot.empty) {
            alert("No data to download.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Employee Name,Ticket Number,Work Done,Blockers\n";

        querySnapshot.forEach(doc => {
            const log = doc.data();
            // Escape quotes and handle commas
            const escape = (text) => `"${(text || '').replace(/"/g, '""')}"`;

            const row = [
                log.dateSubmitted,
                log.employeeName,
                log.ticketNumber,
                log.workDone,
                log.blockers
            ].map(escape).join(",");

            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `team_work_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Error downloading CSV:", error);
        alert("Failed to download CSV.");
    } finally {
        downloadCsvBtn.textContent = 'Download Database as CSV';
    }
};

const initializeManage = () => {
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', handleAddEmployee);
    }

    if (downloadCsvBtn) {
        downloadCsvBtn.addEventListener('click', downloadCSV);
    }

    const clearLogsBtn = document.getElementById('clear-logs-btn');
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', clearAllLogs);
    }

    // Load list when tab is switched to manage
    document.addEventListener('tabChanged', (e) => {
        if (e.detail.tabId === 'manage') {
            loadEmployeeList();
        }
    });
};

/**
 * Clears all daily logs from the database with confirmation.
 */
const clearAllLogs = async () => {
    const confirmation = confirm(
        '⚠️ WARNING ⚠️\n\n' +
        'This will permanently delete ALL daily work logs from the database.\n\n' +
        'Employees will NOT be deleted, only their work log entries.\n\n' +
        'This action CANNOT be undone!\n\n' +
        'Are you absolutely sure you want to continue?'
    );

    if (!confirmation) {
        return; // User cancelled
    }

    // Second confirmation for extra safety
    const doubleConfirm = confirm(
        'FINAL CONFIRMATION\n\n' +
        'Click OK to DELETE ALL LOGS permanently.\n' +
        'Click Cancel to abort.'
    );

    if (!doubleConfirm) {
        return; // User cancelled
    }

    try {
        const clearBtn = document.getElementById('clear-logs-btn');
        clearBtn.textContent = 'Deleting...';
        clearBtn.disabled = true;

        // Get all logs
        const logsSnapshot = await getDocs(collection(db, COLLECTIONS.DAILY_LOGS));

        if (logsSnapshot.empty) {
            alert('No logs found to delete.');
            clearBtn.textContent = 'Clear All Logs';
            clearBtn.disabled = false;
            return;
        }

        const totalLogs = logsSnapshot.size;
        let deletedCount = 0;

        // Delete each log
        const deletePromises = [];
        logsSnapshot.forEach((docSnap) => {
            deletePromises.push(deleteDoc(doc(db, COLLECTIONS.DAILY_LOGS, docSnap.id)));
        });

        await Promise.all(deletePromises);
        deletedCount = totalLogs;

        console.log(`Successfully deleted ${deletedCount} logs`);
        alert(`✅ Successfully deleted ${deletedCount} work log(s).\n\nEmployees remain in the system.`);

        clearBtn.textContent = 'Clear All Logs';
        clearBtn.disabled = false;

    } catch (error) {
        console.error("Error clearing logs:", error);
        alert(`❌ Error clearing logs: ${error.message}\n\nCheck console for details.`);

        const clearBtn = document.getElementById('clear-logs-btn');
        clearBtn.textContent = 'Clear All Logs';
        clearBtn.disabled = false;
    }
};

export { initializeManage };
