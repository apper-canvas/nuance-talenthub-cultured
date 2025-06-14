import { toast } from 'react-toastify';

class PayrollService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'payroll';
  }

  async getAll() {
    try {
      const params = {
        "Fields": ['Name', 'month', 'basic_salary', 'allowances', 'deductions', 'net_pay', 'status', 'employee_id', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching payroll records:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ['Name', 'month', 'basic_salary', 'allowances', 'deductions', 'net_pay', 'status', 'employee_id', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching payroll record with ID ${id}:`, error);
      return null;
    }
  }

  async getByEmployeeId(employeeId) {
    try {
      const params = {
        "Fields": ['Name', 'month', 'basic_salary', 'allowances', 'deductions', 'net_pay', 'status', 'employee_id'],
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
      console.error("Error fetching payroll by employee ID:", error);
      return [];
    }
  }

  async getByMonth(month) {
    try {
      const params = {
        "Fields": ['Name', 'month', 'basic_salary', 'allowances', 'deductions', 'net_pay', 'status', 'employee_id'],
        "where": [
          {
            "FieldName": "month",
            "Operator": "ExactMatch",
            "Values": [month]
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
      console.error("Error fetching payroll by month:", error);
      return [];
    }
  }

  async create(record) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: record.Name || `Payroll-${record.month}-${record.employee_id}`,
          month: record.month,
          basic_salary: parseInt(record.basic_salary || record.basicSalary),
          allowances: record.allowances ? JSON.stringify(record.allowances) : '',
          deductions: record.deductions ? JSON.stringify(record.deductions) : '',
          net_pay: parseInt(record.net_pay || record.netPay),
          status: record.status || 'pending',
          employee_id: parseInt(record.employee_id || record.employeeId),
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
      console.error("Error creating payroll record:", error);
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
          month: data.month,
          basic_salary: parseInt(data.basic_salary || data.basicSalary),
          allowances: data.allowances ? JSON.stringify(data.allowances) : '',
          deductions: data.deductions ? JSON.stringify(data.deductions) : '',
          net_pay: parseInt(data.net_pay || data.netPay),
          status: data.status,
          employee_id: parseInt(data.employee_id || data.employeeId),
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
      console.error("Error updating payroll record:", error);
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
      console.error("Error deleting payroll record:", error);
      throw error;
    }
  }

  async processPayroll(employeeId, month, basicSalary, allowances = {}, deductions = {}) {
    try {
      const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + val, 0);
      const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
      const netPay = basicSalary + totalAllowances - totalDeductions;

      const record = {
        Name: `Payroll-${month}-${employeeId}`,
        employee_id: parseInt(employeeId),
        month,
        basic_salary: parseInt(basicSalary),
        allowances: JSON.stringify(allowances),
        deductions: JSON.stringify(deductions),
        net_pay: parseInt(netPay),
        status: 'processed'
      };

      return await this.create(record);
    } catch (error) {
      console.error("Error processing payroll:", error);
      throw error;
    }
  }
}

export default new PayrollService();