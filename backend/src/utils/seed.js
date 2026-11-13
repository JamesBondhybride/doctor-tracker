import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing records
    await User.deleteMany();
    await Doctor.deleteMany();
    await Patient.deleteMany();

    // 1. Create Admin User
    await User.create({
      name: 'System Admin',
      email: 'admin@doctortracker.com',
      password: 'Admin123!',
    });

    // 2. Create Sample Doctors
    const doctors = await Doctor.insertMany([
      {
        name: 'Dr. Sarah Jenkins',
        specialization: 'Cardiology',
        hospital: 'City Heart Institute',
        phone: '+1-555-0101',
        email: 'sarah.jenkins@hospital.com',
      },
      {
        name: 'Dr. Michael Chen',
        specialization: 'Neurology',
        hospital: 'Metro General Hospital',
        phone: '+1-555-0102',
        email: 'michael.chen@hospital.com',
      },
      {
        name: 'Dr. Ayesha Rahman',
        specialization: 'Pediatrics',
        hospital: 'Square Care Medical',
        phone: '+1-555-0103',
        email: 'ayesha.rahman@hospital.com',
      },
    ]);

    // 3. Create Sample Patients linked to Doctors
    await Patient.insertMany([
      {
        name: 'John Doe',
        age: 45,
        gender: 'Male',
        phone: '+1-555-0201',
        condition: 'Hypertension',
        doctorId: doctors[0]._id,
      },
      {
        name: 'Emily Clark',
        age: 32,
        gender: 'Female',
        phone: '+1-555-0202',
        condition: 'Arrhythmia',
        doctorId: doctors[0]._id,
      },
      {
        name: 'Robert Brown',
        age: 58,
        gender: 'Male',
        phone: '+1-555-0203',
        condition: 'Migraine',
        doctorId: doctors[1]._id,
      },
      {
        name: 'Sophia Patel',
        age: 8,
        gender: 'Female',
        phone: '+1-555-0204',
        condition: 'Asthma',
        doctorId: doctors[2]._id,
      },
    ]);

    console.log('Seed completed: admin@doctortracker.com / Admin123!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
