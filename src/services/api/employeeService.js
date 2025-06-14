import { toast } from 'react-toastify';

class EmployeeService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'employee';
  }

  async getAll() {
    try {
      const params = {
        "Fields": ['Name', 'email', 'phone', 'designation', 'department', 'join_date', 'employee_code', 'manager', 'status', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ['Name', 'email', 'phone', 'designation', 'department', 'join_date', 'employee_code', 'manager', 'status', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy']
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee with ID ${id}:`, error);
      return null;
    }
  }

  async create(employee) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: employee.Name || employee.name,
          email: employee.email,
          phone: employee.phone,
          designation: employee.designation,
          department: employee.department,
          join_date: employee.join_date || employee.joinDate,
          employee_code: employee.employee_code || employee.employeeCode || `EMP${Date.now().toString().slice(-4)}`,
          manager: employee.manager,
          status: employee.status || 'active',
          Tags: employee.Tags || '',
          Owner: employee.Owner
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
      console.error("Error creating employee:", error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: data.Name || data.name,
          email: data.email,
          phone: data.phone,
          designation: data.designation,
          department: data.department,
          join_date: data.join_date || data.joinDate,
          employee_code: data.employee_code || data.employeeCode,
          manager: data.manager,
          status: data.status,
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
      console.error("Error updating employee:", error);
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
      console.error("Error deleting employee:", error);
      throw error;
    }
  }

  async searchByName(query) {
    try {
      const params = {
        "Fields": ['Name', 'email', 'phone', 'designation', 'department', 'join_date', 'employee_code', 'manager', 'status'],
        "where": [
          {
            "FieldName": "Name",
            "Operator": "Contains",
            "Values": [query]
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
      console.error("Error searching employees:", error);
      return [];
    }
  }

  async getByDepartment(department) {
    try {
      const params = {
        "Fields": ['Name', 'email', 'phone', 'designation', 'department', 'join_date', 'employee_code', 'manager', 'status'],
        "where": [
          {
            "FieldName": "department",
            "Operator": "ExactMatch",
            "Values": [department]
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
      console.error("Error fetching employees by department:", error);
      return [];
    }
  }
}

export default new EmployeeService();