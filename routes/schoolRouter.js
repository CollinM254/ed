const express = require("express");
const schoolController = require("../controllers/schoolController");
//const { uploadVideo, uploadNotes } = require('../config/cloudinary');
const { verifyAdminToken } = require("../middleware/authMiddleware");
//const { uploadPostImages, upload } = require('../config/cloudinary');
const {
  uploadVideo,
  uploadNotes,
  uploadPostImages,
  uploadTeacherResources,
} = require("../config/cloudinary");

const teacherResourceController = require("../controllers/teacherResourceController");
const scheduledExamController = require("../controllers/scheduledExamController");

const router = express.Router();

// ========================
// Authentication Routes
// ========================
router.post("/register", schoolController.registerSchool);
router.get("/activate", schoolController.activateSchool);
router.post("/login", schoolController.loginSchool);
router.get("/profile", schoolController.getSchoolProfile);

// ========================
// User Registration & Login
// ========================
router.post("/register-learner", schoolController.registerLearner);
router.post("/learner-login", schoolController.learnerLogin);
router.post("/register-teacher", schoolController.registerTeacher);
router.post("/teacher-login", schoolController.teacherLogin);
router.post("/register-parent", schoolController.registerParent);
router.post("/parent-login", schoolController.parentLogin);
// New route for updating learner
router.put("/learner/:learnerId", schoolController.updateLearner);

// ========================
// Data Retrieval Routes
// ========================
router.get("/learners", schoolController.getLearners);
router.get("/teachers", schoolController.getTeachers);
router.get("/parents", schoolController.getParents);
router.get("/parents/:parentId", schoolController.getParentById);
router.get("/parent/:parentId/learner", schoolController.getLearnerByParent);
router.get("/:schoolId/streams", schoolController.getSchoolStreams);

// ========================
// Academic Routes
// ========================
// router.post('/update-results', schoolController.updateResults);
// router.get('/learner/:learnerId/results', schoolController.getResults);
// router.get('/parent/:parentId/results/:schoolId', schoolController.getResultsForParent);
// router.get('/:schoolId/performance', schoolController.getSchoolPerformance);

// Academic Routes
router.post("/update-results", schoolController.updateResults);
router.post("/update-results/batch", schoolController.updateBatchResults);
router.post("/results/class", schoolController.getClassResults);
router.delete("/results", schoolController.deleteResult);
router.delete("/results/batch", schoolController.deleteBatchResults);
router.get("/learner/:learnerId/results", schoolController.getResults);
router.get(
  "/parent/:parentId/results/:schoolId",
  schoolController.getResultsForParent
);
router.get("/:schoolId/performance", schoolController.getSchoolPerformance);
// router.get('/:schoolId/performance/details', schoolController.getExamDetails);
// Add the new class performance route here
router.get("/class-performance", schoolController.getClassPerformanceData);
router.get(
  "/learner/historical-positions",
  schoolController.getLearnerHistoricalPositions
);
router.post(
  "/learner/bulk-historical-positions",
  schoolController.getBulkHistoricalPositions
);
// In your routes file, add some middleware to debug
router.get(
  "/:schoolId/performance/previous-positions",
  (req, res, next) => {
    console.log("Route params:", req.params);
    console.log("Query params:", req.query);
    next();
  },
  schoolController.getPreviousExamPositions
);
// Performance routes
// Performance routes - FIXED: Use schoolController object
router.get(
  "/:schoolId/performance/classes",
  schoolController.getPerformanceClasses
);
router.get(
  "/:schoolId/performance/terms",
  schoolController.getPerformanceTerms
);
router.get(
  "/:schoolId/performance/exam-types",
  schoolController.getPerformanceExamTypes
);
router.get(
  "/:schoolId/performance/exam-names",
  schoolController.getPerformanceExamNames
);
router.get(
  "/:schoolId/performance/filtered",
  schoolController.getFilteredSchoolPerformance
);

// Add this to your routes
router.get('/:schoolId/performance/term', schoolController.getTermPerformance);
// ========================
// Assignment Routes
// ========================

router.post("/assignments", schoolController.createAssignment);
router.get(
  "/assignments/id/:assignmentId",
  schoolController.getAssignmentDetails
);
router.get("/assignments/:className", schoolController.getAssignmentsByClass);
router.get(
  "/teachers/:teacherId/assignments",
  schoolController.getTeacherAssignments
);
router.post(
  "/assignments/id/:assignmentId/submit",
  schoolController.submitAssignment
);
router.get(
  "/assignments/id/:assignmentId/responses",
  schoolController.getAssignmentResponses
);
router.get(
  "/assignments/id/:assignmentId/submission-status",
  schoolController.checkSubmissionStatus
);

// ========================
// Career Insights Routes
// ========================
router.get(
  "/learner/:learnerId/career-insights",
  schoolController.getCareerInsights
);
router.post(
  "/update-career-insights",
  schoolController.updateCareerInsightsManual
);
router.get("/debug-learner/:learnerId", schoolController.debugLearnerData);
router.get(
  "/learner/:learnerId/interests",
  schoolController.getLearnerInterests
);
router.post("/update-home-interests", schoolController.updateHomeInterests);
router.post("/update-school-interests", schoolController.updateSchoolInterests);
router.post("/submit-survey", schoolController.submitSurveyResponse);
router.post("/record-game-performance", schoolController.recordGamePerformance);

// ========================
// Communication Routes
// ========================
router.post("/chat/messages", schoolController.createMessage);
router.get("/chat/messages", schoolController.getMessages);
router.get("/chat/conversations", schoolController.getConversations);

// ========================
// Content Management
// ========================
router.post("/publish-event", schoolController.publishEvent);
router.get("/events", schoolController.getEvents);

router.put("/events/:eventId", schoolController.updateEvent); // New route for updating events
router.delete("/events/:eventId", schoolController.deleteEvent); // New route for deleting events

router.post("/publish-news", schoolController.publishNews);
router.get("/news/:schoolId", schoolController.getNews);

router.put("/news/:newsId", schoolController.updateNews);
router.delete("/news/:newsId", schoolController.deleteNews);

router.post(
  "/upload-video",
  uploadVideo.single("video"),
  schoolController.uploadVideo
);
router.get("/videos", schoolController.getVideosByClass);
router.post("/publish-special-event", schoolController.publishSpecialEvent);
router.get(
  "/parent/:parentId/special-events",
  schoolController.getSpecialEventsForParent
);

// ========================
// Administrative Routes
// ========================
router.post("/transfer-requests", schoolController.submitTransferRequest);
router.get(
  "/parents/:parentId/transfer-requests",
  schoolController.getParentTransferRequests
);
router.get(
  "/:schoolId/transfer-requests",
  schoolController.getSchoolTransferRequests
);
router.patch(
  "/transfer-requests/:requestId",
  schoolController.updateTransferRequestStatus
);
router.post("/delete-student", schoolController.deleteStudent);
router.get("/deleted-students", schoolController.getDeletedStudents);

// ========================
// Financial Routes
// ========================
router.post("/update-fee-structure", schoolController.updateFeeStructure);
router.put(
  "/update-fee-structure/:id",
  schoolController.updateFeeStructureById
);
router.get("/:schoolId/fee-structures", schoolController.getFeeStructures);
router.post("/update-student-fee", schoolController.updateStudentFee);
router.get(
  "/parent/:parentId/fees/:schoolId",
  schoolController.getStudentFeesForParent
);
// Add these new routes to your financial routes

router.delete(
  "/fee-structure/:feeStructureId",
  schoolController.deleteFeeStructure
);
router.get(
  "/:schoolId/filtered-fee-structures",
  schoolController.getFilteredFeeStructures
);

// ========================
// Discipline Routes
// ========================
router.post("/report-indiscipline", schoolController.reportIndisciplineCase);
router.get(
  "/learner/:learnerId/indiscipline-cases",
  schoolController.getIndisciplineCasesForLearner
);
router.get(
  "/parent/:parentId/indiscipline-cases",
  schoolController.getIndisciplineCasesForParent
);

// ========================
// Notes Routes
// ========================
router.post(
  "/upload-notes",
  uploadNotes.single("file"),
  schoolController.uploadNotes
);
router.get("/notes", schoolController.getNotesByClass);

// Add these to your existing routes
// In schoolRoutes.js
// Teacher stats routes
router.get(
  "/:schoolId/teachers/:teacherId/assignments/count",
  schoolController.getTeacherAssignmentsCount
);
router.get(
  "/:schoolId/teachers/:teacherId/videos/stats",
  schoolController.getTeacherVideoStats
);
router.get("/teachers/:teacherId/videos", schoolController.getTeacherVideos);
router.post("/videos/view", schoolController.recordVideoView);

// ========================
// Admin Routes
// ========================
router.post("/admin/request-code", schoolController.requestAdminCode);
router.post("/admin/verify-code", schoolController.verifyAdminCode);
router.get(
  "/admin/validate-token",
  verifyAdminToken,
  schoolController.validateAdminToken
);
router.get("/admin/schools", verifyAdminToken, schoolController.getAllSchools);
router.get(
  "/admin/schools/:schoolId",
  verifyAdminToken,
  schoolController.getSchoolDetails
);
router.get(
  "/admin/schools/:schoolId/students",
  verifyAdminToken,
  schoolController.getSchoolStudents
);
router.get(
  "/admin/schools/:schoolId/teachers",
  verifyAdminToken,
  schoolController.getSchoolTeachers
);
router.get(
  "/admin/schools/:schoolId/parents",
  verifyAdminToken,
  schoolController.getSchoolParents
);

// In your routes file
router.delete(
  "/admin/schools/:schoolId",
  verifyAdminToken,
  schoolController.deleteSchool
);
router.get("/admin/deleted-schools", schoolController.getDeletedSchools);

// Post-related routes
router.post(
  "/posts",
  uploadPostImages.array("images", 5),
  schoolController.createPost
);
router.get("/posts", schoolController.getPosts);
router.post("/posts/like", schoolController.toggleLike);
router.get("/schools/:schoolId/posts", schoolController.getPostsBySchool);

// Add these with your other post routes
router.put(
  "/posts/update",
  uploadPostImages.array("images", 5),
  schoolController.updatePost
);
router.delete("/posts/delete", schoolController.deletePost);

router.get("/profile", schoolController.getSchoolProfile);
router.put("/:schoolId", schoolController.updateSchoolProfile);
router.get("/:schoolId/feed", schoolController.getSchoolFeed);

// Guest Learner Routes
router.post("/register-guest-learner", schoolController.registerGuestLearner);
router.post("/guest-learner-login", schoolController.guestLearnerLogin);
router.get("/guest-learners", schoolController.getGuestLearners);

// Teacher Resources Routes
//router.post('/teacher-resources', verifyAdminToken, uploadNotes.single('file'), teacherResourceController.uploadTeacherResource);
router.post(
  "/teacher-resources",
  uploadTeacherResources.single("file"),
  teacherResourceController.uploadTeacherResource
);
router.get(
  "/teacher-resources",
  teacherResourceController.getAllTeacherResources
);
router.get(
  "/teacher-resources/categories",
  teacherResourceController.getResourceCategories
);
// router.get('/teacher-resources/filter', teacherResourceController.getResourcesByClassAndSubject);
router.get(
  "/teacher-resources/filter",
  teacherResourceController.getResourcesByFilter
);

// Add this to your routes file
router.get(
  "/teacher-resources/:id/download-url",
  teacherResourceController.getDownloadUrl
);

// National Events Routes
router.post("/publish-amplified-event", schoolController.publishAmplifiedEvent);
router.get("/amplified-events", schoolController.getAmplifiedEvents);
router.get(
  "/latest-amplified-events",
  schoolController.getLatestAmplifiedEvents
);

// Scholarships Routes
router.post("/publish-scholarship", schoolController.publishScholarship);
router.get("/scholarships", schoolController.getAllScholarships);
router.get("/latest-scholarships", schoolController.getLatestScholarships);

// Add this with your other routes
router.post("/users/device-token", schoolController.registerDeviceToken);

// Add these with your other post routes
router.post("/posts/comment", schoolController.addComment);
router.post("/posts/comment/like", schoolController.toggleCommentLike);
router.delete("/posts/comment/delete", schoolController.deleteComment);

// Add these routes to your existing schoolRoutes.js
router.put("/teachers/:teacherId", schoolController.updateTeacher);
router.delete("/teachers/:teacherId", schoolController.deleteTeacher);

// router.post('/schedule-exam', scheduledExamController.scheduleExam);
// router.get('/scheduled-exams', scheduledExamController.getScheduledExams);
// router.get('/scheduled-exams/submitted-results', scheduledExamController.getSubmittedResults);

// Scheduled Exam Routes
router.post("/schedule-exam", scheduledExamController.scheduleExam);
router.get("/scheduled-exams", scheduledExamController.getScheduledExams);
router.get(
  "/scheduled-exams/submitted-results",
  scheduledExamController.getSubmittedResults
);
router.get(
  "/:schoolId/exams/:examId/results/summary",
  scheduledExamController.getResultsSummary
);

router.delete(
  "/scheduled-exams/:examId",
  scheduledExamController.deleteScheduledExam
);
router.put(
  "/scheduled-exams/:examId",
  scheduledExamController.updateScheduledExam
);

module.exports = router;
