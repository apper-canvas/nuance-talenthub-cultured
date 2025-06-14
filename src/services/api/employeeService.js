import employeeData from '../mockData/employees.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class EmployeeService {
  constructor() {
    this.employees = [...employeeData];
  }

  async getAll() {
    await delay(300);
    return [...this.employees];
  }

  async getById(id) {
    await delay(200);
    const employee = this.employees.find(emp => emp.id === id);
    return employee ? { ...employee } : null;
  }

  async create(employee) {
    await delay(400);
    const newEmployee = {
      ...employee,
      id: Date.now().toString(),
      employeeCode: `EMP${Date.now().toString().slice(-4)}`
    };
    this.employees.push(newEmployee);
    return { ...newEmployee };
  }

  async update(id, data) {
    await delay(300);
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      this.employees[index] = { ...this.employees[index], ...data };
      return { ...this.employees[index] };
    }
    throw new Error('Employee not found');
  }

  async delete(id) {
    await delay(300);
    const index = this.employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      const deleted = this.employees.splice(index, 1)[0];
      return { ...deleted };
    }
    throw new Error('Employee not found');
  }

  async searchByName(query) {
    await delay(200);
    const filtered = this.employees.filter(emp => 
      emp.name.toLowerCase().includes(query.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(query.toLowerCase())
    );
    return [...filtered];
  }

  async getByDepartment(department) {
    await delay(250);
    const filtered = this.employees.filter(emp => emp.department === department);
    return [...filtered];
  }
}

export default new EmployeeService();