import express from 'express';
import { z } from 'zod';
import { createDoctor, getDoctors, getDoctorWithPatients } from '../controllers/doctorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const doctorSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  hospital: z.string().min(2, 'Hospital is required'),
  phone: z.string().min(5, 'Phone number is required'),
  email: z.string().email('Valid email is required'),
});

router.use(protect);
router.route('/').get(getDoctors).post(validate(doctorSchema), createDoctor);
router.get('/:id', getDoctorWithPatients);

export default router;
