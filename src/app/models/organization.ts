export class Organization {
  id: string = '';
  name: string = '';
  logo: string = '';
  address: string = '';
  website: string = '';
  poc_name: string = '';  
  poc_phone?: string = '';    
  poc_email: string = '';  
  poc_title?: string = '';
  rewards?: string[] = []; 
  departments: string[] = []; 
  is_active: number = 0;
}

export class Department {
  id: string = '';
  name: string = '';
  is_active: number = 0
}

export class Rewards {
  id: string = '';
  name: string = '';
  is_active: number = 0
}
