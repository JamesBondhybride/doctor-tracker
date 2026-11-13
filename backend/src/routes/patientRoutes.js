import express from 'express';
import { z } from 'zod';
import { createPatient, getPatients, updatePatient, deletePatient } from '../controllers/patientController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const patientSchema = z.object({
  name: z.string().min(2, 'Patient name is required'),
  age: z.coerce.number().min(0).max(150),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().min(5, 'Phone number is required'),
  condition: z.string().min(2, 'Condition is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
});

router.use(protect);
router.route('/').get(getPatients).post(validate(patientSchema), createPatient);
router.route('/:id').put(validate(patientSchema.partial()), updatePatient).delete(deletePatient);

export default router;
