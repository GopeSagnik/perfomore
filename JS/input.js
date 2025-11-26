// js/input.js
import { db, COLLECTIONS, collection, addDoc, getDocs, query, orderBy, where, doc, updateDoc } from './config.js';

const dailyLogForm = document.getElementById('daily-log-form');
const employeeSelect = document.getElementById('employee-name-select');
const dateInput = document.getElementById('date-input');
const today = new Date().toISOString().split('T')[0];

let editingLogId = null;

const populateEmployeeDropdown = async () => {
    employeeSelect.innerHTML = '<option value="" disabled selected>Select your name...</option>';

    try {
        const q = query(collection(db, COLLECTIONS.EMPLOYEES), orderBy("name"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const employee = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = employee.name;
            option.dataset.name = employee.name;
            employeeSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error populating employee dropdown:", error);
        const option = document.createElement('option');
        option.textContent = `Error: ${error.message}`;
        employeeSelect.appendChild(option);
    }
};

const handleLogSubmission = async (e) => {
    e.preventDefault();

    const selectedOption = employeeSelect.options[employeeSelect.selectedIndex];

    const payload = {
        employeeId: selectedOption.value,
        employeeName: selectedOption.dataset.name,
        dateSubmitted: dateInput.value,
        ticketNumber: document.getElementById('ticket-number-input').value.trim(),
        workDone: document.getElementById('work-done-input').value.trim(),
        blockers: document.getElementById('blockers-input').value.trim(),
        timestamp: new Date()
    };

    if (!payload.employeeId || !payload.employeeName) {
        alert("Please select your name from the dropdown.");
        return;
    }

    const submitButton = dailyLogForm.querySelector('button[type="submit"]');

    try {
        submitButton.textContent = editingLogId ? 'Updating...' : 'Submitting...';
        submitButton.disabled = true;

        // CHECK: Restrict duplicate entries (only if NOT editing)
        if (!editingLogId) {
            const q = query(
                collection(db, COLLECTIONS.DAILY_LOGS),
                where("employeeId", "==", payload.employeeId),
                where("dateSubmitted", "==", payload.dateSubmitted)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                alert(`Log already exists for ${payload.employeeName} on ${payload.dateSubmitted}. Please edit the existing log instead.`);
                submitButton.textContent = 'Submit Daily Log';
                submitButton.disabled = false;
                return;
            }
        }

        if (editingLogId) {
            const logRef = doc(db, COLLECTIONS.DAILY_LOGS, editingLogId);
            await updateDoc(logRef, payload);
            console.log("Log Updated with ID: ", editingLogId);
            alert(`Successfully updated log for ${payload.employeeName} on ${payload.dateSubmitted}!`);

            editingLogId = null;
            submitButton.textContent = 'Submit Daily Log';
        } else {
            const docRef = await addDoc(collection(db, COLLECTIONS.DAILY_LOGS), payload);
            console.log("Log Submitted with ID: ", docRef.id);
            alert(`Successfully submitted log for ${payload.employeeName} on ${payload.dateSubmitted}!`);
        }

        document.getElementById('ticket-number-input').value = '';
        document.getElementById('work-done-input').value = '';
        document.getElementById('blockers-input').value = '';

    } catch (error) {
        console.error("Submission Failed:", error);
        alert(`An error occurred. See console. Error: ${error.message || 'Unknown Error'}`);
    } finally {
        if (!editingLogId) {
            submitButton.textContent = 'Submit Daily Log';
        }
        submitButton.disabled = false;
    }
};

const initializeInput = () => {
    if (dateInput) dateInput.value = today;

    populateEmployeeDropdown();

    if (dailyLogForm) {
        dailyLogForm.addEventListener('submit', handleLogSubmission);
    }

    const refreshBtn = document.getElementById('refresh-employees-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            populateEmployeeDropdown();
            alert('Employee list refreshed!');
        });
    }

    document.addEventListener('editLog', (e) => {
        const logData = e.detail;
        console.log("Editing Log:", logData);

        editingLogId = logData.id;

        dateInput.value = logData.dateSubmitted;

        for (let i = 0; i < employeeSelect.options.length; i++) {
            if (employeeSelect.options[i].value === logData.employeeId) {
                employeeSelect.selectedIndex = i;
                break;
            }
        }

        document.getElementById('ticket-number-input').value = logData.ticketNumber || '';
        document.getElementById('work-done-input').value = logData.workDone || '';
        document.getElementById('blockers-input').value = logData.blockers || '';

        const submitButton = dailyLogForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Update Log';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

export { initializeInput };