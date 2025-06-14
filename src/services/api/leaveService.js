import leaveData from '../mockData/leaves.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class LeaveService {
  constructor() {
    this.leaves = [...leaveData];
  }

  async getAll() {
    await delay(300);
    return [...this.leaves];
  }

  async getById(id) {
    await delay(200);
    const leave = this.leaves.find(l => l.id === id);
    return leave ? { ...leave } : null;
  }

  async getByEmployeeId(employeeId) {
    await delay(250);
    const filtered = this.leaves.filter(l => l.employeeId === employeeId);
    return [...filtered];
  }

  async create(leave) {
    await delay(400);
    const newLeave = {
      ...leave,
      id: Date.now().toString(),
      appliedOn: new Date().toISOString(),
      status: 'pending'
    };
    this.leaves.push(newLeave);
    return { ...newLeave };
  }

  async update(id, data) {
    await delay(300);
    const index = this.leaves.findIndex(l => l.id === id);
    if (index !== -1) {
      this.leaves[index] = { ...this.leaves[index], ...data };
      return { ...this.leaves[index] };
    }
    throw new Error('Leave request not found');
  }

  async approve(id, approvedBy) {
    await delay(300);
    return this.update(id, { status: 'approved', approvedBy });
  }

  async reject(id, approvedBy) {
    await delay(300);
    return this.update(id, { status: 'rejected', approvedBy });
  }

  async delete(id) {
    await delay(300);
    const index = this.leaves.findIndex(l => l.id === id);
    if (index !== -1) {
      const deleted = this.leaves.splice(index, 1)[0];
      return { ...deleted };
    }
    throw new Error('Leave request not found');
  }
}

export default new LeaveService();