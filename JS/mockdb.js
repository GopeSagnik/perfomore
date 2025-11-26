// js/mockdb.js

// Mock data to simulate the 'employees' collection
const MOCK_EMPLOYEES = [
    { $id: 'emp_001', name: 'Alice Johnson', isActive: true },
    { $id: 'emp_002', name: 'Bob Smith', isActive: true },
    { $id: 'emp_003', name: 'Charlie Davis', isActive: true },
    { $id: 'emp_004', name: 'Diana Prince', isActive: false }, // Inactive employee
];

// Mock data to simulate the 'daily_logs' collection
let MOCK_DAILY_LOGS = [
    { $id: 'log_001', employeeId: 'emp_001', employeeName: 'Alice Johnson', dateSubmitted: '2025-11-13', ticketNumber: 'JIRA-101', workDone: 'Implemented feature X.', blockers: '' },
    { $id: 'log_002', employeeId: 'emp_002', employeeName: 'Bob Smith', dateSubmitted: '2025-11-13', ticketNumber: '', workDone: 'Reviewed PRs for module Y.', blockers: 'Waiting on design feedback.' },
];

/**
 * Mocks the Appwrite Databases.listDocuments function for the Employees collection.
 * @returns {Promise<Object>} A promise resolving to an object matching Appwrite's response format.
 */
const mockListEmployees = async () => {
    console.log("MOCK DB: Fetching employees...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const activeEmployees = MOCK_EMPLOYEES.filter(emp => emp.isActive);

    return {
        total: activeEmployees.length,
        documents: activeEmployees
    };
};

/**
 * Mocks the Appwrite Databases.createDocument function for the Daily Logs collection.
 * @param {Object} data - The data payload to submit.
 * @returns {Promise<Object>} A promise resolving to the created document.
 */
const mockCreateDailyLog = async (data) => {
    console.log("MOCK DB: Submitting new daily log:", data);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newLog = {
        $id: 'log_' + (MOCK_DAILY_LOGS.length + 1),
        ...data,
        dateSubmitted: data.dateSubmitted || new Date().toISOString().split('T')[0],
    };
    
    MOCK_DAILY_LOGS.push(newLog);
    
    return newLog;
};

/**
 * Mocks the Appwrite Databases.listDocuments function for the Daily Logs collection.
 * @param {Array} queries - A list of Appwrite queries (ignored for mock simplicity).
 * @returns {Promise<Object>} A promise resolving to the list of logs.
 */
const mockListDailyLogs = async (queries = []) => {
    console.log("MOCK DB: Fetching daily logs.");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real mock, we would apply the date filter here. For now, return all.
    return {
        total: MOCK_DAILY_LOGS.length,
        documents: MOCK_DAILY_LOGS.sort((a, b) => b.dateSubmitted.localeCompare(a.dateSubmitted))
    };
};


// ** Global Flag: Set this to true to use the mock functions **
const USE_MOCK_DB = true; 

// --- CRITICAL FIX: EXPOSE TO GLOBAL WINDOW OBJECTS ---
// This resolves the "is not defined" errors in config.js
window.USE_MOCK_DB = USE_MOCK_DB;
window.mockListEmployees = mockListEmployees;
window.mockCreateDailyLog = mockCreateDailyLog;
window.mockListDailyLogs = mockListDailyLogs;
// The extraneous closing brace has been removed.