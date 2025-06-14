import payrollData from '../mockData/payroll.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class PayrollService {
  constructor() {
    this.payroll = [...payrollData];
  }

  async getAll() {
    await delay(300);
    return [...this.payroll];
  }

  async getById(id) {
    await delay(200);
    const record = this.payroll.find(p => p.id === id);
    return record ? { ...record } : null;
  }

  async getByEmployeeId(employeeId) {
    await delay(250);
    const filtered = this.payroll.filter(p => p.employeeId === employeeId);
    return [...filtered];
  }

  async getByMonth(month) {
    await delay(250);
    const filtered = this.payroll.filter(p => p.month === month);
    return [...filtered];
  }

  async create(record) {
    await delay(400);
    const newRecord = {
      ...record,
      id: Date.now().toString(),
      status: 'pending'
    };
    this.payroll.push(newRecord);
    return { ...newRecord };
  }

  async update(id, data) {
    await delay(300);
    const index = this.payroll.findIndex(p => p.id === id);
    if (index !== -1) {
      this.payroll[index] = { ...this.payroll[index], ...data };
      return { ...this.payroll[index] };
    }
    throw new Error('Payroll record not found');
  }

  async delete(id) {
    await delay(300);
    const index = this.payroll.findIndex(p => p.id === id);
    if (index !== -1) {
      const deleted = this.payroll.splice(index, 1)[0];
      return { ...deleted };
    }
    throw new Error('Payroll record not found');
  }

  async processPayroll(employeeId, month, basicSalary, allowances = {}, deductions = {}) {
    await delay(500);
    const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
    const netPay = basicSalary + totalAllowances - totalDeductions;

    const record = {
      id: Date.now().toString(),
      employeeId,
      month,
      basicSalary,
      allowances,
      deductions,
      netPay,
      status: 'processed'
    };

    this.payroll.push(record);
    return { ...record };
  }
}

export default new PayrollService();