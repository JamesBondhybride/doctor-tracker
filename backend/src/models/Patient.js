import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: 0,
      max: 150,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    condition: {
      type: String,
      required: [true, 'Medical condition is required'],
      trim: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Assigned doctor is required'],
    },
  },
  { timestamps: true }
);

// Compound & Single Indexes for High-Speed Queries & Aggregations
patientSchema.index({ doctorId: 1, createdAt: -1 });
patientSchema.index({ condition: 1 });
patientSchema.index({ name: 1 });
patientSchema.index({ createdAt: -1 });

export default mongoose.model('Patient', patientSchema);
