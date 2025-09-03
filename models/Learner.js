

// const mongoose = require('mongoose');
// const learnerSchema = new mongoose.Schema({
//   fullName: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   dateOfBirth: {
//     type: Date,
//     required: true,
//   },
//   class: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   stream: {  // New field for stream
//     type: String,
//     trim: true,
//     default: null,
//   },
//   admissionNumber: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   birthCertificateNumber: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//   },
//   gender: {
//     type: String,
//     enum: ['M', 'F'],
//     required: true,
//   },
//   parentName: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   parentContact: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   parentEmail: {
//     type: String,
//     required: true,
//     trim: true,
//     lowercase: true,
//   },
//   parentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Parent',
//     default: null, // Make parentId optional
//   },
//   schoolId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'School',
//     required: true,
//   },
//   results: [
//     {
//       term: {
//         type: String,
//         enum: ['Term 1', 'Term 2', 'Term 3'],
//         required: true,
//       },
//       examType: {
//         type: String,
//         enum: ['Opener Exam', 'Midterm Exam', 'End of Term Exam', 'Random Exams', 'Other Exams'],
//         required: true,
//       },
//       subject: {
//         type: String,
//         required: true,
//       },
//       marks: {
//         type: Number,
//         required: true,
//       },
//     },
//   ],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// //  care purposes
//   interests: {
//       home: [{
//         category: String,
//         activities: [String],
//         notes: String,
//         updatedAt: Date,
//         updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' }
//       }],
//       school: [{
//         category: String,
//         activities: [String],
//         notes: String,
//         updatedAt: Date,
//         updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
//       }]
//     },
//     surveys: [{
//       question: String,
//       answer: String,
//       date: { type: Date, default: Date.now }
//     }],
//     gamePerformance: [{
//       gameName: String,
//       scores: [{
//         date: Date,
//         score: Number,
//         level: Number,
//         timeSpent: Number // in minutes
//       }],
//       overallPerformance: Number
//     }],
//     careerInsights: [{
//       date: Date,
//       potentialCareers: [{
//         career: String,
//         confidenceScore: Number,
//         reasons: [String]
//       }],
//       strengths: [String],
//       areasForImprovement: [String]
//     }]
// });
// module.exports = mongoose.model('Learner', learnerSchema);

// 2nd
// const mongoose = require('mongoose');

// const learnerSchema = new mongoose.Schema({
//   fullName: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   dateOfBirth: {
//     type: Date,
//     required: true,
//   },
//   class: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   stream: {
//     type: String,
//     trim: true,
//     default: null,
//   },
//   admissionNumber: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   birthCertificateNumber: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//   },
//   gender: {
//     type: String,
//     enum: ['M', 'F'],
//     required: true,
//   },
//   parentName: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   parentContact: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   parentEmail: {
//     type: String,
//     required: true,
//     trim: true,
//     lowercase: true,
//   },
//   parentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Parent',
//     default: null,
//   },
//   schoolId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'School',
//     required: true,
//   },
//   results: [
//     {
//       term: {
//         type: String,
//         enum: ['Term 1', 'Term 2', 'Term 3'],
//         required: true,
//       },
//       examType: {
//         type: String,
//         enum: ['Opener Exam', 'Midterm Exam', 'End of Term Exam', 'Random Exams', 'Other Exams'],
//         required: true,
//       },
//       examName: {
//         type: String,
//         trim: true,
//         default: null, // Optional, used only for Random Exams and Other Exams
//       },
//       subject: {
//         type: String,
//         required: true,
//       },
//       marks: {
//         type: Number,
//         required: true,
//       },
//     },
//   ],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   interests: {
//     home: [
//       {
//         category: String,
//         activities: [String],
//         notes: String,
//         updatedAt: Date,
//         updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },
//       },
//     ],
//     school: [
//       {
//         category: String,
//         activities: [String],
//         notes: String,
//         updatedAt: Date,
//         updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
//       },
//     ],
//   },
//   surveys: [
//     {
//       question: String,
//       answer: String,
//       date: { type: Date, default: Date.now },
//     },
//   ],
//   gamePerformance: [
//     {
//       gameName: String,
//       scores: [
//         {
//           date: Date,
//           score: Number,
//           level: Number,
//           timeSpent: Number, // in minutes
//         },
//       ],
//       overallPerformance: Number,
//     },
//   ],
//   careerInsights: [
//     {
//       date: Date,
//       potentialCareers: [
//         {
//           career: String,
//           confidenceScore: Number,
//           reasons: [String],
//         },
//       ],
//       strengths: [String],
//       areasForImprovement: [String],
//     },
//   ],
// });

// module.exports = mongoose.model('Learner', learnerSchema);


// dumping this for adm checks
// const mongoose = require('mongoose');

// const learnerSchema = new mongoose.Schema({
//   fullName: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   dateOfBirth: {
//     type: Date,
//     required: true,
//   },
//   class: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   stream: {
//     type: String,
//     trim: true,
//     default: null,
//   },
//   admissionNumber: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   birthCertificateNumber: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//   },
//   gender: {
//     type: String,
//     enum: ['M', 'F'],
//     required: true,
//   },
//   parentName: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   parentContact: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   parentEmail: {
//     type: String,
//     required: true,
//     trim: true,
//     lowercase: true,
//   },
//   parentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Parent',
//     default: null,
//   },
//   schoolId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'School',
//     required: true,
//   },
//   results: [
//     {
//       term: {
//         type: String,
//         enum: ['Term 1', 'Term 2', 'Term 3'],
//         required: true,
//       },
//       examType: {
//         type: String,
//         enum: ['Opener Exam', 'Midterm Exam', 'End of Term Exam', 'Random Exams', 'Other Exams'],
//         required: true,
//       },
//       examName: {
//         type: String,
//         trim: true,
//         default: null,
//       },
//       subject: {
//         type: String,
//         required: true,
//       },
//       marks: {
//         type: Number,
//         required: true,
//       },
//       updatedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Teacher',
//         default: null,
//       },
//     },
//   ],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   interests: {
//     home: [
//       {
//         category: String,
//         activities: [String],
//         notes: String,
//         updatedAt: Date,
//         updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },
//       },
//     ],
//     school: [
//       {
//         category: String,
//         activities: [String],
//         notes: String,
//         updatedAt: Date,
//         updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
//       },
//     ],
//   },
//   surveys: [
//     {
//       question: String,
//       answer: String,
//       date: { type: Date, default: Date.now },
//     },
//   ],
//   gamePerformance: [
//     {
//       gameName: String,
//       scores: [
//         {
//           date: Date,
//           score: Number,
//           level: Number,
//           timeSpent: Number,
//         },
//       ],
//       overallPerformance: Number,
//     },
//   ],
//   careerInsights: [
//     {
//       date: Date,
//       potentialCareers: [
//         {
//           career: String,
//           confidenceScore: Number,
//           reasons: [String],
//         },
//       ],
//       strengths: [String],
//       areasForImprovement: [String],
//     },
//   ],
// });

// module.exports = mongoose.model('Learner', learnerSchema);

const mongoose = require('mongoose');

const learnerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  class: {
    type: String,
    required: true,
    trim: true,
  },
  stream: {
    type: String,
    trim: true,
    default: null,
  },
  admissionNumber: {
    type: String,
    required: true,
    trim: true,
  },
  birthCertificateNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ['M', 'F'],
    required: true,
  },
  parentName: {
    type: String,
    required: true,
    trim: true,
  },
  parentContact: {
    type: String,
    required: true,
    trim: true,
  },
  parentEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
    default: null,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  results: [
    {
      term: {
        type: String,
        enum: ['Term 1', 'Term 2', 'Term 3'],
        required: true,
      },
      examType: {
        type: String,
        enum: ['Opener Exam', 'Midterm Exam', 'End of Term Exam', 'Random Exams', 'Other Exams'],
        required: true,
      },
      examName: {
        type: String,
        trim: true,
        default: null,
      },
      subject: {
        type: String,
        required: true,
      },
      marks: {
        type: Number,
        required: true,
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        default: null,
      },
      createdAt: {  // Add this field
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  interests: {
    home: [
      {
        category: String,
        activities: [String],
        notes: String,
        updatedAt: Date,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },
      },
    ],
    school: [
      {
        category: String,
        activities: [String],
        notes: String,
        updatedAt: Date,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
      },
    ],
  },
  surveys: [
    {
      question: String,
      answer: String,
      date: { type: Date, default: Date.now },
    },
  ],
  gamePerformance: [
    {
      gameName: String,
      scores: [
        {
          date: Date,
          score: Number,
          level: Number,
          timeSpent: Number,
        },
      ],
      overallPerformance: Number,
    },
  ],
  careerInsights: [
    {
      date: Date,
      potentialCareers: [
        {
          career: String,
          confidenceScore: Number,
          reasons: [String],
        },
      ],
      strengths: [String],
      areasForImprovement: [String],
    },
  ],
});

// Define compound unique index for admissionNumber and schoolId
learnerSchema.index({ admissionNumber: 1, schoolId: 1 }, { unique: true });

module.exports = mongoose.model('Learner', learnerSchema);