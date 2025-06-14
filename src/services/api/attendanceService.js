import { toast } from 'react-toastify';

class AttendanceService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'attendance';
  }

  async getAll() {
    try {
      const params = {
        "Fields": ['Name', 'employee_id', 'date', 'check_in', 'check_out', 'status', 'work_mode', 'total_hours', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ['Name', 'employee_id', 'date', 'check_in', 'check_out', 'status', 'work_mode', 'total_hours', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance record with ID ${id}:`, error);
      return null;
    }
  }

  async getByEmployeeId(employeeId) {
    try {
      const params = {
        "Fields": ['Name', 'employee_id', 'date', 'check_in', 'check_out', 'status', 'work_mode', 'total_hours'],
        "where": [
          {
            "FieldName": "employee_id",
            "Operator": "EqualTo",
            "Values": [parseInt(employeeId)]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching attendance by employee ID:", error);
      return [];
    }
  }

  async getByDateRange(startDate, endDate) {
    try {
      const params = {
        "Fields": ['Name', 'employee_id', 'date', 'check_in', 'check_out', 'status', 'work_mode', 'total_hours'],
        "where": [
          {
            "FieldName": "date",
            "Operator": "GreaterThanOrEqualTo",
            "Values": [startDate]
          },
          {
            "FieldName": "date",
            "Operator": "LessThanOrEqualTo",
            "Values": [endDate]
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching attendance by date range:", error);
      return [];
    }
  }

  async create(record) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: record.Name || `Attendance-${record.date}-${record.employee_id}`,
          employee_id: parseInt(record.employee_id || record.employeeId),
          date: record.date,
          check_in: record.check_in || record.checkIn,
          check_out: record.check_out || record.checkOut,
          status: record.status || 'present',
          work_mode: record.work_mode || record.workMode || 'office',
          total_hours: parseFloat(record.total_hours || record.totalHours || 0),
          Tags: record.Tags || '',
          Owner: record.Owner
        }]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      console.error("Error creating attendance record:", error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: data.Name,
          employee_id: parseInt(data.employee_id || data.employeeId),
          date: data.date,
          check_in: data.check_in || data.checkIn,
          check_out: data.check_out || data.checkOut,
          status: data.status,
          work_mode: data.work_mode || data.workMode,
          total_hours: parseFloat(data.total_hours || data.totalHours || 0),
          Tags: data.Tags,
          Owner: data.Owner
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      console.error("Error updating attendance record:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      console.error("Error deleting attendance record:", error);
      throw error;
    }
  }

  async checkIn(employeeId, workMode = 'office') {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already checked in today
      const existingRecords = await this.getByEmployeeId(employeeId);
      const todayRecord = existingRecords.find(record => record.date === today);
      
      if (todayRecord) {
        throw new Error('Already checked in today');
      }

      const newRecord = {
        Name: `CheckIn-${today}-${employeeId}`,
        employee_id: parseInt(employeeId),
        date: today,
        check_in: new Date().toTimeString().slice(0, 5),
        check_out: null,
        status: 'present',
        work_mode: workMode,
        total_hours: 0
      };

      return await this.create(newRecord);
    } catch (error) {
      console.error("Error checking in:", error);
      throw error;
    }
  }

  async checkOut(employeeId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Find today's attendance record
      const existingRecords = await this.getByEmployeeId(employeeId);
      const todayRecord = existingRecords.find(record => record.date === today);

      if (!todayRecord || todayRecord.check_out) {
        throw new Error('No active check-in found or already checked out');
      }

      const checkOutTime = new Date().toTimeString().slice(0, 5);
      const checkInDate = new Date(`${today}T${todayRecord.check_in}:00`);
      const checkOutDate = new Date(`${today}T${checkOutTime}:00`);
      const totalHours = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60) * 100) / 100;

      return await this.update(todayRecord.Id, {
        check_out: checkOutTime,
        total_hours: totalHours
      });
    } catch (error) {
      console.error("Error checking out:", error);
      throw error;
    }
  }
}

export default new AttendanceService();