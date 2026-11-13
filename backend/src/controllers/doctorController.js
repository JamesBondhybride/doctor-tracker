import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

export const createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A doctor with this email already exists' });
    }
    next(error);
  }
};

export const getDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', specialization = '', startDate, endDate } = req.query;
    const query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { specialization: regex }, { hospital: regex }, { email: regex }];
    }

    if (specialization) {
      query.specialization = new RegExp(`^${specialization}$`, 'i');
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [doctors, total] = await Promise.all([
      Doctor.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Doctor.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: doctors,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorWithPatients = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).lean();
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const patients = await Patient.find({ doctorId: doctor._id }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: { ...doctor, patients } });
  } catch (error) {
    next(error);
  }
};
