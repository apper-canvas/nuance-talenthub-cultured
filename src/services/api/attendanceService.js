import attendanceData from '../mockData/attendance.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class AttendanceService {
  constructor() {
    this.attendance = [...attendanceData];
  }

  async getAll() {
    await delay(300);
    return [...this.attendance];
  }

  async getById(id) {
    await delay(200);
    const record = this.attendance.find(a => a.id === id);
    return record ? { ...record } : null;
  }

  async getByEmployeeId(employeeId) {
    await delay(250);
    const filtered = this.attendance.filter(a => a.employeeId === employeeId);
    return [...filtered];
  }

  async getByDateRange(startDate, endDate) {
    await delay(300);
    const filtered = this.attendance.filter(a => {
      const recordDate = new Date(a.date);
      return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });
    return [...filtered];
  }

  async create(record) {
    await delay(400);
    const newRecord = {
      ...record,
      id: Date.now().toString()
    };
    this.attendance.push(newRecord);
    return { ...newRecord };
  }

  async update(id, data) {
    await delay(300);
    const index = this.attendance.findIndex(a => a.id === id);
    if (index !== -1) {
      this.attendance[index] = { ...this.attendance[index], ...data };
      return { ...this.attendance[index] };
    }
    throw new Error('Attendance record not found');
  }

  async delete(id) {
    await delay(300);
    const index = this.attendance.findIndex(a => a.id === id);
    if (index !== -1) {
      const deleted = this.attendance.splice(index, 1)[0];
      return { ...deleted };
    }
    throw new Error('Attendance record not found');
  }

  async checkIn(employeeId, workMode = 'office') {
    await delay(300);
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = this.attendance.find(a => 
      a.employeeId === employeeId && a.date === today
    );

    if (existingRecord) {
      throw new Error('Already checked in today');
    }

    const newRecord = {
      id: Date.now().toString(),
      employeeId,
      date: today,
      checkIn: new Date().toTimeString().slice(0, 5),
      checkOut: null,
      status: 'present',
      workMode,
      totalHours: 0
    };

    this.attendance.push(newRecord);
    return { ...newRecord };
  }

  async checkOut(employeeId) {
    await delay(300);
    const today = new Date().toISOString().split('T')[0];
    const record = this.attendance.find(a => 
      a.employeeId === employeeId && a.date === today
    );

    if (!record || record.checkOut) {
      throw new Error('No active check-in found or already checked out');
    }

    const checkOutTime = new Date().toTimeString().slice(0, 5);
    const checkInDate = new Date(`${today}T${record.checkIn}:00`);
    const checkOutDate = new Date(`${today}T${checkOutTime}:00`);
    const totalHours = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60) * 100) / 100;

    return this.update(record.id, {
      checkOut: checkOutTime,
      totalHours
    });
  }
}

export default new AttendanceService();