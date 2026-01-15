# Dashboard Walkthrough Guide

## Overview

The LoanTicks application includes an interactive walkthrough that appears automatically when users first log in. This guide helps new users understand the key features of their dashboard based on their role.

## Features

- **Automatic Display**: Shows on first login for each user role
- **Role-Specific Tours**: Different walkthroughs for customers, employees, and admins
- **Interactive Navigation**: Users can go forward, backward, or skip the tour
- **Progress Tracking**: Visual progress bar shows completion status
- **Persistent Memory**: Uses localStorage to remember if user has completed the tour
- **Smooth Animations**: Highlights elements and scrolls to relevant sections

## User Roles & Tour Steps

### Customer Dashboard (5 steps)
1. **Welcome Banner** - Introduction to the customer dashboard
2. **Loan Statistics** - Overview of active mortgages and financial metrics
3. **Apply Button** - How to start a new loan application
4. **Active Loans** - Viewing current mortgage information
5. **Application Tracker** - Tracking loan application status

### Employee Dashboard (4 steps)
1. **Dashboard Header** - Introduction to employee features
2. **Application Statistics** - Workload overview
3. **Filters** - How to search and filter applications
4. **Application List** - Reviewing and managing applications

### Admin Dashboard (4 steps)
1. **Dashboard Header** - Introduction to admin capabilities
2. **System Overview** - Key metrics and statistics
3. **All Applications** - Managing all loan applications
4. **Employee Management** - Managing team members

## Technical Implementation

### Components
- **`DashboardWalkthrough.tsx`**: Main walkthrough component
- **`CustomerDashboardClient.tsx`**: Client wrapper for customer dashboard
- **`AdminDashboardClient.tsx`**: Client wrapper for admin dashboard
- Employee dashboard uses existing client component

### Data Attributes
Elements are marked with `data-tour` attributes for targeting:
- `data-tour="welcome-banner"`
- `data-tour="stats-cards"`
- `data-tour="apply-button"`
- `data-tour="active-loans"`
- `data-tour="applications-tracker"`
- `data-tour="dashboard-header"`
- `data-tour="filters"`
- `data-tour="applications-list"`
- `data-tour="applications-manager"`
- `data-tour="employee-management"`

### Storage
The walkthrough completion status is stored in localStorage:
- Key format: `walkthrough_{role}_completed`
- Example: `walkthrough_customer_completed`

## Resetting the Walkthrough

If you need to show the walkthrough again (for testing or if a user wants to see it again), you can:

### Method 1: Browser Console
```javascript
// For customer
localStorage.removeItem('walkthrough_customer_completed');

// For employee
localStorage.removeItem('walkthrough_employee_completed');

// For admin
localStorage.removeItem('walkthrough_admin_completed');

// Remove all
localStorage.removeItem('walkthrough_customer_completed');
localStorage.removeItem('walkthrough_employee_completed');
localStorage.removeItem('walkthrough_admin_completed');
```

### Method 2: Clear All Local Storage
```javascript
localStorage.clear();
```

### Method 3: Browser DevTools
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Find Local Storage
4. Delete the `walkthrough_*_completed` keys

## Customization

### Adding New Steps
Edit `components/walkthrough/DashboardWalkthrough.tsx`:

```typescript
const walkthroughSteps: Record<string, WalkthroughStep[]> = {
  customer: [
    // Add new step here
    {
      target: '[data-tour="new-element"]',
      title: 'New Feature Title',
      description: 'Description of the new feature',
      position: 'bottom', // or 'top', 'left', 'right'
    },
  ],
};
```

### Changing Step Content
Modify the `title` and `description` fields in the `walkthroughSteps` object.

### Styling
The walkthrough uses the grey/yellow theme:
- Highlight border: `border-yellow-500`
- Progress bar: `bg-yellow-500`
- Buttons: `bg-yellow-500` and `bg-gray-700`

## User Experience

### First-Time Users
1. User logs in
2. After 500ms delay (to ensure page loads), walkthrough appears
3. User sees highlighted element with tooltip
4. User can navigate through steps or skip

### Returning Users
- Walkthrough does not appear
- Users can still access features normally
- If needed, walkthrough can be reset (see above)

## Best Practices

1. **Keep Steps Concise**: Each step should have a clear, brief message
2. **Logical Order**: Steps should follow a natural flow of user actions
3. **Target Visible Elements**: Ensure elements exist and are visible before targeting
4. **Test All Roles**: Verify walkthrough works for customer, employee, and admin
5. **Mobile Responsive**: Tooltip positioning adapts to screen size

## Troubleshooting

### Walkthrough Not Appearing
- Check if localStorage already has completion flag
- Verify user role is correct
- Check browser console for errors
- Ensure elements with `data-tour` attributes exist

### Elements Not Highlighting
- Verify `data-tour` attributes are correctly set
- Check if elements are rendered (not conditionally hidden)
- Ensure selectors match exactly

### Positioning Issues
- Tooltip position adjusts based on `position` property
- May need adjustment for mobile devices
- Check viewport size and scroll position
