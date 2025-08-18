export class User {
  id: string = '';
  first_name: string = '';
  last_name: string = '';
  email: string = '';
  organization_id?: string = '';  // Optional field
  department?: string = '';       // Optional field
  password: string = '';
  otp?: number;              // Optional field
  gender?: string;           // Optional field
  dob?: Date;                // Optional field
  age?: number;              // Optional field
  is_active: number = 0;
  weight: number = 0;            // Weight in lbs
  height: number = 0;            // Height in cm
  activity_level: string = ''  //'Not Active' | 'Slightly Active' | 'Moderate Active' | 'Very Active';
  goal?: string;             // Optional field
  daily_meal?: number;       // Optional field
  accountability?: string = ''  //'High' | 'Medium' | 'Low' | 'None';  // Optional field
  dietary_restrictions?: string[]; // Optional field
  equipment_preferences?: string[]; // Optional field
  training_preferences?: string[]; // Optional field
  signup_status: string = '';
}

export class Equipment {
  id: string = '';
  name: string = '';
  is_active: number = 0
}

export class Training {
  id: string = '';
  name: string = '';
  is_active: number = 0
}

export class Dietary {
  id: string = '';
  name: string = '';
  is_active: number = 0
}
