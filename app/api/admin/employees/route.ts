import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LoanApplication from '@/models/LoanApplication';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get all employees with their performance data
    const employees = await User.find({ role: { $in: ['employee', 'senior_employee', 'supervisor'] } });

    const employeesWithStats = await Promise.all(
      employees.map(async (employee) => {
        // Get employee's loan application statistics
        const applications = await LoanApplication.find({
          $or: [
            { assignedTo: employee._id },
            { reviewedBy: employee._id }
          ]
        });

        const totalApplications = applications.length;
        const pendingApplications = applications.filter(app => app.status === 'under_review').length;
        const approvedApplications = applications.filter(app => app.decision === 'approved').length;
        const rejectedApplications = applications.filter(app => app.decision === 'rejected').length;

        // Calculate average processing time
        let averageProcessingTime = 0;
        const processedApplications = applications.filter(app => app.reviewedAt);
        if (processedApplications.length > 0) {
          const totalProcessingTime = processedApplications.reduce((total, app) => {
            const submittedDate = new Date(app.submittedAt);
            const reviewedDate = new Date(app.reviewedAt);
            const processingTime = Math.ceil((reviewedDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
            return total + processingTime;
          }, 0);
          averageProcessingTime = totalProcessingTime / processedApplications.length;
        }

        return {
          _id: employee._id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          status: employee.status || 'active',
          createdAt: employee.createdAt,
          lastLogin: employee.lastLogin,
          totalApplications,
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          averageProcessingTime
        };
      })
    );

    // Calculate overall statistics
    const totalEmployees = employeesWithStats.length;
    const activeEmployees = employeesWithStats.filter(emp => emp.status === 'active').length;
    const inactiveEmployees = totalEmployees - activeEmployees;
    const totalApplicationsProcessed = employeesWithStats.reduce((sum, emp) => sum + emp.totalApplications, 0);
    const averageProcessingTime = employeesWithStats.length > 0 
      ? employeesWithStats.reduce((sum, emp) => sum + emp.averageProcessingTime, 0) / employeesWithStats.length 
      : 0;

    // Find top performer (highest approval rate)
    let topPerformer = null;
    if (employeesWithStats.length > 0) {
      topPerformer = employeesWithStats.reduce((top, current) => {
        const topRate = top.totalApplications > 0 ? (top.approvedApplications / top.totalApplications) * 100 : 0;
        const currentRate = current.totalApplications > 0 ? (current.approvedApplications / current.totalApplications) * 100 : 0;
        return currentRate > topRate ? current : top;
      });
    }

    const stats = {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalApplicationsProcessed,
      averageProcessingTime,
      topPerformer: topPerformer?.totalApplications > 0 ? topPerformer : null
    };

    return NextResponse.json({
      success: true,
      employees: employeesWithStats,
      stats
    });

  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, email, password, role } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new employee
    const newEmployee = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || 'employee',
      status: 'active'
    });

    await newEmployee.save();

    return NextResponse.json({
      success: true,
      message: 'Employee created successfully',
      employee: {
        _id: newEmployee._id,
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        email: newEmployee.email,
        role: newEmployee.role,
        status: newEmployee.status
      }
    });

  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { employeeId, action, status, firstName, lastName, email, role } = await request.json();

    if (!employeeId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const employee = await User.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    switch (action) {
      case 'toggle_status':
        employee.status = status;
        break;
      case 'update_info':
        if (firstName) employee.firstName = firstName;
        if (lastName) employee.lastName = lastName;
        if (email) employee.email = email;
        if (role) employee.role = role;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await employee.save();

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      employee: {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        role: employee.role,
        status: employee.status
      }
    });

  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    await connectDB();

    // Check if employee has assigned applications
    const assignedApplications = await LoanApplication.find({ assignedTo: employeeId });
    if (assignedApplications.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete employee with assigned applications. Please reassign applications first.' 
      }, { status: 400 });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Don't allow deleting admin users
    if (employee.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 });
    }

    await User.findByIdAndDelete(employeeId);

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
