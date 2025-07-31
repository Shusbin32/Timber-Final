export interface Dealer {
  dealer_id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  city: string;
  landmark: string;
  state: string;
  pincode: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}
  