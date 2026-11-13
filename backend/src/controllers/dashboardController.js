import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalDoctors, totalPatients, patientsPerDoctor, dailyRegistrations] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Patient.aggregate([
        { $group: { _id: '$doctorId', patientCount: { $sum: 1 } } },
        {
          $lookup: {
            from: 'doctors',
            localField: '_id',
            foreignField: '_id',
            as: 'doctor',
          },
        },
        { $unwind: '$doctor' },
        {
          $project: {
            _id: 0,
            doctorId: '$_id',
            doctorName: '$doctor.name',
            specialization: '$doctor.specialization',
            patientCount: 1,
          },
        },
        { $sort: { patientCount: -1 } },
      ]),
      Patient.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            patients: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 14 },
        { $project: { _id: 0, date: '$_id', patients: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        patientsPerDoctor,
        dailyRegistrations,
      },
    });
  } catch (error) {
    next(error);
  }
};
