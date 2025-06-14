import { toast } from 'react-toastify';

class LeaveService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'leave';
  }

  async getAll() {
    try {
      const params = {
        "Fields": ['Name', 'employee_id', 'leave_type', 'start_date', 'end_date', 'reason', 'status', 'approved_by', 'applied_on', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ['Name', 'employee_id', 'leave_type', 'start_date', 'end_date', 'reason', 'status', 'approved_by', 'applied_on', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching leave request with ID ${id}:`, error);
      return null;
    }
  }

  async getByEmployeeId(employeeId) {
    try {
      const params = {
        "Fields": ['Name', 'employee_id', 'leave_type', 'start_date', 'end_date', 'reason', 'status', 'approved_by', 'applied_on'],
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
      console.error("Error fetching leaves by employee ID:", error);
      return [];
    }
  }

  async create(leave) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: leave.Name || `Leave-${leave.leave_type}-${leave.employee_id}`,
          employee_id: parseInt(leave.employee_id || leave.employeeId),
          leave_type: leave.leave_type || leave.leaveType,
          start_date: leave.start_date || leave.startDate,
          end_date: leave.end_date || leave.endDate,
          reason: leave.reason,
          status: leave.status || 'pending',
          approved_by: leave.approved_by || leave.approvedBy,
          applied_on: leave.applied_on || leave.appliedOn || new Date().toISOString(),
          Tags: leave.Tags || '',
          Owner: leave.Owner
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
      console.error("Error creating leave request:", error);
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
          leave_type: data.leave_type || data.leaveType,
          start_date: data.start_date || data.startDate,
          end_date: data.end_date || data.endDate,
          reason: data.reason,
          status: data.status,
          approved_by: data.approved_by || data.approvedBy,
          applied_on: data.applied_on || data.appliedOn,
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
      console.error("Error updating leave request:", error);
      throw error;
    }
  }

  async approve(id, approvedBy) {
    try {
      return await this.update(id, { 
        status: 'approved', 
        approved_by: approvedBy 
      });
    } catch (error) {
      console.error("Error approving leave request:", error);
      throw error;
    }
  }

  async reject(id, approvedBy) {
    try {
      return await this.update(id, { 
        status: 'rejected', 
        approved_by: approvedBy 
      });
    } catch (error) {
      console.error("Error rejecting leave request:", error);
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
      console.error("Error deleting leave request:", error);
      throw error;
    }
  }
}

export default new LeaveService();