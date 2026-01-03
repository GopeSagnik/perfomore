# Perfomore - Project Documentation

## 1. Project Overview
**Perfomore** is a web-based "Daily Standard Tracker" application designed for teams to log their daily work, blockers, and ticket numbers. It provides a consolidated view for managers to track progress and generates reports that can be easily shared.

## 2. Technology Stack
*   **Frontend:** HTML5, CSS3 (Custom Dark Theme), JavaScript (ES6 Modules).
*   **Backend:** Google Firebase Firestore (NoSQL Database).
*   **Hosting:** Google Firebase Hosting.
*   **Libraries:**
    *   `html2canvas`: For capturing the report table as an image.
    *   `Google Fonts`: Roboto and Inter fonts.

## 3. Project Structure
```
d:/Projects/perfomore/
├── css/
│   └── style.css       # Global styles, dark theme, and responsive design.
├── js/
│   ├── app.js          # Main entry point. Initializes modules.
│   ├── config.js       # Firebase configuration and Firestore exports.
│   ├── input.js        # Logic for the "Input Log" tab.
│   ├── manage.js       # Logic for the "Manage" tab (Admin).
│   ├── output.js       # Logic for the "View Report" tab.
│   └── ui.js           # Shared UI utilities (Tab switching).
├── index.html          # Main HTML structure (Single Page Application).
├── firebase.json       # Firebase Hosting configuration.
├── firestore.rules     # Firestore security rules.
└── favic.png           # Application Favicon.
```

## 4. Data Model (Firestore)
The application uses two main collections in Cloud Firestore:

### `employees`
Stores the list of team members.
*   `name` (string): Full name of the employee.
*   `isActive` (boolean): Status flag (default: true).

### `daily_logs`
Stores the individual work submissions.
*   `employeeId` (string): Reference ID of the employee document.
*   `employeeName` (string): Name of the employee (snapshot).
*   `dateSubmitted` (string): Date of the log (YYYY-MM-DD).
*   `ticketNumber` (string): Ticket IDs (e.g., JIRA-123).
*   `workDone` (string): Description of tasks completed.
*   `blockers` (string): Any dependencies or obstacles.
*   `timestamp` (timestamp): Server timestamp of submission.

## 5. Application Modules

### `js/app.js`
*   **Role:** Application Bootstrapper.
*   **Workflow:**
    1.  Listens for `DOMContentLoaded`.
    2.  Initializes Tab Listeners (`ui.js`).
    3.  Initializes Feature Modules (`input`, `output`, `manage`).
    4.  Sets the default active tab to 'input'.

### `js/config.js`
*   **Role:** Configuration & Database Connection.
*   **Details:**
    *   Imports Firebase SDK (v10.13.0).
    *   Exports initialized `db` instance and Firestore helper functions (`addDoc`, `getDocs`, etc.) to avoid repeated imports in other files.

### `js/ui.js`
*   **Role:** UI Utility Manager.
*   **Functions:**
    *   `switchTab(targetTabId)`: Hides all sections and shows the target one. Dispatches a `tabChanged` custom event.
    *   `initializeTabListeners()`: Attaches click handlers to navigation buttons.

### `js/input.js`
*   **Role:** Data Entry Controller.
*   **Key Functions:**
    *   `populateEmployeeDropdown()`: Fetches employees from Firestore to populate the `<select>` menu.
    *   `handleLogSubmission(e)`:
        *   Validates input.
        *   Checks for duplicate entries for the same user/date (if creating new).
        *   Saves data to `daily_logs` collection.
    *   `initializeInput()`: Sets up event listeners and default date (today).
    *   **Event Listener:** Listens for `editLog` event to populate the form with existing data for editing.

### `js/output.js`
*   **Role:** Report Generator.
*   **Key Functions:**
    *   `loadReportTable()`:
        *   Fetches all employees (to ensure everyone is listed, even if they haven't logged work).
        *   Fetches logs for the selected date.
        *   Maps logs to employees and renders the HTML table.
        *   Updates the dynamic header with the selected date.
    *   `copyTableAsImage()`: Uses `html2canvas` to screenshot the `.report-container` and copy it to the clipboard.
    *   `initializeOutput()`: Sets up listeners for the Date Picker and "Copy as Image" button.

### `js/manage.js`
*   **Role:** Administration Controller.
*   **Key Functions:**
    *   `loadEmployeeList()`: Renders the list of employees with "Remove" buttons.
    *   `handleAddEmployee()`: Adds a new document to the `employees` collection.
    *   `handleDeleteEmployee()`: Removes a document from the `employees` collection.
    *   `downloadCSV()`: Fetches **ALL** logs, formats them as a CSV string, and triggers a browser download.
    *   `clearAllLogs()`: **Destructive Action.** Deletes all documents in `daily_logs` collection (requires double confirmation).

## 6. Deployment
The project is configured for **Firebase Hosting**.
*   **Command:** `firebase deploy --only hosting`
*   **Public Directory:** Root (`.`) - *Note: Configured via firebase.json*

## 7. Future Roadmap (AI Features)
*   **AI Summary:** One-click executive summary generation.
*   **Knowledge Graph:** Expert identification based on log history.
*   **Brag Sheet:** Automated performance review highlights.
