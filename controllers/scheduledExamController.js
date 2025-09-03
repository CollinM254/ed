// // const ScheduledExam = require('../models/scheduledExam');
// // const Learner = require('../models/Learner');
// // const Teacher = require('../models/Teacher');

// // exports.scheduleExam = async (req, res) => {
// //   const { schoolId, term, examType, examName, startDate, endDate } = req.body;

// //   try {
// //     if (!schoolId || !term || !examType || !startDate || !endDate) {
// //       return res.status(400).json({ message: 'All required fields must be provided' });
// //     }

// //     const start = new Date(startDate);
// //     const end = new Date(endDate);

// //     if (start >= end) {
// //       return res.status(400).json({ message: 'End date must be after start date' });
// //     }

// //     const newExam = new ScheduledExam({
// //       schoolId,
// //       term,
// //       examType,
// //       examName: examType === 'Random Exams' || examType === 'Other Exams' ? examName : null,
// //       startDate: start,
// //       endDate: end,
// //     });

// //     await newExam.save();

// //     res.status(201).json({
// //       success: true,
// //       message: 'Exam scheduled successfully',
// //       exam: newExam,
// //     });
// //   } catch (error) {
// //     console.error('Error scheduling exam:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: error.message || 'Internal server error',
// //     });
// //   }
// // };

// // exports.getScheduledExams = async (req, res) => {
// //   const { schoolId } = req.query;

// //   try {
// //     if (!schoolId) {
// //       return res.status(400).json({ message: 'schoolId is required' });
// //     }

// //     const exams = await ScheduledExam.find({ schoolId })
// //       .sort({ startDate: 1 })
// //       .lean();

// //     res.status(200).json({
// //       success: true,
// //       exams,
// //     });
// //   } catch (error) {
// //     console.error('Error fetching scheduled exams:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: error.message || 'Internal server error',
// //     });
// //   }
// // };

// // exports.getSubmittedResults = async (req, res) => {
// //   const { scheduledExamId } = req.query;

// //   try {
// //     if (!scheduledExamId) {
// //       return res.status(400).json({ message: 'scheduledExamId is required' });
// //     }

// //     const exam = await ScheduledExam.findById(scheduledExamId);
// //     if (!exam) {
// //       return res.status(404).json({ message: 'Scheduled exam not found' });
// //     }

// //     const { term, examType, examName } = exam;

// //     const learners = await Learner.find({ schoolId: exam.schoolId })
// //       .select('results fullName class stream admissionNumber')
// //       .lean();

// //     const submittedResults = [];

// //     for (const learner of learners) {
// //       for (const result of learner.results) {
// //         if (
// //           result.term === term &&
// //           result.examType === examType &&
// //           (examType === 'Random Exams' || examType === 'Other Exams'
// //             ? result.examName === examName
// //             : true)
// //         ) {
// //           if (result.updatedBy) {
// //             const teacher = await Teacher.findById(result.updatedBy)
// //               .select('fullName')
// //               .lean();
// //             submittedResults.push({
// //               learnerId: learner._id,
// //               learnerName: learner.fullName,
// //               class: learner.class,
// //               stream: learner.stream || 'No Stream',
// //               subject: result.subject,
// //               marks: result.marks,
// //               updatedBy: teacher ? teacher.fullName : 'Unknown',
// //               teacherId: result.updatedBy,
// //             });
// //           }
// //         }
// //       }
// //     }

// //     res.status(200).json({
// //       success: true,
// //       submittedResults,
// //     });
// //   } catch (error) {
// //     console.error('Error fetching submitted results:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: error.message || 'Internal server error',
// //     });
// //   }
// // };

// const ScheduledExam = require('../models/scheduledExam');
// const Learner = require('../models/Learner');
// const Teacher = require('../models/Teacher');

// exports.scheduleExam = async (req, res) => {
//   const { schoolId, term, examType, examName, startDate, endDate } = req.body;

//   try {
//     if (!schoolId || !term || !examType || !startDate || !endDate) {
//       return res.status(400).json({ message: 'All required fields must be provided' });
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     if (start >= end) {
//       return res.status(400).json({ message: 'End date must be after start date' });
//     }

//     const newExam = new ScheduledExam({
//       schoolId,
//       term,
//       examType,
//       examName: examType === 'Random Exams' || examType === 'Other Exams' ? examName : null,
//       startDate: start,
//       endDate: end,
//     });

//     await newExam.save();

//     res.status(201).json({
//       success: true,
//       message: 'Exam scheduled successfully',
//       exam: newExam,
//     });
//   } catch (error) {
//     console.error('Error scheduling exam:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error',
//     });
//   }
// };

// exports.updateScheduledExam = async (req, res) => {
//   const { examId } = req.params;
//   const { schoolId, term, examType, examName, startDate, endDate } = req.body;

//   try {
//     if (!examId || !schoolId || !term || !examType || !startDate || !endDate) {
//       return res.status(400).json({ message: 'All required fields must be provided' });
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     if (start >= end) {
//       return res.status(400).json({ message: 'End date must be after start date' });
//     }

//     const exam = await ScheduledExam.findById(examId);
//     if (!exam || exam.schoolId.toString() !== schoolId) {
//       return res.status(404).json({ message: 'Scheduled exam not found' });
//     }

//     exam.term = term;
//     exam.examType = examType;
//     exam.examName = examType === 'Random Exams' || examType === 'Other Exams' ? examName : null;
//     exam.startDate = start;
//     exam.endDate = end;

//     await exam.save();

//     res.status(200).json({
//       success: true,
//       message: 'Exam updated successfully',
//       exam,
//     });
//   } catch (error) {
//     console.error('Error updating scheduled exam:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error',
//     });
//   }
// };

// exports.getScheduledExams = async (req, res) => {
//   const { schoolId } = req.query;

//   try {
//     if (!schoolId) {
//       return res.status(400).json({ message: 'schoolId is required' });
//     }

//     const exams = await ScheduledExam.find({ schoolId })
//       .sort({ startDate: 1 })
//       .lean();

//     res.status(200).json({
//       success: true,
//       exams,
//     });
//   } catch (error) {
//     console.error('Error fetching scheduled exams:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error',
//     });
//   }
// };

// exports.getSubmittedResults = async (req, res) => {
//   const { scheduledExamId } = req.query;

//   try {
//     if (!scheduledExamId) {
//       return res.status(400).json({ message: 'scheduledExamId is required' });
//     }

//     const exam = await ScheduledExam.findById(scheduledExamId);
//     if (!exam) {
//       return res.status(404).json({ message: 'Scheduled exam not found' });
//     }

//     const { term, examType, examName } = exam;

//     const learners = await Learner.find({ schoolId: exam.schoolId })
//       .select('results class stream')
//       .lean();

//     const submittedResults = [];

//     for (const learner of learners) {
//       for (const result of learner.results) {
//         if (
//           result.term === term &&
//           result.examType === examType &&
//           (examType === 'Random Exams' || examType === 'Other Exams'
//             ? result.examName === examName
//             : true)
//         ) {
//           if (result.updatedBy) {
//             const teacher = await Teacher.findById(result.updatedBy)
//               .select('fullName')
//               .lean();
//             submittedResults.push({
//               teacherId: result.updatedBy,
//               teacherName: teacher ? teacher.fullName : 'Unknown',
//               class: result.class || learner.class,
//               stream: result.stream || learner.stream || 'No Stream',
//               subject: result.subject,
//               submissionDate: result.updatedAt || result.createdAt,
//             });
//           }
//         }
//       }
//     }

//     // Deduplicate
//     const uniqueSubmissions = Array.from(
//       new Map(
//         submittedResults.map(item => [
//           `${item.teacherId}-${item.class}-${item.stream}-${item.subject}`,
//           item,
//         ])
//       ).values()
//     );

//     res.status(200).json({
//       success: true,
//       submittedResults: uniqueSubmissions,
//     });
//   } catch (error) {
//     console.error('Error fetching submitted results:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error',
//     });
//   }
// };

// exports.getResultsSummary = async (req, res) => {
//   const { schoolId, examId } = req.params;

//   try {
//     if (!schoolId || !examId) {
//       return res.status(400).json({ message: 'schoolId and examId are required' });
//     }

//     const exam = await ScheduledExam.findById(examId);
//     if (!exam || exam.schoolId.toString() !== schoolId) {
//       return res.status(404).json({ message: 'Scheduled exam not found' });
//     }

//     const { term, examType, examName } = exam;

//     const learners = await Learner.find({ schoolId })
//       .select('results fullName')
//       .lean();

//     let totalMarks = 0;
//     let totalResults = 0;
//     let passingMarks = 0;
//     const participantIds = new Set();

//     for (const learner of learners) {
//       for (const result of learner.results) {
//         if (
//           result.term === term &&
//           result.examType === examType &&
//           (examType === 'Random Exams' || examType === 'Other Exams'
//             ? result.examName === examName
//             : true)
//         ) {
//           if (result.marks !== null && result.marks !== undefined) {
//             totalMarks += result.marks;
//             totalResults++;
//             participantIds.add(learner._id.toString());
//             if (result.marks >= 50) { // Assuming 50 is the passing mark
//               passingMarks++;
//             }
//           }
//         }
//       }
//     }

//     const averageScore = totalResults > 0 ? (totalMarks / totalResults).toFixed(2) : 'N/A';
//     const passRate = totalResults > 0 ? ((passingMarks / totalResults) * 100).toFixed(2) + '%' : 'N/A';
//     const totalParticipants = participantIds.size;

//     res.status(200).json({
//       success: true,
//       results: {
//         averageScore,
//         passRate,
//         totalParticipants,
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching results summary:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error',
//     });
//   }
// };

// exports.deleteScheduledExam = async (req, res) => {
//   const { examId } = req.params;

//   try {
//     if (!examId) {
//       return res.status(400).json({ message: 'examId is required' });
//     }

//     const exam = await ScheduledExam.findById(examId);
//     if (!exam) {
//       return res.status(404).json({ message: 'Scheduled exam not found' });
//     }

//     await ScheduledExam.findByIdAndDelete(examId);

//     res.status(200).json({
//       success: true,
//       message: 'Exam deleted successfully',
//     });
//   } catch (error) {
//     console.error('Error deleting scheduled exam:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Internal server error',
//     });
//   }
// };

// module.exports = exports;


const ScheduledExam = require('../models/scheduledExam');
const Learner = require('../models/Learner');
const Teacher = require('../models/Teacher');

exports.scheduleExam = async (req, res) => {
  const { schoolId, term, examType, examName, startDate, endDate } = req.body;

  try {
    if (!schoolId || !term || !examType || !startDate || !endDate) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if ((examType === 'Random Exams' || examType === 'Other Exams') && !examName) {
      return res.status(400).json({ message: 'Exam name is required for Random or Other exams' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const newExam = new ScheduledExam({
      schoolId,
      term,
      examType,
      examName: examName || null, // Store examName for all types if provided
      startDate: start,
      endDate: end,
    });

    await newExam.save();

    res.status(201).json({
      success: true,
      message: 'Exam scheduled successfully',
      exam: newExam,
    });
  } catch (error) {
    console.error('Error scheduling exam:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

exports.updateScheduledExam = async (req, res) => {
  const { examId } = req.params;
  const { schoolId, term, examType, examName, startDate, endDate } = req.body;

  try {
    if (!examId || !schoolId || !term || !examType || !startDate || !endDate) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if ((examType === 'Random Exams' || examType === 'Other Exams') && !examName) {
      return res.status(400).json({ message: 'Exam name is required for Random or Other exams' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const exam = await ScheduledExam.findById(examId);
    if (!exam || exam.schoolId.toString() !== schoolId) {
      return res.status(404).json({ message: 'Scheduled exam not found' });
    }

    exam.term = term;
    exam.examType = examType;
    exam.examName = examName || null; // Store examName for all types if provided
    exam.startDate = start;
    exam.endDate = end;

    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      exam,
    });
  } catch (error) {
    console.error('Error updating scheduled exam:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

exports.getScheduledExams = async (req, res) => {
  const { schoolId } = req.query;

  try {
    if (!schoolId) {
      return res.status(400).json({ message: 'schoolId is required' });
    }

    const exams = await ScheduledExam.find({ schoolId })
      .sort({ startDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      exams,
    });
  } catch (error) {
    console.error('Error fetching scheduled exams:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

exports.getSubmittedResults = async (req, res) => {
  const { scheduledExamId } = req.query;

  try {
    if (!scheduledExamId) {
      return res.status(400).json({ message: 'scheduledExamId is required' });
    }

    const exam = await ScheduledExam.findById(scheduledExamId);
    if (!exam) {
      return res.status(404).json({ message: 'Scheduled exam not found' });
    }

    const { term, examType, examName } = exam;

    const learners = await Learner.find({ schoolId: exam.schoolId })
      .select('results class stream')
      .lean();

    const submittedResults = [];

    for (const learner of learners) {
      for (const result of learner.results) {
        if (
          result.term === term &&
          result.examType === examType &&
          (examType === 'Random Exams' || examType === 'Other Exams'
            ? result.examName === examName
            : result.examName === examName || !examName)
        ) {
          if (result.updatedBy) {
            const teacher = await Teacher.findById(result.updatedBy)
              .select('fullName')
              .lean();
            submittedResults.push({
              teacherId: result.updatedBy,
              teacherName: teacher ? teacher.fullName : 'Unknown',
              class: result.class || learner.class,
              stream: result.stream || learner.stream || 'No Stream',
              subject: result.subject,
              submissionDate: result.updatedAt || result.createdAt,
            });
          }
        }
      }
    }

    // Deduplicate
    const uniqueSubmissions = Array.from(
      new Map(
        submittedResults.map(item => [
          `${item.teacherId}-${item.class}-${item.stream}-${item.subject}`,
          item,
        ])
      ).values()
    );

    res.status(200).json({
      success: true,
      submittedResults: uniqueSubmissions,
    });
  } catch (error) {
    console.error('Error fetching submitted results:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

exports.getResultsSummary = async (req, res) => {
  const { schoolId, examId } = req.params;

  try {
    if (!schoolId || !examId) {
      return res.status(400).json({ message: 'schoolId and examId are required' });
    }

    const exam = await ScheduledExam.findById(examId);
    if (!exam || exam.schoolId.toString() !== schoolId) {
      return res.status(404).json({ message: 'Scheduled exam not found' });
    }

    const { term, examType, examName } = exam;

    const learners = await Learner.find({ schoolId })
      .select('results fullName')
      .lean();

    let totalMarks = 0;
    let totalResults = 0;
    let passingMarks = 0;
    const participantIds = new Set();

    for (const learner of learners) {
      for (const result of learner.results) {
        if (
          result.term === term &&
          result.examType === examType &&
          (examType === 'Random Exams' || examType === 'Other Exams'
            ? result.examName === examName
            : result.examName === examName || !examName)
        ) {
          if (result.marks !== null && result.marks !== undefined) {
            totalMarks += result.marks;
            totalResults++;
            participantIds.add(learner._id.toString());
            if (result.marks >= 50) { // Assuming 50 is the passing mark
              passingMarks++;
            }
          }
        }
      }
    }

    const averageScore = totalResults > 0 ? (totalMarks / totalResults).toFixed(2) : 'N/A';
    const passRate = totalResults > 0 ? ((passingMarks / totalResults) * 100).toFixed(2) + '%' : 'N/A';
    const totalParticipants = participantIds.size;

    res.status(200).json({
      success: true,
      results: {
        averageScore,
        passRate,
        totalParticipants,
      },
    });
  } catch (error) {
    console.error('Error fetching results summary:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

exports.deleteScheduledExam = async (req, res) => {
  const { examId } = req.params;

  try {
    if (!examId) {
      return res.status(400).json({ message: 'examId is required' });
    }

    const exam = await ScheduledExam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Scheduled exam not found' });
    }

    await ScheduledExam.findByIdAndDelete(examId);

    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting scheduled exam:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

module.exports = exports;