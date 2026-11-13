import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';

export const createPatient = async (req, res, next) => {
  try {
    const doctorExists = await Doctor.exists({ _id: req.body.doctorId });
    if (!doctorExists) {
      return res.status(404).json({ success: false, message: 'Assigned doctor not found' });
    }

    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const getPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', condition = '', doctorId = '', startDate, endDate } = req.query;
    const query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { condition: regex }, { phone: regex }];
    }

    if (condition) {
      query.condition = new RegExp(condition, 'i');
    }

    if (doctorId) {
      query.doctorId = doctorId;
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

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .populate('doctorId', 'name specialization hospital')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Patient.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: patients,
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

export const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('doctorId', 'name specialization');

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.status(200).json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    next(error);
  }
};
