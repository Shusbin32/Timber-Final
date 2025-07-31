import api from '../utils/axios';
import { Dealer } from '../types/dealer';

export const DealerService = {
  async getAll(): Promise<Dealer[]> {
    try {
      const res = await api.get<Dealer[]>('/api/user/getdealers');
      return res.data;
    } catch (error) {
      console.error('Failed to fetch dealers', error);
      throw error;
    }
  },

  async getOneDealer(dealerId: number): Promise<Dealer> {
    try {
      const res = await api.get<Dealer>(`/api/user/getdealer/${dealerId}`);
      return res.data;
    } catch (error) {
      console.error('Failed to get one dealer', error);
      throw error;
    }
    
  },

  async create(data: Partial<Dealer>): Promise<Dealer> {
    try {
      const res = await api.post<Dealer>('/api/user/createdealer', data);
      return res.data;
    } catch (error) {
      console.error('Failed to create dealer', error);
      throw error;
    }
  },

  // Optional: Update, Delete
  async update(dealerId: string, data: Partial<Dealer>): Promise<Dealer> {
    try {
      const res = await api.put<Dealer>(`/api/user/updatedealer/${dealerId}`, data);
      return res.data;
    } catch (error) {
      console.error('Failed to update dealer', error);
      throw error;
    }
  },

  async delete(dealerId: string): Promise<void> {
    try {
      await api.delete(`/api/user/deletedealer/${dealerId}`);
    } catch (error) {
      console.error('Failed to delete dealer', error);
      throw error;
    }
  },
};

export default DealerService;
