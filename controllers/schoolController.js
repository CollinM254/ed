const mongoose = require("mongoose");
const School = require("../models/School");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Learner = require("../models/Learner");
const Parent = require("../models/Parent");
const Teacher = require("../models/Teacher");
const Event = require("../models/Event");
//for messages
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const News = require("../models/News");
const ParentRequestTransfer = require("../models/ParentRequestTransfer");
const DeletedStudent = require("../models/DeletedStudent");
const FeeStructure = require("../models/FeeStructure");
const StudentFee = require("../models/StudentFee");
const SpecialEvent = require("../models/SpecialEvent");
const IndisciplineCase = require("../models/IndisciplineCase");
const DeletedSchool = require("../models/DeletedSchool");
const { cloudinary, storage } = require("../config/cloudinary");
const multer = require("multer");
const Video = require("../models/Video");
const VideoView = require("../models/VideoView");
const Post = require("../models/Post");
const GuestLearner = require("../models/GuestLearner");

const AmplifiedEvent = require("../models/AmplifiedEvent");
const Scholarship = require("../models/Scholarship");
const Note = require("../models/Note");
const Assignment = require("../models/Assignment");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const AdminCode = require("../models/AdminCode");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET || "DWEIOJFEIOTUERTDJDFHJKSDGJKGHJKG";

require("dotenv").config();

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Generate Activation Token
const generateActivationToken = () => crypto.randomBytes(20).toString("hex");

// // Register School

// In your schoolController.js, update the registerSchool function:
exports.registerSchool = async (req, res) => {
  const {
    schoolName,
    schoolCode,
    county,
    subcounty,
    location,
    village,
    address,
    phoneNumber,
    email,
    website,
    maxStreamsPerClass,
    classStreams,
  } = req.body;

  try {
    const existingSchool = await School.findOne({
      $or: [{ schoolCode }, { email }],
    });
    if (existingSchool) {
      return res
        .status(400)
        .json({ message: "School code or email already exists." });
    }

    const activationToken = generateActivationToken();
    const newSchool = new School({
      schoolName,
      schoolCode,
      county,
      subcounty,
      location,
      village,
      address,
      phoneNumber,
      email,
      website,
      maxStreamsPerClass: maxStreamsPerClass || 1,
      classStreams: classStreams || {},
      activationToken,
      isActive: false,
    });

    await newSchool.save();
    const activationLink = `https://kidsm.vercel.app/api/schools/activate?token=${activationToken}`;
    const mailOptions = {
      from: `"School Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Activate Your School Account",
      html: `
        <p>Dear ${schoolName},</p>
        <p>Thank you for registering. Please click the link below to activate your account:</p>
        <p><a href="${activationLink}" style="color:blue;">Activate Account</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>Kids Matter Team</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "Failed to send activation email." });
      }
      console.log("Activation email sent:", info.response);
      res.status(201).json({
        message:
          "School registered successfully. Check your email to activate your account.",
      });
    });

    // Rest of the function remains the same...
  } catch (error) {
    console.error("Error registering school:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Add a new endpoint to get school streams
exports.getSchoolStreams = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const school = await School.findById(schoolId).select(
      "classStreams maxStreamsPerClass"
    );
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res.status(200).json({
      classStreams: school.classStreams || {},
      maxStreamsPerClass: school.maxStreamsPerClass || 1,
    });
  } catch (error) {
    console.error("Error fetching school streams:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Activate School
exports.activateSchool = async (req, res) => {
  const { token } = req.query;

  try {
    const school = await School.findOne({ activationToken: token });
    if (!school) {
      return res.status(400).send(`
        <html>
          <body>
            <h1>Activation Failed</h1>
            <p>Invalid activation token. Please check the link and try again.</p>
          </body>
        </html>
      `);
    }

    school.isActive = true;
    school.activationToken = undefined;
    await school.save();

    res.status(200).send(`
      <html>
        <body>
          <h1>Activation Successful</h1>
          <p>Your school account has been activated. You can now open the app and log in.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error activating school:", error);
    res.status(500).send(`
      <html>
        <body>
          <h1>Activation Failed</h1>
          <p>An internal server error occurred. Please try again later.</p>
        </body>
      </html>
    `);
  }
};

//// Login School
// Generate 6-character alphanumeric code in uppercase
const generateVerificationCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Send verification email
const sendVerificationEmail = async (email, schoolName, code) => {
  const mailOptions = {
    from: `"School Admin" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Login Verification Code",
    html: `
      <p>Dear ${schoolName},</p>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this, please secure your account.</p>
      <p>Best regards,<br>Kids Matter Team</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// // Login School
// exports.loginSchool = async (req, res) => {
//   const { email, schoolCode } = req.body;

//   // Debug logging
//   console.log("Login attempt:", { email, schoolCode });

//   try {
//     // Trim and clean inputs
//     const cleanEmail = email.trim().toLowerCase();
//     const cleanSchoolCode = schoolCode.trim();

//     const school = await School.findOne({ email: cleanEmail });

//     // Debug logging
//     console.log(
//       "Found school:",
//       school
//         ? {
//             _id: school._id,
//             email: school.email,
//             schoolCode: school.schoolCode,
//             isActive: school.isActive,
//           }
//         : "No school found"
//     );

//     if (!school) {
//       console.log("Login failed: Email not found");
//       return res.status(400).json({ message: "Email is incorrect." });
//     }

//     if (school.schoolCode !== cleanSchoolCode) {
//       console.log("Login failed: School code mismatch", {
//         inputCode: cleanSchoolCode,
//         dbCode: school.schoolCode,
//       });
//       return res.status(400).json({ message: "School code is incorrect." });
//     }

//     if (!school.isActive) {
//       console.log("Login failed: Account not active");
//       return res
//         .status(400)
//         .json({
//           message: "Your account is not activated. Please check your email.",
//         });
//     }

//     console.log("Login successful for school:", school._id);
//     res.status(200).json({
//       message: "Login successful",
//       schoolId: school._id,
//       schoolName: school.schoolName, // Include school name in response
//     });
//   } catch (error) {
//     console.error("Error logging in:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };
// Modified loginSchool function to handle both flows
exports.loginSchool = async (req, res) => {
  const {
    email,
    schoolCode,
    verificationCode: verificationCodeFromRequest,
  } = req.body;

  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanSchoolCode = schoolCode.trim();

    // If verificationCode is provided, handle verification phase
    if (verificationCodeFromRequest) {
      const cleanCode = verificationCodeFromRequest.trim().toUpperCase();
      const school = await School.findOne({ email: cleanEmail });

      if (!school) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification request.",
        });
      }

      // Check if code exists and is not expired
      if (
        !school.verificationCode ||
        new Date() > school.verificationCodeExpires
      ) {
        return res.status(400).json({
          success: false,
          message: "Verification code expired. Please request a new one.",
        });
      }

      // Check verification attempts
      if (school.verificationAttempts >= 3) {
        return res.status(400).json({
          success: false,
          message: "Too many attempts. Please request a new code.",
        });
      }

      // Verify the code
      if (school.verificationCode !== cleanCode) {
        school.verificationAttempts += 1;
        await school.save();

        const attemptsLeft = 3 - school.verificationAttempts;
        return res.status(400).json({
          success: false,
          message: `Invalid verification code. ${
            attemptsLeft > 0
              ? `${attemptsLeft} attempts remaining`
              : "No attempts remaining"
          }.`,
        });
      }

      // Code is valid - clear verification data
      school.verificationCode = undefined;
      school.verificationCodeExpires = undefined;
      school.verificationAttempts = undefined;
      await school.save();

      // Successful verification
      return res.status(200).json({
        success: true,
        message: "Login successful",
        schoolId: school._id,
        schoolName: school.schoolName,
      });
    }

    // Traditional login flow (first phase - initiate verification)
    const school = await School.findOne({ email: cleanEmail });

    if (!school) {
      return res.status(400).json({
        success: false,
        message: "Email is incorrect.",
        requiresVerification: false,
      });
    }

    if (school.schoolCode !== cleanSchoolCode) {
      return res.status(400).json({
        success: false,
        message: "School code is incorrect.",
        requiresVerification: false,
      });
    }

    if (!school.isActive) {
      return res.status(400).json({
        success: false,
        message: "Your account is not activated. Please check your email.",
        requiresVerification: false,
      });
    }

    // Generate and save verification code
    const newVerificationCode = generateVerificationCode(); // Changed variable name here
    school.verificationCode = newVerificationCode;
    school.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    school.verificationAttempts = 0;
    await school.save();

    // Send verification email
    await sendVerificationEmail(
      school.email,
      school.schoolName,
      newVerificationCode
    );

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      requiresVerification: true,
      email: cleanEmail, // Return email for the next step
    });
  } catch (error) {
    console.error("Error in login process:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Get School Profile
exports.getSchoolProfile = async (req, res) => {
  const { email } = req.query;

  try {
    const school = await School.findOne({ email });
    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    res
      .status(200)
      .json({ schoolName: school.schoolName, schoolId: school._id });
  } catch (error) {
    console.error("Error fetching school profile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//register learner

exports.registerLearner = async (req, res) => {
  const {
    fullName,
    dateOfBirth,
    class: className,
    stream,
    admissionNumber,
    birthCertificateNumber,
    gender,
    parentName,
    parentContact,
    parentEmail,
    parentId,
    schoolId,
  } = req.body;

  try {
    // Check if the birthCertificateNumber is already registered across all schools
    const existingLearner = await Learner.findOne({ birthCertificateNumber });
    if (existingLearner) {
      return res.status(400).json({
        message: "A learner with this birth certificate number already exists.",
      });
    }

    // Check if the admissionNumber is already registered in the same school
    const existingAdmission = await Learner.findOne({
      admissionNumber,
      schoolId,
    });
    if (existingAdmission) {
      return res
        .status(400)
        .json({ message: "Admission number already exists in this school." });
    }

    // Get school to check if streams are required for this class
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    // Properly check for streams in the Map
    const classHasStreams =
      school.classStreams &&
      school.classStreams.get(className) &&
      school.classStreams.get(className).length > 0;

    // Validate stream if required
    if (classHasStreams && !stream) {
      return res
        .status(400)
        .json({ message: "Stream is required for this class." });
    }

    const newLearner = new Learner({
      fullName,
      dateOfBirth: new Date(dateOfBirth),
      class: className,
      stream: classHasStreams ? stream : null,
      admissionNumber,
      birthCertificateNumber,
      gender,
      parentName,
      parentContact,
      parentEmail,
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
      schoolId,
    });

    await newLearner.save();
    res.status(201).json({ message: "Learner registered successfully." });
  } catch (error) {
    console.error("Error registering learner:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.updateLearner = async (req, res) => {
  const { learnerId } = req.params;
  const {
    fullName,
    dateOfBirth,
    class: className,
    stream,
    admissionNumber,
    birthCertificateNumber,
    gender,
    parentName,
    parentContact,
    parentEmail,
    parentId,
    schoolId,
  } = req.body;

  try {
    // Find the learner
    const learner = await Learner.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ message: "Learner not found." });
    }

    // Check if the birthCertificateNumber is already registered with another learner
    if (
      birthCertificateNumber &&
      birthCertificateNumber !== learner.birthCertificateNumber
    ) {
      const existingLearner = await Learner.findOne({ birthCertificateNumber });
      if (existingLearner && existingLearner._id.toString() !== learnerId) {
        return res.status(400).json({
          message:
            "A learner with this birth certificate number already exists.",
        });
      }
    }

    // Check if the admissionNumber is already registered in the same school
    if (admissionNumber && admissionNumber !== learner.admissionNumber) {
      const existingAdmission = await Learner.findOne({
        admissionNumber,
        schoolId,
      });
      if (existingAdmission && existingAdmission._id.toString() !== learnerId) {
        return res
          .status(400)
          .json({ message: "Admission number already exists in this school." });
      }
    }

    // Get school to check if streams are required for this class
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    // Properly check for streams in the Map
    const classHasStreams =
      school.classStreams &&
      school.classStreams.get(className) &&
      school.classStreams.get(className).length > 0;

    // Validate stream if required
    if (classHasStreams && !stream) {
      return res
        .status(400)
        .json({ message: "Stream is required for this class." });
    }

    // Update learner fields
    learner.fullName = fullName || learner.fullName;
    learner.dateOfBirth = dateOfBirth
      ? new Date(dateOfBirth)
      : learner.dateOfBirth;
    learner.class = className || learner.class;
    learner.stream = classHasStreams ? stream : null;
    learner.admissionNumber = admissionNumber || learner.admissionNumber;
    learner.birthCertificateNumber =
      birthCertificateNumber || learner.birthCertificateNumber;
    learner.gender = gender || learner.gender;
    learner.parentName = parentName || learner.parentName;
    learner.parentContact = parentContact || learner.parentContact;
    learner.parentEmail = parentEmail || learner.parentEmail;
    learner.parentId = parentId
      ? new mongoose.Types.ObjectId(parentId)
      : learner.parentId;

    await learner.save();
    res.status(200).json({ message: "Learner updated successfully.", learner });
  } catch (error) {
    console.error("Error updating learner:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//learner login

exports.learnerLogin = async (req, res) => {
  const { birthCertificateNumber, admissionNumber } = req.body;

  try {
    const learner = await Learner.findOne({
      birthCertificateNumber,
      admissionNumber,
    });
    if (!learner) {
      return res.status(400).json({
        message: "Invalid birth certificate number or admission number.",
      });
    }

    // Fetch the school name using the schoolId from the learner document
    const school = await School.findById(learner.schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    res.status(200).json({
      message: "Login successful",
      learnerId: learner._id,
      learnerName: learner.fullName,
      schoolName: school.schoolName,
      schoolId: learner.schoolId, // Add this line to include schoolId
      class: learner.class,
    });
  } catch (error) {
    console.error("Error logging in learner:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Register Teacher
exports.registerTeacher = async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    subjectSpecialization,
    tscNumber,
    gender,
    classRepresenting,
    schoolId,
  } = req.body;

  try {
    const existingTeacher = await Teacher.findOne({
      $or: [{ email }, { tscNumber }],
    });
    if (existingTeacher) {
      return res
        .status(400)
        .json({ message: "Email or TSC number already exists." });
    }

    const newTeacher = new Teacher({
      fullName,
      email,
      phoneNumber,
      subjectSpecialization,
      tscNumber,
      gender,
      classRepresenting,
      schoolId,
    });

    await newTeacher.save();
    res.status(201).json({ message: "Teacher registered successfully." });
  } catch (error) {
    console.error("Error registering teacher:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//teacher login
exports.teacherLogin = async (req, res) => {
  const { email, tscNumber } = req.body;

  try {
    const teacher = await Teacher.findOne({ email, tscNumber });
    if (!teacher) {
      return res.status(400).json({ message: "Invalid email or TSC number." });
    }

    // Fetch the school name and schoolId using the schoolId from the teacher document
    const school = await School.findById(teacher.schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    res.status(200).json({
      message: "Login successful",
      teacherId: teacher._id,
      teacherName: teacher.fullName,
      gender: teacher.gender,
      schoolName: school.schoolName,
      schoolId: teacher.schoolId, // Include schoolId in the response
    });
  } catch (error) {
    console.error("Error logging in teacher:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Add these to your existing schoolController.js

exports.updateTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const {
    fullName,
    email,
    phoneNumber,
    subjectSpecialization,
    tscNumber,
    classRepresenting,
    schoolId,
  } = req.body;

  try {
    const teacher = await Teacher.findOne({ _id: teacherId, schoolId });
    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found or does not belong to this school.",
      });
    }

    // Check for duplicate email or TSC number
    const existingTeacher = await Teacher.findOne({
      $or: [{ email }, { tscNumber }],
      _id: { $ne: teacherId },
    });
    if (existingTeacher) {
      return res
        .status(400)
        .json({ message: "Email or TSC number already exists." });
    }

    teacher.fullName = fullName;
    teacher.email = email;
    teacher.phoneNumber = phoneNumber;
    teacher.subjectSpecialization = subjectSpecialization;
    teacher.tscNumber = tscNumber;
    teacher.classRepresenting = classRepresenting;

    await teacher.save();
    res.status(200).json({ message: "Teacher details updated successfully." });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.deleteTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const { schoolId } = req.body;

  try {
    const teacher = await Teacher.findOne({ _id: teacherId, schoolId });
    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found or does not belong to this school.",
      });
    }

    await Teacher.deleteOne({ _id: teacherId });
    res.status(200).json({ message: "Teacher deleted successfully." });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get Learners by School

exports.getLearners = async (req, res) => {
  const { schoolId } = req.query;
  const { fields } = req.query;

  try {
    // Ensure stream is always included unless explicitly excluded
    const defaultFields =
      "fullName admissionNumber parentName parentEmail parentContact class stream parentId schoolId _id birthCertificateNumber";

    const learners = await Learner.find({ schoolId }).select(
      fields || defaultFields
    );

    res.status(200).json(learners);
  } catch (error) {
    console.error("Error fetching learners:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Register Parent

exports.registerParent = async (req, res) => {
  const {
    parentName,
    contactNumber,
    email,
    idNumber,
    gender,
    relationship,
    learnerAdmissionNumber, // Use learner's admission number to find the learner
    schoolId,
  } = req.body;

  try {
    // Find the learner by admission number
    const learner = await Learner.findOne({
      admissionNumber: learnerAdmissionNumber,
      schoolId,
    });
    if (!learner) {
      return res.status(400).json({ message: "Learner not found." });
    }

    // Check if the parent already exists
    const existingParent = await Parent.findOne({ idNumber });
    if (existingParent) {
      return res
        .status(400)
        .json({ message: "Parent with this ID number already exists." });
    }

    // Create the new parent
    const newParent = new Parent({
      parentName,
      contactNumber,
      email,
      idNumber,
      gender,
      relationship,
      learnerId: learner._id, // Associate parent with the learner
      schoolId,
    });

    await newParent.save();

    // Update the learner with the parentId
    learner.parentId = newParent._id;
    await learner.save();

    res.status(201).json({ message: "Parent registered successfully." });
  } catch (error) {
    console.error("Error registering parent:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Parent Login

exports.parentLogin = async (req, res) => {
  const { email, idNumber } = req.body;

  try {
    const parent = await Parent.findOne({ email, idNumber }).populate(
      "learnerId"
    );
    if (!parent) {
      return res.status(400).json({ message: "Invalid email or ID number." });
    }

    // Include parent details and learner name in the response
    res.status(200).json({
      message: "Login successful",
      parentId: parent._id,
      schoolId: parent.schoolId,
      parentName: parent.parentName,
      learnerName: parent.learnerId.fullName, // Assuming the learner's fullName is stored in the Learner model
    });
  } catch (error) {
    console.error("Error logging in parent:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get Teachers by School
exports.getTeachers = async (req, res) => {
  const { schoolId } = req.query;

  try {
    const teachers = await Teacher.find({ schoolId });
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get Parents by School

exports.getParents = async (req, res) => {
  const { schoolId } = req.query;

  try {
    const parents = await Parent.find({ schoolId }).populate({
      path: "learnerId",
      select: "fullName class admissionNumber", // Select the fields you need from the Learner model
    });

    // Map the parents to include learner details in the response
    const parentsWithLearnerDetails = parents.map((parent) => ({
      ...parent.toObject(),
      learnerName: parent.learnerId?.fullName || "N/A",
      learnerClass: parent.learnerId?.class || "N/A",
      learnerAdmissionNumber: parent.learnerId?.admissionNumber || "N/A",
    }));

    res.status(200).json(parentsWithLearnerDetails);
  } catch (error) {
    console.error("Error fetching parents:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Publish Event
exports.publishEvent = async (req, res) => {
  const {
    eventName,
    dateTime,
    venue,
    organizer,
    objective,
    targetAudience,
    eventTheme,
    schedule,
    keySpeakers,
    workshops,
    entryRequirements,
    parkingTransport,
    cateringRefreshments,
    dressCode,
    sponsorships,
    contactInformation,
    schoolId,
  } = req.body;

  try {
    const newEvent = new Event({
      eventName,
      dateTime,
      venue,
      organizer,
      objective,
      targetAudience,
      eventTheme,
      schedule,
      keySpeakers,
      workshops,
      entryRequirements,
      parkingTransport,
      cateringRefreshments,
      dressCode,
      sponsorships,
      contactInformation,
      schoolId,
    });

    await newEvent.save();
    res
      .status(201)
      .json({ message: "Event published successfully.", event: newEvent });
  } catch (error) {
    console.error("Error publishing event:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get Events by School
exports.getEvents = async (req, res) => {
  const { schoolId } = req.query;

  try {
    const events = await Event.find({ schoolId });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update Event
exports.updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const {
    eventName,
    dateTime,
    venue,
    organizer,
    objective,
    targetAudience,
    eventTheme,
    schedule,
    keySpeakers,
    workshops,
    entryRequirements,
    parkingTransport,
    cateringRefreshments,
    dressCode,
    sponsorships,
    contactInformation,
    schoolId,
  } = req.body;

  try {
    const event = await Event.findOne({ _id: eventId, schoolId });
    if (!event) {
      return res.status(404).json({
        message:
          "Event not found or you do not have permission to edit this event.",
      });
    }

    // Update event fields
    event.eventName = eventName || event.eventName;
    event.dateTime = dateTime || event.dateTime;
    event.venue = venue || event.venue;
    event.organizer = organizer || event.organizer;
    event.objective = objective || event.objective;
    event.targetAudience = targetAudience || event.targetAudience;
    event.eventTheme = eventTheme || event.eventTheme;
    event.schedule = schedule || event.schedule;
    event.keySpeakers = keySpeakers || event.keySpeakers;
    event.workshops = workshops || event.workshops;
    event.entryRequirements = entryRequirements || event.entryRequirements;
    event.parkingTransport = parkingTransport || event.parkingTransport;
    event.cateringRefreshments =
      cateringRefreshments || event.cateringRefreshments;
    event.dressCode = dressCode || event.dressCode;
    event.sponsorships = sponsorships || event.sponsorships;
    event.contactInformation = contactInformation || event.contactInformation;

    await event.save();
    res.status(200).json({ message: "Event updated successfully.", event });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  const { eventId } = req.params;
  const { schoolId } = req.body;

  try {
    const event = await Event.findOneAndDelete({ _id: eventId, schoolId });
    if (!event) {
      return res.status(404).json({
        message:
          "Event not found or you do not have permission to delete this event.",
      });
    }

    res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get Parent by ID
exports.getParentById = async (req, res) => {
  const { parentId } = req.params;

  try {
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found." });
    }

    res.status(200).json(parent);
  } catch (error) {
    console.error("Error fetching parent details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// locking existing results to prevent duplicates
exports.updateResults = async (req, res) => {
  console.log("\n=== NEW UPDATE REQUEST ===");
  console.log("Request Body:", JSON.stringify(req.body, null, 2));

  const { learnerId, results, teacherId, schoolId } = req.body;

  try {
    if (!learnerId) {
      console.log("Missing learnerId");
      return res.status(400).json({ message: "learnerId is required" });
    }

    if (!schoolId) {
      console.log("Missing schoolId");
      return res.status(400).json({ message: "schoolId is required" });
    }

    if (!results || !Array.isArray(results)) {
      console.log("Invalid results format");
      return res.status(400).json({ message: "results must be an array" });
    }

    console.log("Looking for learner:", learnerId);
    const learner = await Learner.findById(learnerId);

    if (!learner) {
      console.log("Learner not found");
      return res.status(404).json({ message: "Learner not found" });
    }

    if (learner.schoolId.toString() !== schoolId) {
      console.log("Learner does not belong to this school");
      return res
        .status(403)
        .json({ message: "Learner does not belong to this school" });
    }

    console.log("Current results:", learner.results);

    for (const result of results) {
      const { term, examType, examName, subject, marks } = result;

      console.log(
        `\nProcessing: ${subject} (${term}, ${examType}${
          examName ? ` - ${examName}` : ""
        })`
      );

      // Check if result already exists for this criteria
      const existingIndex = learner.results.findIndex(
        (r) =>
          r.term === term &&
          r.examType === examType &&
          (examType === "Random Exams" || examType === "Other Exams"
            ? r.examName === examName
            : true) &&
          r.subject === subject &&
          r.marks !== "" &&
          r.marks != null
      );

      if (existingIndex >= 0) {
        console.log(
          `Result already exists for ${subject} (${term}, ${examType}${
            examName ? ` - ${examName}` : ""
          })`
        );
        return res.status(409).json({
          success: false,
          message:
            "Results already exist for this class, stream, subject, term, and exam type. Please use different criteria or contact the school administration to modify results.",
        });
      }

      // If no existing result, add new result
      console.log("Adding new result record");
      const newResult = {
        term,
        examType,
        subject,
        marks,
        updatedBy: teacherId,
      };
      if (examName) {
        newResult.examName = examName;
      }
      learner.results.push(newResult);
    }

    console.log("Saving updated learner...");
    await learner.save();
    console.log("Save successful!");

    res.status(200).json({
      success: true,
      message: "Results updated successfully",
      updatedResults: learner.results,
    });
  } catch (error) {
    console.error("\n!!! ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.updateBatchResults = async (req, res) => {
  const { results, teacherId, schoolId } = req.body;

  try {
    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ message: "results must be an array" });
    }

    if (!schoolId) {
      return res.status(400).json({ message: "schoolId is required" });
    }

    const updatePromises = results.map(
      async ({ learnerId, results: updates }) => {
        const learner = await Learner.findById(learnerId);
        if (!learner) {
          throw new Error(`Learner not found: ${learnerId}`);
        }

        if (learner.schoolId.toString() !== schoolId) {
          throw new Error(
            `Learner does not belong to this school: ${learnerId}`
          );
        }

        for (const update of updates) {
          const { term, examType, examName, subject, marks } = update;

          const existingIndex = learner.results.findIndex(
            (r) =>
              r.term === term &&
              r.examType === examType &&
              (examType === "Random Exams" || examType === "Other Exams"
                ? r.examName === examName
                : true) &&
              r.subject === subject
          );

          if (existingIndex >= 0) {
            learner.results[existingIndex].marks = marks;
            if (teacherId) {
              learner.results[existingIndex].updatedBy = teacherId;
            }
          } else {
            if (!teacherId) {
              throw new Error("teacherId is required for new results");
            }
            const newResult = {
              term,
              examType,
              subject,
              marks,
              updatedBy: teacherId,
            };
            if (examName) {
              newResult.examName = examName;
            }
            learner.results.push(newResult);
          }
        }

        return learner.save();
      }
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Batch results updated successfully",
    });
  } catch (error) {
    console.error("Error updating batch results:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getClassResults = async (req, res) => {
  const { learnerIds, term, examType, examName, subject } = req.body;

  try {
    if (
      !learnerIds ||
      !Array.isArray(learnerIds) ||
      !term ||
      !examType ||
      !subject
    ) {
      return res.status(400).json({
        message: "learnerIds, term, examType, and subject are required",
      });
    }

    const learners = await Learner.find({
      _id: { $in: learnerIds },
    }).select("results");

    const results = learners.map((learner) => {
      const result = learner.results.find(
        (r) =>
          r.term === term &&
          r.examType === examType &&
          (examType === "Random Exams" || examType === "Other Exams"
            ? r.examName === examName
            : true) &&
          r.subject === subject
      );
      return {
        learnerId: learner._id,
        marks: result ? result.marks : "",
        updatedBy: result ? result.updatedBy : null,
      };
    });

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error fetching class results:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.deleteResult = async (req, res) => {
  const { learnerId, term, examType, examName, subject } = req.body;

  try {
    if (!learnerId || !term || !examType || !subject) {
      return res.status(400).json({
        message: "learnerId, term, examType, and subject are required",
      });
    }

    const learner = await Learner.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    learner.results = learner.results.filter(
      (r) =>
        !(
          r.term === term &&
          r.examType === examType &&
          (examType === "Random Exams" || examType === "Other Exams"
            ? r.examName === examName
            : true) &&
          r.subject === subject
        )
    );

    await learner.save();

    res.status(200).json({
      success: true,
      message: "Result deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting result:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.deleteBatchResults = async (req, res) => {
  const { learnerIds, term, examType, examName, subject } = req.body;

  try {
    if (
      !learnerIds ||
      !Array.isArray(learnerIds) ||
      !term ||
      !examType ||
      !subject
    ) {
      return res.status(400).json({
        message: "learnerIds, term, examType, and subject are required",
      });
    }

    const updatePromises = learnerIds.map(async (learnerId) => {
      const learner = await Learner.findById(learnerId);
      if (!learner) {
        throw new Error(`Learner not found: ${learnerId}`);
      }

      learner.results = learner.results.filter(
        (r) =>
          !(
            r.term === term &&
            r.examType === examType &&
            (examType === "Random Exams" || examType === "Other Exams"
              ? r.examName === examName
              : true) &&
            r.subject === subject
          )
      );

      return learner.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Batch results deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting batch results:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Keep all other existing controller functions exactly as they were
// (getResults, getResultsForParent, getSchoolPerformance, etc.)

//get results
// Get Results by Learner ID
exports.getResults = async (req, res) => {
  const { learnerId } = req.params;

  try {
    const learner = await Learner.findById(learnerId).select("results");
    if (!learner) {
      return res.status(404).json({ message: "Learner not found." });
    }

    // Group results by term and exam type
    const groupedResults = learner.results.reduce((acc, result) => {
      const { term, examType, subject, marks } = result;

      if (!acc[term]) {
        acc[term] = {};
      }

      if (!acc[term][examType]) {
        acc[term][examType] = [];
      }

      acc[term][examType].push({ subject, marks });

      return acc;
    }, {});

    res.status(200).json({ results: groupedResults });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// //get results on parent side

exports.getResultsForParent = async (req, res) => {
  const { parentId, schoolId } = req.params;

  try {
    // Find the parent to get the learnerId
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found." });
    }

    // Validate learnerId
    if (!parent.learnerId) {
      return res
        .status(400)
        .json({ message: "No learner associated with this parent." });
    }

    // Find the learner
    const learner = await Learner.findOne({ _id: parent.learnerId, schoolId })
      .select("results fullName class stream")
      .lean();

    if (!learner) {
      return res.status(404).json({
        message: "Learner not found for this parent in the specified school.",
      });
    }

    // If no results, return early with empty results
    if (!learner.results || learner.results.length === 0) {
      return res.status(200).json({
        learnerName: learner.fullName,
        learnerId: learner._id,
        results: {},
      });
    }

    // Fetch all learners in the same class for position calculation
    const classLearners = await Learner.find({ schoolId, class: learner.class })
      .select("results stream")
      .lean();

    if (!classLearners || classLearners.length === 0) {
      return res.status(200).json({
        learnerName: learner.fullName,
        learnerId: learner._id,
        results: {},
        message:
          "No other learners found in the class for position calculation.",
      });
    }

    // Organize learner's results by term, examType, examName, and updatedAt
    const groupedResults = {};
    const examDataMap = {};

    learner.results.forEach((result) => {
      const { term, examType, examName, subject, marks, updatedAt } = result;

      // Ensure updatedAt exists
      const updatedAtDate = updatedAt ? new Date(updatedAt) : new Date();
      if (!updatedAt) {
        console.warn(
          `Missing updatedAt for result of learner ${learner._id}, subject ${subject}. Using current date.`
        );
      }

      // Create a unique exam identifier
      const examKey =
        examType === "Random Exams" || examType === "Other Exams"
          ? `${examType}:${examName || "Unnamed"}:${updatedAtDate.getTime()}`
          : `${examType}:${updatedAtDate.getTime()}`;

      if (!groupedResults[term]) {
        groupedResults[term] = {};
      }

      if (!groupedResults[term][examKey]) {
        groupedResults[term][examKey] = {
          subjects: [],
          total: 0,
          examType,
          examName: examName || null,
          updatedAt: updatedAtDate,
        };
        examDataMap[examKey] = {
          total: 0,
          subjects: {},
          updatedAt: updatedAtDate,
        };
      }

      groupedResults[term][examKey].subjects.push({ subject, marks });
      groupedResults[term][examKey].total += marks;
      examDataMap[examKey].subjects[subject] = marks;
      examDataMap[examKey].total += marks;
    });

    // Calculate positions for each exam
    Object.keys(groupedResults).forEach((term) => {
      const sortedExamKeys = Object.keys(groupedResults[term]).sort((a, b) => {
        const updatedAtA = groupedResults[term][a].updatedAt.getTime();
        const updatedAtB = groupedResults[term][b].updatedAt.getTime();
        return updatedAtB - updatedAtB; // Most recent first
      });

      sortedExamKeys.forEach((examKey, examIndex) => {
        const exam = groupedResults[term][examKey];
        const examData = examDataMap[examKey];

        // Calculate class position
        const classTotals = classLearners
          .map((l) => {
            // Find results for this specific exam
            const learnerExamResults = l.results.filter(
              (r) =>
                r.updatedAt &&
                r.updatedAt.getTime() === exam.updatedAt.getTime() &&
                r.examType === exam.examType &&
                (r.examName || null) === (exam.examName || null)
            );
            return {
              learnerId: l._id.toString(),
              total: learnerExamResults.reduce(
                (sum, r) => sum + (r.marks || 0),
                0
              ),
            };
          })
          .sort((a, b) => b.total - a.total);

        let classPosition = 1;
        let previousTotal = classTotals[0]?.total || 0;
        let samePositionCount = 0;

        classTotals.forEach((l, index) => {
          if (index > 0 && l.total < previousTotal) {
            classPosition += samePositionCount + 1;
            samePositionCount = 0;
          } else if (index > 0) {
            samePositionCount++;
          }
          if (l.learnerId === learner._id.toString()) {
            exam.classPosition = classPosition;
            examData.classPosition = classPosition;
          }
          previousTotal = l.total;
        });

        // Calculate stream position (if learner has a stream)
        if (learner.stream) {
          const streamTotals = classLearners
            .filter((l) => l.stream === learner.stream)
            .map((l) => {
              const learnerExamResults = l.results.filter(
                (r) =>
                  r.updatedAt &&
                  r.updatedAt.getTime() === exam.updatedAt.getTime() &&
                  r.examType === exam.examType &&
                  (r.examName || null) === (exam.examName || null)
              );
              return {
                learnerId: l._id.toString(),
                total: learnerExamResults.reduce(
                  (sum, r) => sum + (r.marks || 0),
                  0
                ),
              };
            })
            .sort((a, b) => b.total - a.total);

          let streamPosition = 1;
          previousTotal = streamTotals[0]?.total || 0;
          samePositionCount = 0;

          streamTotals.forEach((l, index) => {
            if (index > 0 && l.total < previousTotal) {
              streamPosition += samePositionCount + 1;
              samePositionCount = 0;
            } else if (index > 0) {
              samePositionCount++;
            }
            if (l.learnerId === learner._id.toString()) {
              exam.streamPosition = streamPosition;
              examData.streamPosition = streamPosition;
            }
            previousTotal = l.total;
          });
        } else {
          exam.streamPosition = null;
          examData.streamPosition = null;
        }

        // Get previous positions from the immediate previous exam
        if (examIndex < sortedExamKeys.length - 1) {
          const prevExamKey = sortedExamKeys[examIndex + 1];
          const prevExamData = examDataMap[prevExamKey];
          exam.previousClassPosition = prevExamData.classPosition || null;
          exam.previousStreamPosition = prevExamData.streamPosition || null;
        } else {
          exam.previousClassPosition = null;
          exam.previousStreamPosition = null;
        }

        // Attach positions to each subject
        exam.subjects = exam.subjects.map((subject) => ({
          ...subject,
          classPosition: exam.classPosition,
          streamPosition: exam.streamPosition,
          previousClassPosition: exam.previousClassPosition,
          previousStreamPosition: exam.previousStreamPosition,
        }));
      });
    });

    // Format the response to match frontend expectations
    const formattedResults = {};
    Object.keys(groupedResults).forEach((term) => {
      formattedResults[term] = {};
      Object.keys(groupedResults[term]).forEach((examKey) => {
        const exam = groupedResults[term][examKey];
        const displayExamType =
          exam.examType === "Random Exams" || exam.examType === "Other Exams"
            ? `${exam.examType}:${exam.examName || "Unnamed"}`
            : exam.examType;
        formattedResults[term][displayExamType] = exam.subjects;
      });
    });

    res.status(200).json({
      learnerName: learner.fullName,
      learnerId: learner._id,
      results: formattedResults,
    });
  } catch (error) {
    console.error("Error fetching results for parent:", {
      parentId,
      schoolId,
      error: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

// Add this to your backend controller file
exports.getClassPerformanceData = async (req, res) => {
  const { schoolId, term, examType, class: className } = req.query;

  try {
    // Find all learners in the specified class
    const learners = await Learner.find({
      schoolId,
      class: className,
    })
      .select("results fullName stream")
      .lean();

    if (!learners || learners.length === 0) {
      return res.status(404).json({
        message: "No learners found in this class",
      });
    }

    // Initialize data structures
    const performanceData = {
      classAverage: 0,
      streamAverages: {},
      subjectAverages: {},
      totalStudents: learners.length,
    };

    const subjectTotals = {};
    const subjectCounts = {};
    const streamTotals = {};
    const streamCounts = {};

    // Process each learner's results
    learners.forEach((learner) => {
      // Find the relevant exam result for this term and examType
      const examResult = learner.results.find(
        (r) => r.term === term && r.examType === examType
      );

      if (!examResult) return;

      // Calculate total marks for this learner
      const subjects = Object.entries(examResult.subjects || {});
      const total = subjects.reduce(
        (sum, [_, mark]) => sum + Number(mark) || 0,
        0
      );

      // Add to class average
      performanceData.classAverage += total;

      // Add to stream averages
      if (learner.stream) {
        if (!streamTotals[learner.stream]) {
          streamTotals[learner.stream] = 0;
          streamCounts[learner.stream] = 0;
        }
        streamTotals[learner.stream] += total;
        streamCounts[learner.stream]++;
      }

      // Add to subject averages
      subjects.forEach(([subject, mark]) => {
        if (!subjectTotals[subject]) {
          subjectTotals[subject] = 0;
          subjectCounts[subject] = 0;
        }
        subjectTotals[subject] += Number(mark) || 0;
        subjectCounts[subject]++;
      });
    });

    // Calculate final averages
    const validLearners = learners.filter((learner) =>
      learner.results.some((r) => r.term === term && r.examType === examType)
    ).length;

    performanceData.classAverage =
      validLearners > 0 ? performanceData.classAverage / validLearners : 0;

    // Calculate stream averages
    Object.keys(streamTotals).forEach((stream) => {
      performanceData.streamAverages[stream] =
        streamCounts[stream] > 0
          ? streamTotals[stream] / streamCounts[stream]
          : 0;
    });

    // Calculate subject averages
    Object.keys(subjectTotals).forEach((subject) => {
      performanceData.subjectAverages[subject] =
        subjectCounts[subject] > 0
          ? subjectTotals[subject] / subjectCounts[subject]
          : 0;
    });

    res.status(200).json(performanceData);
  } catch (error) {
    console.error("Error fetching class performance data:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// // Add this function to your backend controller


exports.getLearnerHistoricalPositions = async (req, res) => {
  const { learnerId, schoolId, currentTerm, currentExamType, currentExamName } = req.query;
  
  // console.log("Query parameters:", { learnerId, schoolId, currentTerm, currentExamType, currentExamName });

  try {
    const learner = await Learner.findOne({ _id: learnerId, schoolId }).lean();
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    // Get all results for this learner, sorted by date (newest first)
    const allResults = learner.results
      .filter(result => result.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Find the current exam (find the most recent one that matches)
    const currentExamIndex = allResults.findIndex(result => {
      const termMatch = result.term === currentTerm;
      const examTypeMatch = result.examType === currentExamType;
      const examNameMatch = (result.examName || null) === (currentExamName || null);
      
      return termMatch && examTypeMatch && examNameMatch;
    });

    if (currentExamIndex === -1) {
      return res.status(404).json({ message: "Current exam not found" });
    }

    // Get unique previous exams (up to 4) - group by exam type+name+term
    const uniqueExams = new Map();
    
    // Get exams after current one
    for (let i = currentExamIndex + 1; i < allResults.length; i++) {
      const exam = allResults[i];
      const examKey = `${exam.examType}:${exam.examName || 'N/A'}:${exam.term}`;
      
      if (!uniqueExams.has(examKey)) {
        uniqueExams.set(examKey, exam);
        if (uniqueExams.size >= 4) break; // Limit to 4 exams
      }
    }

    const previousExams = Array.from(uniqueExams.values());

    // If no previous exams found
    if (previousExams.length === 0) {
      return res.status(200).json({
        historicalPositions: [],
        message: "No previous exams found"
      });
    }

    // Get ALL learners in the class upfront (single query)
    const classLearners = await Learner.find({ 
      schoolId, 
      class: learner.class 
    }).select("results fullName").lean();

    // Pre-calculate totals for each exam
    const examDataMap = new Map();
    
    // For each previous exam, calculate all learner totals
    const historicalPositions = previousExams.map(exam => {
      const examKey = `${exam.examType}:${exam.examName || 'N/A'}:${exam.term}`;
      
      // Calculate totals for all learners for this exam
      const learnerTotals = classLearners.map(classLearner => {
        const examResults = classLearner.results.filter(result => 
          result.createdAt &&
          result.examType === exam.examType &&
          result.term === exam.term &&
          (result.examName || null) === (exam.examName || null)
        );
        
        const total = examResults.reduce((sum, r) => sum + (r.marks || 0), 0);
        
        return {
          learnerId: classLearner._id.toString(),
          learnerName: classLearner.fullName,
          total
        };
      }).filter(l => l.total > 0); // Only include learners who took this exam

      // Sort by total (descending)
      learnerTotals.sort((a, b) => b.total - a.total);

      // Calculate positions
      let currentPosition = 1;
      let previousTotal = learnerTotals[0]?.total || 0;
      let samePositionCount = 0;

      const positions = learnerTotals.map((learner, index) => {
        if (index > 0 && learner.total < previousTotal) {
          currentPosition += samePositionCount + 1;
          samePositionCount = 0;
        } else if (index > 0) {
          samePositionCount++;
        }
        
        previousTotal = learner.total;
        
        return {
          learnerId: learner.learnerId,
          position: currentPosition,
          total: learner.total
        };
      });

      // Find this specific learner's position
      const learnerPosition = positions.find(p => p.learnerId === learnerId);

      return {
        examType: exam.examType,
        examName: exam.examName || null,
        term: exam.term,
        examDate: exam.createdAt,
        position: learnerPosition?.position || null,
        total: learnerPosition?.total || 0,
        participants: learnerTotals.length
      };
    });

    res.status(200).json({
      historicalPositions: historicalPositions.reverse() // Oldest first
    });
  } catch (error) {
    console.error("Error fetching historical positions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Modified backend endpoint to handle bulk requests
exports.getBulkHistoricalPositions = async (req, res) => {
  const { learnerIds, schoolId, currentTerm, currentExamType, currentExamName } = req.body;

  try {
    const historicalPositionsByLearner = {};

    // Get all learners in the class
    const learners = await Learner.find({ 
      _id: { $in: learnerIds },
      schoolId 
    }).lean();

    if (learners.length === 0) {
      return res.status(404).json({ message: "No learners found" });
    }

    // Get the class from the first learner (assuming all are in same class)
    const classLearners = await Learner.find({ 
      schoolId, 
      class: learners[0].class 
    }).select("results fullName").lean();

    await Promise.all(
      learners.map(async (learner) => {
        try {
          // Get all results for this learner, sorted by date (newest first)
          const allResults = learner.results
            .filter(result => result.createdAt)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          // Find the current exam
          const currentExamIndex = allResults.findIndex(result => {
            const termMatch = result.term === currentTerm;
            const examTypeMatch = result.examType === currentExamType;
            const examNameMatch = (result.examName || null) === (currentExamName || null);
            
            return termMatch && examTypeMatch && examNameMatch;
          });

          if (currentExamIndex === -1) {
            historicalPositionsByLearner[learner._id] = [];
            return;
          }

          // Get unique previous exams (up to 4)
          const uniqueExams = new Map();
          
          for (let i = currentExamIndex + 1; i < allResults.length; i++) {
            const exam = allResults[i];
            const examKey = `${exam.examType}:${exam.examName || 'N/A'}:${exam.term}`;
            
            if (!uniqueExams.has(examKey)) {
              uniqueExams.set(examKey, exam);
              if (uniqueExams.size >= 4) break;
            }
          }

          const previousExams = Array.from(uniqueExams.values());

          if (previousExams.length === 0) {
            historicalPositionsByLearner[learner._id] = [];
            return;
          }

          // Calculate positions for each exam
          const positions = previousExams.map(exam => {
            const learnerTotals = classLearners.map(classLearner => {
              const examResults = classLearner.results.filter(result => 
                result.createdAt &&
                result.examType === exam.examType &&
                result.term === exam.term &&
                (result.examName || null) === (exam.examName || null)
              );
              
              const total = examResults.reduce((sum, r) => sum + (r.marks || 0), 0);
              
              return {
                learnerId: classLearner._id.toString(),
                total
              };
            }).filter(l => l.total > 0);

            // Sort by total (descending)
            learnerTotals.sort((a, b) => b.total - a.total);

            // Calculate positions
            let currentPosition = 1;
            let previousTotal = learnerTotals[0]?.total || 0;
            let samePositionCount = 0;

            const positionData = learnerTotals.map((learner, index) => {
              if (index > 0 && learner.total < previousTotal) {
                currentPosition += samePositionCount + 1;
                samePositionCount = 0;
              } else if (index > 0) {
                samePositionCount++;
              }
              
              previousTotal = learner.total;
              
              return {
                learnerId: learner.learnerId,
                position: currentPosition
              };
            });

            const learnerPosition = positionData.find(p => p.learnerId === learner._id.toString());

            return {
              examType: exam.examType,
              examName: exam.examName || null,
              term: exam.term,
              examDate: exam.createdAt,
              position: learnerPosition?.position || null,
              participants: learnerTotals.length
            };
          });

          historicalPositionsByLearner[learner._id] = positions.reverse(); // Oldest first
        } catch (error) {
          console.error(`Error processing learner ${learner._id}:`, error);
          historicalPositionsByLearner[learner._id] = [];
        }
      })
    );

    res.status(200).json({
      historicalPositions: historicalPositionsByLearner
    });
  } catch (error) {
    console.error("Error fetching bulk historical positions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// new previous positions endpoints
// New optimized endpoint for fetching previous positions
//  Updated getPreviousExamPositions function
// exports.getPreviousExamPositions = async (req, res) => {
//   const { schoolId } = req.params;
//   const { class: className, currentTerm, currentExamType, currentExamName } = req.query;
  
  
//   try {
//     console.log('Route params:', req.params);
//     console.log('Query params:', req.query);
    
//     // Convert schoolId to ObjectId
//     const schoolIdObj = new mongoose.Types.ObjectId(schoolId);
//     console.log('Converted schoolId to ObjectId:', schoolIdObj);

//     // First, get the creation date of the current exam
//     const currentExamQuery = {
//       schoolId: schoolIdObj,
//       class: className,
//       'results.term': currentTerm,
//       'results.examType': currentExamType
//     };

//     // Handle exam name conditionally
//     if (currentExamName && (currentExamType === 'Random Exams' || currentExamType === 'Other Exams')) {
//       currentExamQuery['results.examName'] = currentExamName;
//     } else {
//       currentExamQuery['$or'] = [
//         { 'results.examName': null },
//         { 'results.examName': '' },
//         { 'results.examName': { $exists: false } }
//       ];
//     }

//     console.log('Current exam query:', currentExamQuery);

//     const currentExam = await Learner.findOne(currentExamQuery, { 'results.$': 1 });

//     if (!currentExam || !currentExam.results.length) {
//       console.log("Current exam not found with query:", currentExamQuery);
//       return res.status(200).json({ 
//         previousPositions: {},
//         message: "Current exam not found" 
//       });
//     }

//     const currentExamDate = currentExam.results[0].createdAt;
//     console.log("Found current exam with date:", currentExamDate);

//     // Get the previous 4 exams before this date
//     const previousExams = await Learner.aggregate([
//       { $match: { schoolId: schoolIdObj, class: className } },
//       { $unwind: "$results" },
//       { 
//         $match: { 
//           "results.createdAt": { $lt: currentExamDate },
//           "results.term": { $exists: true },
//           "results.examType": { $exists: true }
//         } 
//       },
//       {
//         $group: {
//           _id: {
//             term: "$results.term",
//             examType: "$results.examType",
//             examName: "$results.examName"
//           },
//           createdAt: { $max: "$results.createdAt" },
//           examCount: { $sum: 1 }
//         }
//       },
//       { $sort: { createdAt: -1 } },
//       { $limit: 4 },
//       {
//         $project: {
//           term: "$_id.term",
//           examType: "$_id.examType",
//           examName: "$_id.examName",
//           createdAt: 1,
//           _id: 0
//         }
//       }
//     ]);

//     console.log('Found previous exams:', previousExams.length);

//     if (previousExams.length === 0) {
//       return res.status(200).json({ previousPositions: {} });
//     }

//     // For each previous exam, calculate positions for all learners
//     const positionPromises = previousExams.map(async (exam) => {
//       const learnersWithTotals = await Learner.aggregate([
//         { $match: { schoolId: schoolIdObj, class: className } },
//         { $unwind: "$results" },
//         {
//           $match: {
//             "results.term": exam.term,
//             "results.examType": exam.examType,
//             "results.examName": exam.examName || null
//           }
//         },
//         {
//           $group: {
//             _id: "$_id",
//             fullName: { $first: "$fullName" },
//             total: { $sum: "$results.marks" },
//             stream: { $first: "$stream" }
//           }
//         },
//         { $match: { total: { $gt: 0 } } },
//         { $sort: { total: -1 } },
//         {
//           $group: {
//             _id: null,
//             learners: { $push: "$$ROOT" },
//             count: { $sum: 1 }
//           }
//         },
//         {
//           $unwind: {
//             path: "$learners",
//             includeArrayIndex: "position"
//           }
//         },
//         {
//           $project: {
//             learnerId: "$learners._id",
//             position: { $add: ["$position", 1] },
//             total: "$learners.total",
//             fullName: "$learners.fullName",
//             stream: "$learners.stream"
//           }
//         }
//       ]);

//       return {
//         examKey: `${exam.term}-${exam.examType}-${exam.examName || ''}`,
//         examInfo: exam,
//         positions: learnersWithTotals.reduce((acc, curr) => {
//           acc[curr.learnerId.toString()] = curr.position;
//           return acc;
//         }, {})
//       };
//     });

//     const examPositions = await Promise.all(positionPromises);

//     // Transform into the format we need: { learnerId: { examKey1: position, examKey2: position } }
//     const previousPositions = {};
//     examPositions.forEach(examData => {
//       Object.entries(examData.positions).forEach(([learnerId, position]) => {
//         if (!previousPositions[learnerId]) {
//           previousPositions[learnerId] = {};
//         }
//         previousPositions[learnerId][examData.examKey] = position;
//       });
//     });

//     console.log('Returning previous positions for', Object.keys(previousPositions).length, 'learners');
//     res.status(200).json({ previousPositions });
//   } catch (error) {
//     console.error("Error fetching previous exam positions:", error);
//     res.status(500).json({ 
//       message: "Internal server error",
//       error: error.message 
//     });
//   }
// };
exports.getPreviousExamPositions = async (req, res) => {
  const { schoolId } = req.params;
  const { class: className, currentTerm, currentExamType, currentExamName } = req.query;
  
  try {
    console.log('Route params:', req.params);
    console.log('Query params:', req.query);
    
    // Convert schoolId to ObjectId
    const schoolIdObj = new mongoose.Types.ObjectId(schoolId);
    console.log('Converted schoolId to ObjectId:', schoolIdObj);

    // First, get the creation date of the current exam
    const currentExamQuery = {
      schoolId: schoolIdObj,
      class: className,
      'results.term': currentTerm,
      'results.examType': currentExamType
    };

    // Handle exam name conditionally
    if (currentExamName && (currentExamType === 'Random Exams' || currentExamType === 'Other Exams')) {
      currentExamQuery['results.examName'] = currentExamName;
    } else {
      currentExamQuery['$or'] = [
        { 'results.examName': null },
        { 'results.examName': '' },
        { 'results.examName': { $exists: false } }
      ];
    }

    console.log('Current exam query:', currentExamQuery);

    const currentExam = await Learner.findOne(currentExamQuery, { 'results.$': 1 });

    if (!currentExam || !currentExam.results.length) {
      console.log("Current exam not found with query:", currentExamQuery);
      return res.status(200).json({ 
        previousPositions: {},
        streamPreviousPositions: {},
        message: "Current exam not found" 
      });
    }

    const currentExamDate = currentExam.results[0].createdAt;
    console.log("Found current exam with date:", currentExamDate);

    // Get the previous 4 exams before this date
    const previousExams = await Learner.aggregate([
      { $match: { schoolId: schoolIdObj, class: className } },
      { $unwind: "$results" },
      { 
        $match: { 
          "results.createdAt": { $lt: currentExamDate },
          "results.term": { $exists: true },
          "results.examType": { $exists: true }
        } 
      },
      {
        $group: {
          _id: {
            term: "$results.term",
            examType: "$results.examType",
            examName: "$results.examName"
          },
          createdAt: { $max: "$results.createdAt" },
          examCount: { $sum: 1 }
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 4 },
      {
        $project: {
          term: "$_id.term",
          examType: "$_id.examType",
          examName: "$_id.examName",
          createdAt: 1,
          _id: 0
        }
      }
    ]);

    console.log('Found previous exams:', previousExams.length);

    if (previousExams.length === 0) {
      return res.status(200).json({ 
        previousPositions: {},
        streamPreviousPositions: {}
      });
    }

    // For each previous exam, calculate positions for all learners (general positions)
    const positionPromises = previousExams.map(async (exam) => {
      const learnersWithTotals = await Learner.aggregate([
        { $match: { schoolId: schoolIdObj, class: className } },
        { $unwind: "$results" },
        {
          $match: {
            "results.term": exam.term,
            "results.examType": exam.examType,
            "results.examName": exam.examName || null
          }
        },
        {
          $group: {
            _id: "$_id",
            fullName: { $first: "$fullName" },
            total: { $sum: "$results.marks" },
            stream: { $first: "$stream" }
          }
        },
        { $match: { total: { $gt: 0 } } },
        { $sort: { total: -1 } },
        {
          $group: {
            _id: null,
            learners: { $push: "$$ROOT" },
            count: { $sum: 1 }
          }
        },
        {
          $unwind: {
            path: "$learners",
            includeArrayIndex: "position"
          }
        },
        {
          $project: {
            learnerId: "$learners._id",
            position: { $add: ["$position", 1] },
            total: "$learners.total",
            fullName: "$learners.fullName",
            stream: "$learners.stream"
          }
        }
      ]);

      return {
        examKey: `${exam.term}-${exam.examType}-${exam.examName || ''}`,
        examInfo: exam,
        positions: learnersWithTotals.reduce((acc, curr) => {
          acc[curr.learnerId.toString()] = curr.position;
          return acc;
        }, {})
      };
    });

    // For each previous exam, calculate stream-level positions
    const streamPositionPromises = previousExams.map(async (exam) => {
      const streamPositions = {};
      
      // For each stream, calculate positions
      const streams = await Learner.distinct("stream", { 
        schoolId: schoolIdObj, 
        class: className 
      });
      
      for (const stream of streams) {
        const learnersWithTotals = await Learner.aggregate([
          { 
            $match: { 
              schoolId: schoolIdObj, 
              class: className,
              stream: stream 
            } 
          },
          { $unwind: "$results" },
          {
            $match: {
              "results.term": exam.term,
              "results.examType": exam.examType,
              "results.examName": exam.examName || null
            }
          },
          {
            $group: {
              _id: "$_id",
              fullName: { $first: "$fullName" },
              total: { $sum: "$results.marks" },
              stream: { $first: "$stream" }
            }
          },
          { $match: { total: { $gt: 0 } } },
          { $sort: { total: -1 } },
          {
            $group: {
              _id: null,
              learners: { $push: "$$ROOT" },
              count: { $sum: 1 }
            }
          },
          {
            $unwind: {
              path: "$learners",
              includeArrayIndex: "position"
            }
          },
          {
            $project: {
              learnerId: "$learners._id",
              position: { $add: ["$position", 1] },
              total: "$learners.total",
              fullName: "$learners.fullName",
              stream: "$learners.stream"
            }
          }
        ]);
        
        if (!streamPositions[stream]) {
          streamPositions[stream] = {};
        }
        
        learnersWithTotals.forEach(learner => {
          streamPositions[stream][learner.learnerId.toString()] = learner.position;
        });
      }
      
      return {
        examKey: `${exam.term}-${exam.examType}-${exam.examName || ''}`,
        streamPositions: streamPositions
      };
    });

    const [examPositions, streamExamPositions] = await Promise.all([
      Promise.all(positionPromises),
      Promise.all(streamPositionPromises)
    ]);

    // Transform into the format we need: { learnerId: { examKey1: position, examKey2: position } }
    const previousPositions = {};
    examPositions.forEach(examData => {
      Object.entries(examData.positions).forEach(([learnerId, position]) => {
        if (!previousPositions[learnerId]) {
          previousPositions[learnerId] = {};
        }
        previousPositions[learnerId][examData.examKey] = position;
      });
    });

    // Transform stream positions into the format we need
    const streamPreviousPositions = {};
    streamExamPositions.forEach(examData => {
      Object.entries(examData.streamPositions).forEach(([stream, positions]) => {
        Object.entries(positions).forEach(([learnerId, position]) => {
          // Create a key that includes both stream and exam info
          const key = `${examData.examKey}`;
          if (!streamPreviousPositions[learnerId]) {
            streamPreviousPositions[learnerId] = {};
          }
          // Store both the position and the stream it belongs to
          streamPreviousPositions[learnerId][key] = {
            position: position,
            stream: stream
          };
        });
      });
    });

    console.log('Returning previous positions for', Object.keys(previousPositions).length, 'learners');
    console.log('Returning stream previous positions for', Object.keys(streamPreviousPositions).length, 'learners');
    
    res.status(200).json({ 
      previousPositions,
      streamPreviousPositions 
    });
  } catch (error) {
    console.error("Error fetching previous exam positions:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

//};
// Combined and optimized createMessage
exports.createMessage = async (req, res) => {
  const { senderId, receiverId, text, images } = req.body;

  console.log("Request Body:", req.body); // Debug logging

  // Validate IDs - FIXED SYNTAX ERROR HERE
  if (!mongoose.Types.ObjectId.isValid(senderId)) {
    return res.status(400).json({ message: "Invalid senderId." });
  }
  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    return res.status(400).json({ message: "Invalid receiverId." });
  }

  try {
    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
      await conversation.save();
    }

    // Create message
    const message = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      text,
      images,
    });
    await message.save();

    // Update conversation
    conversation.lastMessage = text;
    conversation.lastMessageAt = Date.now();
    await conversation.save();

    // Socket.io emission
    const io = req.app.get("io");
    io.to(conversation._id).emit("newMessage", message);

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//get messages
exports.getMessages = async (req, res) => {
  const { senderId, receiverId } = req.query;

  console.log("Fetching messages for:", { senderId, receiverId });

  try {
    // Find conversation or return empty array if none exists
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    const messages = conversation
      ? await Message.find({ conversationId: conversation._id }).sort({
          createdAt: 1,
        })
      : [];

    console.log("Messages fetched:", messages.length);
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//get conversations
exports.getConversations = async (req, res) => {
  const { userId } = req.query;

  try {
    const conversations = await Conversation.find({
      participants: userId,
    }).populate("participants", "name profileImage");

    res.status(200).json({
      success: true,
      conversations: conversations || [], // Ensure empty array if none
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Upload video by the teacher

exports.uploadVideo = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the request body
    console.log("Uploaded File:", req.file); // Log the uploaded file

    const {
      title,
      description,
      class: className,
      subject,
      schoolId,
      teacherId,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded." });
    }

    // Create a new video document
    const video = new Video({
      title,
      description,
      class: className,
      subject,
      videoUrl: req.file.path, // Cloudinary URL
      uploadedBy: teacherId, // Use teacherId from the request body
      schoolId, // Associate video with the school
    });

    await video.save();

    res.status(201).json({ message: "Video uploaded successfully!", video });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//get videos on learner side
exports.getVideosByClass = async (req, res) => {
  const { class: className } = req.query;

  try {
    console.log("Fetching videos for class:", className); // Log the class name
    const videos = await Video.find({ class: className }).populate(
      "uploadedBy",
      "fullName"
    );
    console.log("Fetched videos:", videos); // Log the fetched videos
    res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//publish news
// Publish News
exports.publishNews = async (req, res) => {
  const { title, details, publisher, schoolId } = req.body;

  try {
    const newNews = new News({
      title,
      details,
      publisher,
      schoolId,
    });

    await newNews.save();
    res
      .status(201)
      .json({ message: "News published successfully.", news: newNews });
  } catch (error) {
    console.error("Error publishing news:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Fetch News for a School
exports.getNews = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const news = await News.find({ schoolId }).sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update News
exports.updateNews = async (req, res) => {
  const { newsId } = req.params;
  const { title, details, publisher, schoolId } = req.body;

  try {
    const news = await News.findOne({ _id: newsId, schoolId });
    if (!news) {
      return res.status(404).json({
        message:
          "News not found or you do not have permission to edit this news.",
      });
    }

    news.title = title || news.title;
    news.details = details || news.details;
    news.publisher = publisher || news.publisher;

    await news.save();
    res.status(200).json({ message: "News updated successfully.", news });
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Delete News
exports.deleteNews = async (req, res) => {
  const { newsId } = req.params;
  const { schoolId } = req.body;

  try {
    const news = await News.findOneAndDelete({ _id: newsId, schoolId });
    if (!news) {
      return res.status(404).json({
        message:
          "News not found or you do not have permission to delete this news.",
      });
    }

    res.status(200).json({ message: "News deleted successfully." });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
// Submit Transfer Request (Parent Side)
// controllers/transferRequestController.js

// Submit Transfer Request (Parent Side)
exports.submitTransferRequest = async (req, res) => {
  const {
    parentId,
    schoolId,
    childName,
    admissionNumber,
    subject,
    description,
  } = req.body;

  try {
    if (description.length < 200) {
      return res
        .status(400)
        .json({ message: "Description must be at least 200 words." });
    }

    const newRequest = new ParentRequestTransfer({
      parentId,
      schoolId,
      childName,
      admissionNumber,
      subject,
      description,
    });

    await newRequest.save();
    res.status(201).json({
      message: "Transfer request submitted successfully.",
      requestId: newRequest._id,
    });
  } catch (error) {
    console.error("Error submitting transfer request:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Fetch Transfer Requests (Parent Side)
exports.getParentTransferRequests = async (req, res) => {
  const { parentId } = req.params;

  try {
    const requests = await ParentRequestTransfer.find({ parentId }).sort({
      createdAt: -1,
    });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching transfer requests:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getSchoolTransferRequests = async (req, res) => {
  const { schoolId } = req.params;
  console.log("Fetching transfer requests for schoolId:", schoolId);

  try {
    // Validate schoolId format
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ message: "Invalid School ID format" });
    }

    const requests = await ParentRequestTransfer.find({ schoolId });
    console.log("Found requests:", requests);

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching transfer requests:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Update Transfer Request Status (School Side)
exports.updateTransferRequestStatus = async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  try {
    const request = await ParentRequestTransfer.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Transfer request not found." });
    }

    request.status = status;
    request.updatedAt = Date.now();
    await request.save();

    res
      .status(200)
      .json({ message: "Transfer request status updated successfully." });
  } catch (error) {
    console.error("Error updating transfer request status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get performance data for all learners in school
exports.getSchoolPerformance = async (req, res) => {
  const { schoolId } = req.params;

  try {
    // Fetch all learners with their results
    const learners = await Learner.find({ schoolId })
      .select("fullName class results")
      .lean();

    res.status(200).json(learners);
  } catch (error) {
    console.error("Error fetching performance data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get performance data for specific criteria
// Get performance data for specific criteria
// Get performance data for specific criteria - FIXED VERSION
exports.getFilteredSchoolPerformance = async (req, res) => {
  const { schoolId } = req.params;
  const { class: className, term, examType, examName } = req.query;

  try {
    console.log('Filtered performance request:', { schoolId, className, term, examType, examName });

    // Build the query - FIXED: Use proper ObjectId conversion
    const query = { 
      schoolId: new mongoose.Types.ObjectId(schoolId),
      class: className,
      'results.term': term,
      'results.examType': examType
    };

    // Only add examName filter for Random/Other exams
    if (examName && (examType === 'Random Exams' || examType === 'Other Exams')) {
      query['results.examName'] = examName;
    } else {
      // For regular exams, look for null/empty examName or no examName field
      query['$or'] = [
        { 'results.examName': null },
        { 'results.examName': '' },
        { 'results.examName': { $exists: false } }
      ];
    }

    console.log('Database query:', JSON.stringify(query, null, 2));

    // Fetch learners with matching results
    const learners = await Learner.find(query).select('fullName class results');

    console.log('Filtered learners count:', learners.length);
    if (learners.length > 0) {
      console.log('Sample learner data:', learners[0]);
    } else {
      console.log('No learners found with the specified criteria');
      
      // Let's debug what data actually exists
      const debugQuery = { 
        schoolId: new mongoose.Types.ObjectId(schoolId),
        class: className
      };
      const allClassLearners = await Learner.find(debugQuery).select('fullName results');
      console.log(`Total learners in class ${className}:`, allClassLearners.length);
      
      if (allClassLearners.length > 0) {
        console.log('Sample learner with results:', {
          name: allClassLearners[0].fullName,
          resultsCount: allClassLearners[0].results.length,
          results: allClassLearners[0].results
        });
      }
    }
    
    res.status(200).json(learners);
  } catch (error) {
    console.error("Error fetching filtered performance data:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Get available classes with performance data
exports.getPerformanceClasses = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const classes = await Learner.distinct('class', { 
      schoolId, 
      results: { $exists: true, $ne: [] } 
    });
    res.status(200).json(classes.sort());
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get available terms for a class
exports.getPerformanceTerms = async (req, res) => {
  const { schoolId } = req.params;
  const { class: className } = req.query;

  try {
    const terms = await Learner.distinct('results.term', { 
      schoolId, 
      class: className,
      'results.term': { $exists: true }
    });
    res.status(200).json(terms.sort());
  } catch (error) {
    console.error("Error fetching terms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get available exam types for a class and term
exports.getPerformanceExamTypes = async (req, res) => {
  const { schoolId } = req.params;
  const { class: className, term } = req.query;

  try {
    const examTypes = await Learner.distinct('results.examType', { 
      schoolId, 
      class: className,
      'results.term': term,
      'results.examType': { $exists: true }
    });
    res.status(200).json(examTypes.sort());
  } catch (error) {
    console.error("Error fetching exam types:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get available exam names for a class, term, and exam type
exports.getPerformanceExamNames = async (req, res) => {
  const { schoolId } = req.params;
  const { class: className, term, examType } = req.query;

  try {
    const examNames = await Learner.distinct('results.examName', { 
      schoolId, 
      class: className,
      'results.term': term,
      'results.examType': examType,
      'results.examName': { $exists: true, $ne: null }
    });
    res.status(200).json(examNames.sort());
  } catch (error) {
    console.error("Error fetching exam names:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Modified Backend: schoolController.js (excerpt with relevant functions)
// Note: Add this to your existing schoolController.js file. I've assumed mongoose is already imported and Learner model is defined.
// Make sure to import mongoose at the top if not already: const mongoose = require('mongoose');

// // Get summary performance data for school (modified existing function)
// exports.getSchoolPerformance = async (req, res) => {
//   const { schoolId } = req.params;

//   try {
//     const summary = await Learner.aggregate([
//       { $match: { schoolId: new mongoose.Types.ObjectId(schoolId) } },
//       { $unwind: "$results" },
//       {
//         $group: {
//           _id: {
//             class: "$class",
//             term: "$results.term",
//             examType: "$results.examType",
//             examName: "$results.examName"
//           },
//           learners: { $addToSet: "$_id" },
//           subjects: { $addToSet: "$results.subject" }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           class: "$_id.class",
//           term: "$_id.term",
//           examType: "$_id.examType",
//           examName: "$_id.examName",
//           learnerCount: { $size: "$learners" },
//           subjects: 1
//         }
//       }
//     ]);

//     const organizedData = {};
//     summary.forEach(item => {
//       const { class: grade, term, examType, examName, learnerCount, subjects } = item;
//       const examKey = (examType === 'Random Exams' || examType === 'Other Exams')
//         ? `${examType}: ${examName || 'Unnamed'}`
//         : examType;

//       if (!organizedData[grade]) organizedData[grade] = {};
//       if (!organizedData[grade][term]) organizedData[grade][term] = {};
//       organizedData[grade][term][examKey] = {
//         learnerCount,
//         subjects: Array.from(subjects),
//         baseExamType: examType,
//         examName: examName || null
//       };
//     });

//     res.status(200).json(organizedData);
//   } catch (error) {
//     console.error("Error fetching performance summary:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // New function: Get detailed exam performance
// exports.getExamDetails = async (req, res) => {
//   const { schoolId } = req.params;
//   const { grade, term, examType, examName } = req.query;

//   try {
//     const matchResult = {
//       "results.term": term,
//       "results.examType": examType
//     };
//     if (examName && examName !== 'null') {
//       matchResult["results.examName"] = examName;
//     } else {
//       matchResult["results.examName"] = { $exists: false }; // or null, depending on your data
//     }

//     const details = await Learner.aggregate([
//       { $match: { schoolId: new mongoose.Types.ObjectId(schoolId), class: grade } },
//       { $unwind: "$results" },
//       { $match: matchResult },
//       {
//         $group: {
//           _id: { learnerId: "$_id", subject: "$results.subject" },
//           fullName: { $first: "$fullName" },
//           marks: { $first: "$results.marks" }
//         }
//       },
//       {
//         $group: {
//           _id: "$_id.learnerId",
//           learnerName: { $first: "$fullName" },
//           marksArray: { $push: { subject: "$_id.subject", marks: "$marks" } }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           learnerId: "$_id",
//           learnerName: 1,
//           marks: {
//             $arrayToObject: {
//               $map: {
//                 input: "$marksArray",
//                 as: "m",
//                 in: { k: "$$m.subject", v: "$$m.marks" }
//               }
//             }
//           }
//         }
//       }
//     ]);

//     const subjects = new Set();
//     details.forEach(learner => {
//       Object.keys(learner.marks).forEach(subject => subjects.add(subject));
//     });

//     const examData = {
//       learners: details,
//       subjects: Array.from(subjects),
//       baseExamType: examType,
//       examName: examName || null
//     };

//     res.status(200).json(examData);
//   } catch (error) {
//     console.error("Error fetching exam details:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


exports.deleteStudent = async (req, res) => {
  const { studentId, birthCertificateNumber } = req.body;

  try {
    // Trim and normalize input
    const cleanedInput = birthCertificateNumber.toString().trim();

    // Find student and compare birth certificate numbers
    const student = await Learner.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Compare cleaned values
    const storedBirthCert = student.birthCertificateNumber.toString().trim();

    if (storedBirthCert !== cleanedInput) {
      console.log(
        `Mismatch: Stored "${storedBirthCert}" vs Input "${cleanedInput}"`
      );
      return res.status(400).json({
        success: false,
        message: "Birth certificate number does not match",
      });
    }

    // Create deleted student record with schoolId
    const deletedStudent = new DeletedStudent({
      fullName: student.fullName,
      admissionNumber: student.admissionNumber,
      parentName: student.parentName,
      parentEmail: student.parentEmail,
      parentContact: student.parentContact,
      birthCertificateNumber: storedBirthCert,
      schoolId: student.schoolId, // Add schoolId from the original student
      deletedAt: new Date(),
    });

    await deletedStudent.save();

    if (student.parentId) {
      await Parent.findByIdAndDelete(student.parentId);
    }

    await Learner.findByIdAndDelete(studentId);

    res.status(200).json({
      success: true,
      message: "Student and associated parent deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// exports.getDeletedStudents = async (req, res) => {
//   try {
//     const deletedStudents = await DeletedStudent.find();
//     res.status(200).json({
//       success: true,
//       deletedStudents,
//     });
//   } catch (error) {
//     console.error("Error fetching deleted students:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
exports.getDeletedStudents = async (req, res) => {
  try {
    // Get schoolId from query parameters instead of req.user
    const { schoolId } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required as a query parameter",
      });
    }

    const deletedStudents = await DeletedStudent.find({ schoolId });
    res.status(200).json({
      success: true,
      deletedStudents,
    });
  } catch (error) {
    console.error("Error fetching deleted students:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Add these to your existing schoolController.js

// Update or Create Fee Structure
exports.updateFeeStructure = async (req, res) => {
  const { schoolId, year, className, term, amount } = req.body;

  try {
    // Validate input
    if (!schoolId || !year || !className || !term || amount === undefined) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (isNaN(amount)) {
      // Added missing closing parenthesis
      return res.status(400).json({ message: "Amount must be a number." });
    }

    // Check if fee structure already exists for this combination
    const existingFee = await FeeStructure.findOne({
      schoolId,
      year,
      className,
      term,
    });

    if (existingFee) {
      // Update existing fee structure
      existingFee.amount = amount;
      await existingFee.save();
      return res.status(200).json({
        message: "Fee structure updated successfully.",
        feeStructure: existingFee,
      });
    } else {
      // Create new fee structure
      const newFeeStructure = new FeeStructure({
        schoolId,
        year,
        className,
        term,
        amount,
      });

      await newFeeStructure.save();
      return res.status(201).json({
        message: "Fee structure created successfully.",
        feeStructure: newFeeStructure,
      });
    }
  } catch (error) {
    console.error("Error updating fee structure:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
// Get Fee Structures for School
exports.getFeeStructures = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const feeStructures = await FeeStructure.find({ schoolId }).sort({
      year: 1,
      term: 1,
      className: 1,
    });
    res.status(200).json(feeStructures);
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Add these new methods to your controller

// Delete Fee Structure
exports.deleteFeeStructure = async (req, res) => {
  const { feeStructureId } = req.params;

  try {
    const deletedFee = await FeeStructure.findByIdAndDelete(feeStructureId);
    if (!deletedFee) {
      return res.status(404).json({ message: "Fee structure not found." });
    }
    res.status(200).json({ message: "Fee structure deleted successfully." });
  } catch (error) {
    console.error("Error deleting fee structure:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get Fee Structures with Filtering
exports.getFilteredFeeStructures = async (req, res) => {
  const { schoolId } = req.params;
  const { year, className, term, sortBy, sortOrder } = req.query;

  try {
    let query = { schoolId };

    // Add filters if provided
    if (year) query.year = year;
    if (className) query.className = className;
    if (term) query.term = term;

    let sortOptions = {};
    // Set sorting options
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    } else {
      // Default sorting
      sortOptions = { year: 1, className: 1, term: 1 };
    }

    const feeStructures = await FeeStructure.find(query).sort(sortOptions);
    res.status(200).json(feeStructures);
  } catch (error) {
    console.error("Error fetching fee structures:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Add this new controller method:
exports.updateFeeStructureById = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    if (!id || amount === undefined) {
      return res.status(400).json({ message: "ID and amount are required." });
    }

    if (isNaN(amount)) {
      return res.status(400).json({ message: "Amount must be a number." });
    }

    const updatedFee = await FeeStructure.findByIdAndUpdate(
      id,
      { amount },
      { new: true }
    );

    if (!updatedFee) {
      return res.status(404).json({ message: "Fee structure not found." });
    }

    return res.status(200).json({
      message: "Fee structure updated successfully.",
      feeStructure: updatedFee,
    });
  } catch (error) {
    console.error("Error updating fee structure:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update Student Fee Payment
exports.updateStudentFee = async (req, res) => {
  const { learnerId, year, term, amountPaid } = req.body;

  try {
    // Validate input
    if (!learnerId || !year || !term || amountPaid === undefined) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (isNaN(amountPaid)) {
      return res.status(400).json({ message: "Amount must be a number." });
    }

    // Find the learner to get their class
    const learner = await Learner.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ message: "Learner not found." });
    }

    // Find the fee structure for this class/year/term
    const feeStructure = await FeeStructure.findOne({
      schoolId: learner.schoolId,
      year,
      className: learner.class,
      term,
    });

    if (!feeStructure) {
      return res
        .status(404)
        .json({ message: "Fee structure not found for this learner." });
    }

    // Find or create student fee record
    let studentFee = await StudentFee.findOne({
      learnerId,
      year,
      term,
    });

    if (!studentFee) {
      // Create new record if doesn't exist
      studentFee = new StudentFee({
        schoolId: learner.schoolId,
        learnerId,
        year,
        term,
        className: learner.class,
        totalAmount: feeStructure.amount,
        amountPaid: amountPaid,
      });
    } else {
      // Update existing record
      studentFee.amountPaid += parseFloat(amountPaid);
    }

    // Calculate balance (can be negative if overpaid)
    studentFee.balance = studentFee.totalAmount - studentFee.amountPaid;

    await studentFee.save();

    res.status(200).json({
      message: "Student fee updated successfully.",
      studentFee,
    });
  } catch (error) {
    console.error("Error updating student fee:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getStudentFeesForParent = async (req, res) => {
  const { parentId, schoolId } = req.params;

  try {
    // Validate IDs before processing
    if (
      !parentId ||
      parentId === "undefined" ||
      !schoolId ||
      schoolId === "undefined"
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid Parent ID and School ID are required",
        received: { parentId, schoolId },
      });
    }

    // Convert to ObjectId if they're valid
    const query = {
      parentId: mongoose.Types.ObjectId.isValid(parentId)
        ? new mongoose.Types.ObjectId(parentId)
        : parentId,
      schoolId: mongoose.Types.ObjectId.isValid(schoolId)
        ? new mongoose.Types.ObjectId(schoolId)
        : schoolId,
    };

    const learner = await Learner.findOne(query);

    if (!learner) {
      return res.status(404).json({
        success: false,
        message: "Learner not found",
        queryUsed: query,
      });
    }

    const studentFees = await StudentFee.find({
      learnerId: learner._id,
    }).sort({ year: 1, term: 1 });

    return res.status(200).json({
      success: true,
      learnerName: learner.fullName,
      className: learner.class,
      fees: studentFees,
    });
  } catch (error) {
    console.error("Fee controller error:", {
      params: req.params,
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//publish special events
// Then update the publishSpecialEvent function
exports.publishSpecialEvent = async (req, res) => {
  const { name, date, venue, schoolId, teacherId, attendingStudents } =
    req.body;

  try {
    // Validate input
    if (
      !name ||
      !date ||
      !venue ||
      !schoolId ||
      !teacherId ||
      !attendingStudents
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Get parent IDs for attending students
    const studentsWithParents = await Promise.all(
      attendingStudents.map(async (admissionNumber) => {
        const student = await Learner.findOne({ admissionNumber, schoolId });
        if (!student) {
          throw new Error(
            `Student with admission number ${admissionNumber} not found`
          );
        }
        return {
          admissionNumber,
          parentId: student.parentId,
        };
      })
    );

    // Create special event using the correct model
    const specialEvent = new SpecialEvent({
      name,
      date: new Date(date),
      venue,
      schoolId,
      teacherId,
      attendingStudents: studentsWithParents,
    });

    await specialEvent.save();

    // Send notifications to parents
    const parentIds = studentsWithParents.map((s) => s.parentId);
    const parents = await Parent.find({ _id: { $in: parentIds } });

    parents.forEach((parent) => {
      const message = {
        to: parent.deviceToken,
        sound: "default",
        title: "New Special Event",
        body: `Dear parent, your student will be attending ${name} on ${new Date(
          date
        ).toLocaleDateString()}`,
        data: { eventId: specialEvent._id },
      };
      // sendPushNotification(message);
    });

    res.status(201).json({
      success: true,
      message: "Special event published successfully",
      specialEvent,
    });
  } catch (error) {
    console.error("Error publishing special event:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update getSpecialEventsForParent to use SpecialEvent model
exports.getSpecialEventsForParent = async (req, res) => {
  const { parentId } = req.params;

  try {
    const events = await SpecialEvent.find({
      "attendingStudents.parentId": parentId,
    }).sort({ date: -1 });

    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error("Error fetching special events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Report indiscipline case
exports.reportIndisciplineCase = async (req, res) => {
  const { learnerId, description, schoolId } = req.body;

  try {
    // Validate input
    if (!learnerId || !description || !schoolId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find learner to get parentId
    const learner = await Learner.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    if (!learner.parentId) {
      return res
        .status(400)
        .json({ message: "Learner has no parent associated" });
    }

    // Create new case
    const newCase = new IndisciplineCase({
      learnerId,
      parentId: learner.parentId,
      schoolId,
      reportedBy: "administration",
      description,
    });

    await newCase.save();

    res.status(201).json({
      success: true,
      message: "Indiscipline case reported successfully",
      case: newCase,
    });
  } catch (error) {
    console.error("Error reporting indiscipline case:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get cases for a learner (school side)
exports.getIndisciplineCasesForLearner = async (req, res) => {
  const { learnerId } = req.params;

  try {
    const cases = await IndisciplineCase.find({ learnerId })
      .populate("reportedBy", "fullName")
      .sort({ date: -1 });

    res.status(200).json({ success: true, cases });
  } catch (error) {
    console.error("Error fetching indiscipline cases:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get cases for a parent (parent side)
exports.getIndisciplineCasesForParent = async (req, res) => {
  const { parentId } = req.params;

  try {
    const cases = await IndisciplineCase.find({ parentId })
      .populate("reportedBy", "fullName")
      .populate("learnerId", "fullName")
      .sort({ date: -1 });

    res.status(200).json({ success: true, cases });
  } catch (error) {
    console.error("Error fetching indiscipline cases:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// new for careers

// Update home interests (parent side)
exports.updateHomeInterests = async (req, res) => {
  const { learnerId, parentId, interests } = req.body;

  try {
    const learner = await Learner.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    learner.interests.home = interests.map((interest) => ({
      ...interest,
      updatedAt: new Date(),
      updatedBy: parentId,
    }));

    await learner.save();
    await updateCareerInsights(learnerId);

    res.status(200).json({ message: "Home interests updated successfully" });
  } catch (error) {
    console.error("Error updating home interests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update school interests (teacher side)
exports.updateSchoolInterests = async (req, res) => {
  const { learnerId, teacherId, interests } = req.body;

  try {
    if (!learnerId || !teacherId || !interests) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          learnerId: !learnerId ? "Missing" : "Provided",
          teacherId: !teacherId ? "Missing" : "Provided",
          interests: !interests ? "Missing" : "Provided",
        },
      });
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        message: "Invalid teacher ID",
        receivedValue: teacherId,
      });
    }

    const learner = await Learner.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    if (!Array.isArray(interests)) {
      return res.status(400).json({
        message: "Interests must be an array",
        receivedType: typeof interests,
      });
    }

    learner.interests.school = interests.map((interest) => ({
      ...interest,
      updatedAt: new Date(),
      updatedBy: teacherId,
    }));

    await learner.save();
    await updateCareerInsights(learnerId);

    res.status(200).json({
      message: "School interests updated successfully",
      updatedInterests: learner.interests.school,
    });
  } catch (error) {
    console.error("Error updating school interests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Submit survey response (student side)
exports.submitSurveyResponse = async (req, res) => {
  const { learnerId, question, answer } = req.body;

  try {
    const learner = await Learner.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    learner.surveys.push({ question, answer, date: new Date() });
    await learner.save();
    await updateCareerInsights(learnerId);

    res.status(200).json({ message: "Survey response submitted successfully" });
  } catch (error) {
    console.error("Error submitting survey response:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Record game performance
exports.recordGamePerformance = async (req, res) => {
  const { learnerId, gameName, score, level, timeSpent } = req.body;

  try {
    const learner = await Learner.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    let gameRecord = learner.gamePerformance.find(
      (g) => g.gameName === gameName
    );
    if (!gameRecord) {
      gameRecord = { gameName, scores: [], overallPerformance: 0 };
      learner.gamePerformance.push(gameRecord);
    }

    gameRecord.scores.push({
      date: new Date(),
      score,
      level,
      timeSpent,
    });

    const recentScores = gameRecord.scores.slice(-5).map((s) => s.score);
    gameRecord.overallPerformance =
      recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    await learner.save();
    await updateCareerInsights(learnerId);

    res.status(200).json({ message: "Game performance recorded successfully" });
  } catch (error) {
    console.error("Error recording game performance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get career insights
exports.getCareerInsights = async (req, res) => {
  const { learnerId } = req.params;

  try {
    const learner = await Learner.findById(learnerId).select(
      "careerInsights fullName admissionNumber"
    );

    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    res.status(200).json({
      studentName: learner.fullName,
      admissionNumber: learner.admissionNumber,
      insights: learner.careerInsights || [],
    });
  } catch (error) {
    console.error("Error getting career insights:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Force update of career insights
exports.updateCareerInsightsManual = async (req, res) => {
  const { learnerId } = req.body;

  try {
    await updateCareerInsights(learnerId);
    const learner = await Learner.findById(learnerId).select("careerInsights");

    res.status(200).json({
      success: true,
      insights: learner.careerInsights || [],
    });
  } catch (error) {
    console.error("Error updating insights:", error);
    res.status(500).json({ message: "Failed to update insights" });
  }
};

// Debug learner data
exports.debugLearnerData = async (req, res) => {
  const { learnerId } = req.params;

  try {
    const learner = await Learner.findById(learnerId).select(
      "interests gamePerformance results"
    );

    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    res.status(200).json({
      interests: learner.interests,
      gamePerformance: learner.gamePerformance,
      results: learner.results,
      hasData: {
        interests:
          learner.interests.home.length > 0 ||
          learner.interests.school.length > 0,
        gamePerformance: learner.gamePerformance.length > 0,
        results: learner.results.length > 0,
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get learner by parent ID
exports.getLearnerByParent = async (req, res) => {
  const { parentId } = req.params;

  try {
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const learner = await Learner.findById(parent.learnerId);
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    res.status(200).json(learner);
  } catch (error) {
    console.error("Error fetching learner by parent:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get learner interests
exports.getLearnerInterests = async (req, res) => {
  const { learnerId } = req.params;

  try {
    const learner = await Learner.findById(learnerId).select("interests");
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    res.status(200).json({
      interests: learner.interests || { home: [], school: [] },
    });
  } catch (error) {
    console.error("Error fetching learner interests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Enhanced Helper function to update career insights with improved academic performance analysis
async function updateCareerInsights(learnerId) {
  try {
    const learner = await Learner.findById(learnerId).select(
      "interests surveys gamePerformance results fullName admissionNumber"
    );

    if (!learner) return;

    const insights = {
      generatedAt: new Date(),
      potentialCareers: [],
      strengths: [],
      areasForImprovement: [],
      dataSourcesUsed: [],
      confidenceScore: 0,
      studentName: learner.fullName,
      admissionNumber: learner.admissionNumber,
    };

    const usedSources = [];

    // ENHANCED ACADEMIC RESULTS ANALYSIS
    if (learner.results && learner.results.length > 0) {
      usedSources.push("academic results");
      const subjectPerformance = {};
      let totalExams = 0;

      // Aggregate results across all exams and terms with better parsing
      learner.results.forEach((result) => {
        let marksArray = [];

        // Handle different result data structures
        if (Array.isArray(result.marks)) {
          marksArray = result.marks;
        } else if (result.marks && typeof result.marks === "object") {
          // Handle nested structure like { term1: { exam1: [...], exam2: [...] } }
          Object.values(result.marks).forEach((termData) => {
            if (Array.isArray(termData)) {
              marksArray.push(...termData);
            } else if (typeof termData === "object") {
              Object.values(termData).forEach((examData) => {
                if (Array.isArray(examData)) {
                  marksArray.push(...examData);
                }
              });
            }
          });
        }

        marksArray.forEach(({ subject, marks }) => {
          if (!subject || isNaN(marks)) return;
          if (!subjectPerformance[subject]) {
            subjectPerformance[subject] = {
              total: 0,
              count: 0,
              scores: [],
              highestScore: 0,
              lowestScore: 100,
              trend: "stable",
            };
          }

          const numericMarks = Number(marks);
          subjectPerformance[subject].total += numericMarks;
          subjectPerformance[subject].count++;
          subjectPerformance[subject].scores.push(numericMarks);
          subjectPerformance[subject].highestScore = Math.max(
            subjectPerformance[subject].highestScore,
            numericMarks
          );
          subjectPerformance[subject].lowestScore = Math.min(
            subjectPerformance[subject].lowestScore,
            numericMarks
          );
          totalExams++;
        });
      });

      // Calculate comprehensive subject analysis
      const subjectAnalysis = Object.entries(subjectPerformance).map(
        ([subject, data]) => {
          const average = data.total / data.count;
          const consistency =
            data.scores.length > 1
              ? 100 - ((data.highestScore - data.lowestScore) / average) * 100
              : 100;

          // Determine trend if we have multiple scores
          let trend = "stable";
          if (data.scores.length >= 3) {
            const recent = data.scores.slice(-3);
            const earlier = data.scores.slice(0, -3);
            if (recent.length > 0 && earlier.length > 0) {
              const recentAvg =
                recent.reduce((a, b) => a + b, 0) / recent.length;
              const earlierAvg =
                earlier.reduce((a, b) => a + b, 0) / earlier.length;
              if (recentAvg > earlierAvg + 5) trend = "improving";
              else if (recentAvg < earlierAvg - 5) trend = "declining";
            }
          }

          return {
            subject,
            average,
            consistency: Math.max(0, consistency),
            trend,
            totalScores: data.count,
            performanceLevel:
              average >= 85
                ? "excellent"
                : average >= 75
                ? "good"
                : average >= 65
                ? "average"
                : "needs_improvement",
          };
        }
      );

      // Sort by average performance
      subjectAnalysis.sort((a, b) => b.average - a.average);

      // Identify strengths and improvements with more detail
      const excellentSubjects = subjectAnalysis.filter(
        (s) => s.performanceLevel === "excellent"
      );
      const goodSubjects = subjectAnalysis.filter(
        (s) => s.performanceLevel === "good"
      );
      const improvingSubjects = subjectAnalysis.filter(
        (s) => s.trend === "improving"
      );
      const strugglingSubjects = subjectAnalysis.filter(
        (s) => s.performanceLevel === "needs_improvement"
      );

      // Add detailed strengths
      excellentSubjects.forEach(({ subject, average, consistency }) => {
        insights.strengths.push(
          `Excellent in ${subject} (${average.toFixed(
            1
          )}% avg, ${consistency.toFixed(0)}% consistent)`
        );
      });

      goodSubjects.slice(0, 2).forEach(({ subject, average, trend }) => {
        const trendText =
          trend === "improving"
            ? ", showing improvement"
            : trend === "declining"
            ? ", needs attention"
            : "";
        insights.strengths.push(
          `Strong in ${subject} (${average.toFixed(1)}% avg${trendText})`
        );
      });

      improvingSubjects.slice(0, 2).forEach(({ subject, average }) => {
        insights.strengths.push(
          `Improving performance in ${subject} (current avg: ${average.toFixed(
            1
          )}%)`
        );
      });

      // Add improvement areas
      strugglingSubjects.forEach(({ subject, average, trend }) => {
        const urgency =
          average < 50 ? "urgent attention needed" : "room for improvement";
        insights.areasForImprovement.push(
          `${subject} requires ${urgency} (${average.toFixed(1)}% avg)`
        );
      });

      const decliningSubjects = subjectAnalysis.filter(
        (s) => s.trend === "declining"
      );
      decliningSubjects.slice(0, 2).forEach(({ subject, average }) => {
        insights.areasForImprovement.push(
          `${subject} showing declining trend (${average.toFixed(1)}% avg)`
        );
      });

      // ENHANCED CAREER MAPPING with more comprehensive subject-career relationships
      const enhancedSubjectCareerMap = {
        Mathematics: [
          {
            career: "Data Scientist",
            minScore: 80,
            weight: 0.9,
            reasons: [
              "Advanced mathematical analysis",
              "Statistical modeling expertise",
            ],
          },
          {
            career: "Actuarial Scientist",
            minScore: 85,
            weight: 0.95,
            reasons: ["Risk assessment calculations", "Statistical analysis"],
          },
          {
            career: "Financial Analyst",
            minScore: 75,
            weight: 0.8,
            reasons: ["Financial modeling", "Quantitative analysis"],
          },
          {
            career: "Software Engineer",
            minScore: 70,
            weight: 0.75,
            reasons: ["Algorithmic thinking", "Logical problem solving"],
          },
          {
            career: "Engineering (All Fields)",
            minScore: 75,
            weight: 0.85,
            reasons: ["Mathematical problem solving", "Technical calculations"],
          },
          {
            career: "Economist",
            minScore: 80,
            weight: 0.8,
            reasons: ["Economic modeling", "Statistical analysis"],
          },
          {
            career: "Cryptographer",
            minScore: 85,
            weight: 0.9,
            reasons: ["Complex mathematical algorithms", "Security analysis"],
          },
        ],
        Science: [
          {
            career: "Medical Doctor",
            minScore: 85,
            weight: 0.95,
            reasons: [
              "Scientific knowledge application",
              "Analytical diagnosis",
            ],
          },
          {
            career: "Biomedical Engineer",
            minScore: 80,
            weight: 0.85,
            reasons: ["Medical device design", "Scientific innovation"],
          },
          {
            career: "Research Scientist",
            minScore: 75,
            weight: 0.8,
            reasons: ["Scientific inquiry", "Experimental design"],
          },
          {
            career: "Pharmacist",
            minScore: 80,
            weight: 0.85,
            reasons: ["Drug science knowledge", "Chemical understanding"],
          },
          {
            career: "Environmental Scientist",
            minScore: 70,
            weight: 0.75,
            reasons: ["Environmental analysis", "Scientific research"],
          },
          {
            career: "Forensic Scientist",
            minScore: 75,
            weight: 0.8,
            reasons: ["Scientific investigation", "Evidence analysis"],
          },
          {
            career: "Biotechnologist",
            minScore: 75,
            weight: 0.8,
            reasons: ["Biological systems", "Technology application"],
          },
        ],
        Physics: [
          {
            career: "Physicist",
            minScore: 85,
            weight: 0.95,
            reasons: ["Advanced physics concepts", "Research capabilities"],
          },
          {
            career: "Aerospace Engineer",
            minScore: 80,
            weight: 0.9,
            reasons: ["Flight mechanics", "Space technology"],
          },
          {
            career: "Nuclear Engineer",
            minScore: 85,
            weight: 0.9,
            reasons: ["Nuclear physics", "Radiation safety"],
          },
          {
            career: "Electrical Engineer",
            minScore: 75,
            weight: 0.8,
            reasons: ["Electrical systems", "Circuit design"],
          },
          {
            career: "Meteorologist",
            minScore: 70,
            weight: 0.75,
            reasons: ["Atmospheric physics", "Weather analysis"],
          },
        ],
        Chemistry: [
          {
            career: "Chemical Engineer",
            minScore: 80,
            weight: 0.9,
            reasons: ["Chemical processes", "Industrial chemistry"],
          },
          {
            career: "Pharmaceutical Scientist",
            minScore: 85,
            weight: 0.9,
            reasons: ["Drug development", "Chemical analysis"],
          },
          {
            career: "Materials Scientist",
            minScore: 75,
            weight: 0.8,
            reasons: ["Material properties", "Chemical composition"],
          },
          {
            career: "Forensic Chemist",
            minScore: 75,
            weight: 0.8,
            reasons: ["Chemical evidence analysis", "Laboratory skills"],
          },
          {
            career: "Quality Control Analyst",
            minScore: 70,
            weight: 0.75,
            reasons: ["Chemical testing", "Quality assurance"],
          },
        ],
        Biology: [
          {
            career: "Biologist",
            minScore: 75,
            weight: 0.8,
            reasons: ["Life sciences expertise", "Research skills"],
          },
          {
            career: "Veterinarian",
            minScore: 80,
            weight: 0.85,
            reasons: ["Animal biology", "Medical application"],
          },
          {
            career: "Genetic Counselor",
            minScore: 80,
            weight: 0.85,
            reasons: ["Genetics knowledge", "Patient counseling"],
          },
          {
            career: "Marine Biologist",
            minScore: 75,
            weight: 0.8,
            reasons: ["Marine ecosystems", "Biological research"],
          },
          {
            career: "Microbiologist",
            minScore: 75,
            weight: 0.8,
            reasons: ["Microbial systems", "Laboratory research"],
          },
        ],
        English: [
          {
            career: "Journalist",
            minScore: 75,
            weight: 0.8,
            reasons: ["Written communication", "Story development"],
          },
          {
            career: "Content Writer",
            minScore: 70,
            weight: 0.75,
            reasons: ["Creative writing", "Communication skills"],
          },
          {
            career: "Editor",
            minScore: 75,
            weight: 0.8,
            reasons: ["Language precision", "Content improvement"],
          },
          {
            career: "Public Relations Specialist",
            minScore: 70,
            weight: 0.75,
            reasons: ["Communication strategy", "Media relations"],
          },
          {
            career: "Teacher (Language Arts)",
            minScore: 75,
            weight: 0.8,
            reasons: ["Language instruction", "Educational communication"],
          },
          {
            career: "Legal Assistant",
            minScore: 75,
            weight: 0.75,
            reasons: ["Legal writing", "Document analysis"],
          },
        ],
        Literature: [
          {
            career: "Author/Writer",
            minScore: 75,
            weight: 0.85,
            reasons: ["Creative storytelling", "Literary analysis"],
          },
          {
            career: "Literary Critic",
            minScore: 80,
            weight: 0.8,
            reasons: ["Literary analysis", "Critical thinking"],
          },
          {
            career: "Librarian",
            minScore: 70,
            weight: 0.75,
            reasons: ["Literature knowledge", "Information management"],
          },
          {
            career: "Publishing Professional",
            minScore: 75,
            weight: 0.8,
            reasons: ["Content evaluation", "Literary expertise"],
          },
        ],
        History: [
          {
            career: "Historian",
            minScore: 80,
            weight: 0.85,
            reasons: ["Historical research", "Analytical thinking"],
          },
          {
            career: "Museum Curator",
            minScore: 75,
            weight: 0.8,
            reasons: ["Historical preservation", "Cultural knowledge"],
          },
          {
            career: "Archaeologist",
            minScore: 75,
            weight: 0.8,
            reasons: ["Historical investigation", "Research skills"],
          },
          {
            career: "Social Studies Teacher",
            minScore: 70,
            weight: 0.75,
            reasons: ["Historical knowledge", "Educational skills"],
          },
          {
            career: "Policy Analyst",
            minScore: 75,
            weight: 0.75,
            reasons: ["Historical context", "Analytical research"],
          },
        ],
        Geography: [
          {
            career: "Geographer",
            minScore: 75,
            weight: 0.8,
            reasons: ["Spatial analysis", "Geographic information systems"],
          },
          {
            career: "Urban Planner",
            minScore: 75,
            weight: 0.8,
            reasons: ["Spatial planning", "Geographic analysis"],
          },
          {
            career: "Cartographer",
            minScore: 70,
            weight: 0.75,
            reasons: ["Map creation", "Geographic visualization"],
          },
          {
            career: "Environmental Consultant",
            minScore: 70,
            weight: 0.75,
            reasons: ["Geographic environmental analysis", "Spatial planning"],
          },
        ],
        Art: [
          {
            career: "Graphic Designer",
            minScore: 70,
            weight: 0.8,
            reasons: ["Visual creativity", "Design principles"],
          },
          {
            career: "Art Director",
            minScore: 75,
            weight: 0.85,
            reasons: ["Creative leadership", "Visual strategy"],
          },
          {
            career: "Illustrator",
            minScore: 70,
            weight: 0.8,
            reasons: ["Visual storytelling", "Artistic technique"],
          },
          {
            career: "Interior Designer",
            minScore: 70,
            weight: 0.75,
            reasons: ["Spatial design", "Aesthetic planning"],
          },
          {
            career: "Animation Artist",
            minScore: 75,
            weight: 0.8,
            reasons: ["Digital artistry", "Motion graphics"],
          },
          {
            career: "Art Therapist",
            minScore: 70,
            weight: 0.75,
            reasons: ["Therapeutic art application", "Creative healing"],
          },
        ],
        Music: [
          {
            career: "Music Teacher",
            minScore: 70,
            weight: 0.8,
            reasons: ["Musical instruction", "Performance skills"],
          },
          {
            career: "Sound Engineer",
            minScore: 75,
            weight: 0.8,
            reasons: ["Audio technology", "Sound production"],
          },
          {
            career: "Music Therapist",
            minScore: 70,
            weight: 0.75,
            reasons: ["Therapeutic music application", "Patient care"],
          },
          {
            career: "Composer",
            minScore: 80,
            weight: 0.85,
            reasons: ["Musical composition", "Creative expression"],
          },
          {
            career: "Audio Producer",
            minScore: 75,
            weight: 0.8,
            reasons: ["Music production", "Audio engineering"],
          },
        ],
        "Physical Education": [
          {
            career: "Physical Therapist",
            minScore: 75,
            weight: 0.8,
            reasons: ["Body mechanics", "Rehabilitation knowledge"],
          },
          {
            career: "Athletic Trainer",
            minScore: 70,
            weight: 0.75,
            reasons: ["Sports medicine", "Injury prevention"],
          },
          {
            career: "Fitness Instructor",
            minScore: 65,
            weight: 0.7,
            reasons: ["Exercise science", "Physical conditioning"],
          },
          {
            career: "Sports Coach",
            minScore: 70,
            weight: 0.75,
            reasons: ["Athletic development", "Team leadership"],
          },
          {
            career: "Recreation Director",
            minScore: 65,
            weight: 0.7,
            reasons: ["Activity planning", "Program management"],
          },
        ],
        "Computer Science": [
          {
            career: "Software Developer",
            minScore: 75,
            weight: 0.9,
            reasons: ["Programming expertise", "Software architecture"],
          },
          {
            career: "Cybersecurity Specialist",
            minScore: 80,
            weight: 0.85,
            reasons: ["Security systems", "Threat analysis"],
          },
          {
            career: "Data Analyst",
            minScore: 75,
            weight: 0.8,
            reasons: ["Data processing", "Statistical analysis"],
          },
          {
            career: "IT Project Manager",
            minScore: 70,
            weight: 0.75,
            reasons: ["Technology leadership", "Project coordination"],
          },
          {
            career: "Systems Administrator",
            minScore: 70,
            weight: 0.75,
            reasons: ["System management", "Technical troubleshooting"],
          },
        ],
      };

      // Generate career recommendations with enhanced scoring
      const academicCareers = [];

      subjectAnalysis.forEach(
        ({ subject, average, consistency, trend, performanceLevel }) => {
          // Check multiple subject variations (e.g., "Math", "Mathematics", "Maths")
          const subjectVariations = [subject];
          if (subject.toLowerCase().includes("math"))
            subjectVariations.push("Mathematics");
          if (subject.toLowerCase().includes("science"))
            subjectVariations.push("Science");
          if (
            subject.toLowerCase().includes("english") ||
            subject.toLowerCase().includes("language")
          ) {
            subjectVariations.push("English", "Literature");
          }
          if (
            subject.toLowerCase().includes("history") ||
            subject.toLowerCase().includes("social")
          ) {
            subjectVariations.push("History");
          }
          if (subject.toLowerCase().includes("geo"))
            subjectVariations.push("Geography");
          if (subject.toLowerCase().includes("art"))
            subjectVariations.push("Art");
          if (subject.toLowerCase().includes("music"))
            subjectVariations.push("Music");
          if (
            subject.toLowerCase().includes("physical") ||
            subject.toLowerCase().includes("pe")
          ) {
            subjectVariations.push("Physical Education");
          }
          if (
            subject.toLowerCase().includes("computer") ||
            subject.toLowerCase().includes("ict")
          ) {
            subjectVariations.push("Computer Science");
          }
          if (subject.toLowerCase().includes("physics"))
            subjectVariations.push("Physics");
          if (
            subject.toLowerCase().includes("chemistry") ||
            subject.toLowerCase().includes("chem")
          ) {
            subjectVariations.push("Chemistry");
          }
          if (
            subject.toLowerCase().includes("biology") ||
            subject.toLowerCase().includes("bio")
          ) {
            subjectVariations.push("Biology");
          }

          subjectVariations.forEach((subjectVar) => {
            if (enhancedSubjectCareerMap[subjectVar]) {
              enhancedSubjectCareerMap[subjectVar].forEach(
                ({ career, minScore, weight, reasons }) => {
                  if (average >= minScore - 10) {
                    // Allow slightly lower scores
                    // Calculate enhanced confidence score
                    let confidenceScore = average * weight;

                    // Bonus for consistency
                    if (consistency > 80) confidenceScore += 5;

                    // Bonus for improvement trend
                    if (trend === "improving") confidenceScore += 8;

                    // Bonus for excellent performance
                    if (performanceLevel === "excellent") confidenceScore += 10;
                    else if (performanceLevel === "good") confidenceScore += 5;

                    // Penalty for declining trend
                    if (trend === "declining") confidenceScore -= 5;

                    confidenceScore = Math.min(
                      95,
                      Math.max(40, confidenceScore)
                    );

                    academicCareers.push({
                      career,
                      confidenceScore: Math.round(confidenceScore),
                      reasons: reasons.map(
                        (r) => `${r} (${subject}: ${average.toFixed(1)}%)`
                      ),
                      source: "academic performance",
                      subjectBasis: subject,
                      performanceLevel,
                      trend,
                    });
                  }
                }
              );
            }
          });
        }
      );

      // Remove duplicates and sort by confidence
      const careerMap = {};
      academicCareers.forEach((career) => {
        if (!careerMap[career.career]) {
          careerMap[career.career] = career;
        } else if (
          career.confidenceScore > careerMap[career.career].confidenceScore
        ) {
          careerMap[career.career] = {
            ...career,
            reasons: [
              ...new Set([
                ...careerMap[career.career].reasons,
                ...career.reasons,
              ]),
            ],
          };
        }
      });

      insights.potentialCareers.push(
        ...Object.values(careerMap)
          .sort((a, b) => b.confidenceScore - a.confidenceScore)
          .slice(0, 8)
      ); // Top 8 academic-based careers
    }

    // Analyze Interests (keeping existing logic but enhancing it)
    if (
      learner.interests &&
      (learner.interests.home.length > 0 || learner.interests.school.length > 0)
    ) {
      usedSources.push("interests");
      const allInterests = [
        ...learner.interests.home,
        ...learner.interests.school,
      ];

      const interestCategories = allInterests.reduce((acc, interest) => {
        acc[interest.category] = (acc[interest.category] || 0) + 1;
        return acc;
      }, {});

      const topInterests = Object.entries(interestCategories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const enhancedInterestCareerMap = {
        Sports: [
          {
            career: "Professional Athlete",
            reasons: ["Athletic performance", "Competitive excellence"],
          },
          {
            career: "Sports Coach",
            reasons: ["Athletic knowledge", "Leadership skills"],
          },
          {
            career: "Sports Medicine Doctor",
            reasons: ["Medical expertise", "Sports specialization"],
          },
          {
            career: "Physical Therapist",
            reasons: ["Rehabilitation knowledge", "Athletic recovery"],
          },
          {
            career: "Sports Analyst",
            reasons: ["Game analysis", "Statistical expertise"],
          },
          {
            career: "Athletic Director",
            reasons: ["Sports administration", "Program management"],
          },
        ],
        Arts: [
          {
            career: "Professional Artist",
            reasons: ["Creative talent", "Artistic expression"],
          },
          {
            career: "Art Director",
            reasons: ["Creative leadership", "Visual strategy"],
          },
          {
            career: "Graphic Designer",
            reasons: ["Digital creativity", "Design skills"],
          },
          {
            career: "Art Curator",
            reasons: ["Art expertise", "Cultural knowledge"],
          },
          {
            career: "Creative Director",
            reasons: ["Creative vision", "Team leadership"],
          },
          {
            career: "Art Therapist",
            reasons: ["Therapeutic application", "Artistic healing"],
          },
        ],
        Technology: [
          {
            career: "Software Developer",
            reasons: ["Programming interest", "Technical problem-solving"],
          },
          {
            career: "IT Consultant",
            reasons: ["Technology expertise", "Solution design"],
          },
          {
            career: "Cybersecurity Expert",
            reasons: ["Security focus", "Digital protection"],
          },
          {
            career: "Data Scientist",
            reasons: ["Data analysis interest", "Technical research"],
          },
          {
            career: "UX/UI Designer",
            reasons: ["User experience focus", "Design technology"],
          },
          {
            career: "AI/ML Engineer",
            reasons: [
              "Artificial intelligence interest",
              "Advanced technology",
            ],
          },
        ],
        Science: [
          {
            career: "Research Scientist",
            reasons: ["Scientific inquiry", "Research passion"],
          },
          {
            career: "Laboratory Technician",
            reasons: ["Practical science skills", "Technical precision"],
          },
          {
            career: "Science Teacher",
            reasons: ["Science communication", "Educational passion"],
          },
          {
            career: "Environmental Scientist",
            reasons: ["Environmental concern", "Scientific analysis"],
          },
          {
            career: "Biotechnologist",
            reasons: ["Biological innovation", "Technology application"],
          },
          {
            career: "Science Writer",
            reasons: ["Science communication", "Technical writing"],
          },
        ],
        Music: [
          {
            career: "Professional Musician",
            reasons: ["Musical talent", "Performance skills"],
          },
          {
            career: "Music Producer",
            reasons: ["Audio production", "Creative direction"],
          },
          {
            career: "Music Teacher",
            reasons: ["Musical education", "Instructional skills"],
          },
          {
            career: "Sound Engineer",
            reasons: ["Audio technology", "Technical expertise"],
          },
          {
            career: "Music Therapist",
            reasons: ["Therapeutic music", "Healing arts"],
          },
        ],
        Reading: [
          {
            career: "Author/Writer",
            reasons: ["Literary passion", "Creative writing"],
          },
          {
            career: "Editor",
            reasons: ["Language expertise", "Content improvement"],
          },
          {
            career: "Librarian",
            reasons: ["Information management", "Literary knowledge"],
          },
          {
            career: "Literary Agent",
            reasons: ["Industry knowledge", "Author representation"],
          },
          {
            career: "Book Publisher",
            reasons: ["Publishing expertise", "Content curation"],
          },
        ],
      };

      topInterests.forEach(([category, count]) => {
        if (enhancedInterestCareerMap[category]) {
          enhancedInterestCareerMap[category].forEach(({ career, reasons }) => {
            const confidenceScore = Math.min(75, 45 + count * 8);
            insights.potentialCareers.push({
              career,
              confidenceScore,
              reasons: reasons.map((r) => `${r} (strong ${category} interest)`),
              source: "personal interests",
            });
          });
        }
      });
    }

    // Keep existing game performance and survey analysis...
    // [Previous game performance and survey code remains the same]

    // Calculate overall confidence score based on data richness
    let baseConfidence = 20;
    if (usedSources.includes("academic results")) baseConfidence += 40;
    if (usedSources.includes("interests")) baseConfidence += 25;
    if (usedSources.includes("game performance")) baseConfidence += 10;
    if (usedSources.includes("surveys")) baseConfidence += 5;

    insights.confidenceScore = Math.min(100, baseConfidence);

    // Final career deduplication and ranking
    const finalCareerMap = {};
    insights.potentialCareers.forEach((career) => {
      if (!finalCareerMap[career.career]) {
        finalCareerMap[career.career] = {
          career: career.career,
          confidenceScore: career.confidenceScore,
          reasons: career.reasons,
          source: career.source,
        };
      } else {
        // Combine careers with same name, taking higher confidence
        const existing = finalCareerMap[career.career];
        finalCareerMap[career.career] = {
          career: career.career,
          confidenceScore: Math.max(
            existing.confidenceScore,
            career.confidenceScore
          ),
          reasons: [...new Set([...existing.reasons, ...career.reasons])],
          source:
            existing.source === career.source
              ? career.source
              : `${existing.source}, ${career.source}`,
        };
      }
    });

    insights.potentialCareers = Object.values(finalCareerMap)
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 10); // Top 10 career recommendations

    insights.dataSourcesUsed = usedSources;

    // Save insights
    learner.careerInsights = [
      insights,
      ...(learner.careerInsights || []).slice(0, 4),
    ];
    await learner.save();

    console.log(`Updated career insights for ${learner.fullName}:`, {
      totalCareers: insights.potentialCareers.length,
      confidenceScore: insights.confidenceScore,
      dataSources: insights.dataSourcesUsed,
    });
  } catch (error) {
    console.error("Error updating career insights:", error);
  }
}

//upload notes
// Upload Notes (Teacher)
//const Note = require('../models/Note');
//const { cloudinary, storage } = require('../config/cloudinary');
//const mongoose = require('mongoose');

exports.uploadNotes = async (req, res) => {
  try {
    // Enhanced logging for debugging
    console.log("========== NEW NOTES UPLOAD REQUEST ==========");
    console.log("Request Headers:", req.headers);
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", {
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
      path: req.file?.path,
    });

    // Validate file exists
    if (!req.file) {
      console.log("ERROR: No file uploaded");
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
        required: "PDF, DOC, or image file",
      });
    }

    // Validate required fields
    const requiredFields = [
      "title",
      "class",
      "subject",
      "schoolId",
      "teacherId",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      console.log("ERROR: Missing required fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        received: req.body,
      });
    }

    const {
      title,
      description,
      class: className,
      subject,
      schoolId,
      teacherId,
    } = req.body;

    // Validate ObjectId formats
    if (
      !mongoose.Types.ObjectId.isValid(schoolId) ||
      !mongoose.Types.ObjectId.isValid(teacherId)
    ) {
      console.log("ERROR: Invalid ID format", { schoolId, teacherId });
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
        schoolIdValid: mongoose.Types.ObjectId.isValid(schoolId),
        teacherIdValid: mongoose.Types.ObjectId.isValid(teacherId),
      });
    }

    // Validate file type
    const fileType = req.file.mimetype.split("/")[1];
    const allowedTypes = ["pdf", "doc", "docx", "jpeg", "jpg", "png"];

    if (!allowedTypes.includes(fileType)) {
      console.log("ERROR: Invalid file type:", fileType);
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only PDF, DOC, and images are allowed.",
        allowedTypes,
        receivedType: fileType,
      });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      console.log("ERROR: File too large:", req.file.size);
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB.",
        maxSize: "10MB",
        fileSize: req.file.size,
      });
    }

    // Create new note document
    const note = new Note({
      title,
      description: description || "",
      class: className,
      subject,
      fileUrl: req.file.path,
      fileType,
      uploadedBy: teacherId,
      schoolId,
    });

    // Save to database
    await note.save();

    console.log("SUCCESS: Note saved:", {
      id: note._id,
      title: note.title,
      class: note.class,
      fileUrl: note.fileUrl,
    });

    // Successful response
    res.status(201).json({
      success: true,
      message: "Notes uploaded successfully!",
      note: {
        id: note._id,
        title: note.title,
        class: note.class,
        subject: note.subject,
        fileUrl: note.fileUrl,
        uploadedAt: note.uploadedAt,
      },
    });
  } catch (error) {
    console.error("ERROR DETAILS:", {
      message: error.message,
      stack: error.stack,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });

    // Handle specific errors
    let statusCode = 500;
    let errorMessage = "Internal server error.";

    if (error.name === "ValidationError") {
      statusCode = 400;
      errorMessage = Object.values(error.errors)
        .map((val) => val.message)
        .join(", ");
    } else if (error.code === "LIMIT_FILE_SIZE") {
      statusCode = 400;
      errorMessage = "File too large. Maximum size is 10MB.";
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error:
        process.env.NODE_ENV === "development"
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
    });
  }
};

// Get Notes by Class (Students)
exports.getNotesByClass = async (req, res) => {
  const { class: className } = req.query;

  try {
    const notes = await Note.find({ class: className })
      .populate("uploadedBy", "fullName")
      .sort({ uploadedAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//assignment

//publish assignment by the teacher

exports.createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      class: className,
      subject,
      questions,
      schoolId,
      teacherId,
    } = req.body;

    // Validate required fields
    if (!title || !className || !subject || !schoolId || !teacherId) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["title", "class", "subject", "schoolId", "teacherId"],
      });
    }

    // Validate questions array
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        error: "Assignment must have at least one question",
      });
    }

    // Validate each question
    const validatedQuestions = questions.map((q, i) => {
      if (!q.questionText || !q.questionType) {
        throw new Error(
          `Question ${
            i + 1
          } is missing required fields (questionText or questionType)`
        );
      }

      if (
        q.questionType === "multiple_choice" &&
        (!q.options || !Array.isArray(q.options))
      ) {
        throw new Error(
          `Question ${i + 1} (multiple choice) is missing options array`
        );
      }

      return q;
    });

    const assignment = new Assignment({
      title,
      description,
      class: className,
      subject,
      questions: validatedQuestions,
      createdBy: teacherId,
      schoolId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(400).json({
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Get Assignments by Class (Learner Side) fully working
exports.getAssignmentsByClass = async (req, res) => {
  const { className } = req.params; // Changed from 'class' to 'className'
  const { schoolId } = req.query;

  try {
    // Validate input
    if (!className || !schoolId) {
      console.log("Validation failed - Missing parameters:", {
        className,
        schoolId,
      });
      return res.status(400).json({
        message: "Class and schoolId are required",
        received: { className, schoolId },
      });
    }

    // Find assignments for the specified class and school
    const assignments = await Assignment.find({
      class: decodeURIComponent(className), // Decode the class name
      schoolId,
    })
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    console.log("Found assignments:", assignments.length);
    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// assignment details fully working
exports.getAssignmentDetails = async (req, res) => {
  try {
    console.log("Fetching assignment with ID:", req.params.assignmentId);
    const assignment = await Assignment.findById(
      req.params.assignmentId
    ).populate("createdBy", "fullName");

    if (!assignment) {
      console.log("Assignment not found");
      return res.status(404).json({ error: "Assignment not found" });
    }

    console.log("Found assignment:", {
      _id: assignment._id,
      title: assignment.title,
      questionCount: assignment.questions
        ? assignment.questions.length
        : "undefined",
    });

    res.json(assignment);
  } catch (error) {
    console.error("Error in getAssignmentDetails:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      createdBy: req.params.teacherId,
      schoolId: req.user.schoolId,
    }).populate("responses.learnerId", "fullName");

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//submit answers
exports.submitAssignment = async (req, res) => {
  try {
    const { answers, schoolId, learnerId } = req.body; // Get learnerId from request body

    // Validate required fields
    if (!answers || !schoolId || !learnerId) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["answers", "schoolId", "learnerId"],
      });
    }

    const assignment = await Assignment.findOne({
      _id: req.params.assignmentId,
      schoolId,
    });

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const response = {
      learnerId, // Use the learnerId from request
      answers: answers.map((answer) => ({
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect: checkAnswerCorrectness(assignment, answer),
      })),
    };

    assignment.responses.push(response);
    await assignment.save();
    res.status(201).json(response);
  } catch (error) {
    console.error("Error submitting assignment:", error);
    res.status(400).json({
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Make checkAnswerCorrectness a standalone function
function checkAnswerCorrectness(assignment, answer) {
  const question = assignment.questions.id(answer.questionId);
  if (!question || question.questionType !== "multiple_choice") return null;
  return question.correctAnswer === answer.answer;
}

//check submission

exports.checkSubmissionStatus = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.assignmentId,
      schoolId: req.query.schoolId,
      "responses.learnerId": req.query.learnerId,
    });

    res.json({ submitted: !!assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//get teacher's assignments
exports.getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      createdBy: req.params.teacherId,
      schoolId: req.query.schoolId,
    })
      .populate("responses.learnerId", "fullName")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
//get responses on teacher's side
exports.getAssignmentResponses = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId)
      .populate({
        path: "responses.learnerId",
        select: "fullName admissionNumber", // Include admissionNumber
        model: "Learner",
      })
      .populate("questions", "questionText questionType options correctAnswer"); // Include questions for reference

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Format the response to include both assignment details and responses
    const responseData = {
      assignment: {
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject,
        dueDate: assignment.dueDate,
        questions: assignment.questions,
      },
      responses: assignment.responses.map((response) => ({
        _id: response._id,
        learner: {
          fullName: response.learnerId.fullName,
          admissionNumber: response.learnerId.admissionNumber,
        },
        answers: response.answers.map((answer) => {
          const question = assignment.questions.id(answer.questionId);
          return {
            questionText: question?.questionText || "Question not found",
            questionType: question?.questionType,
            answer: answer.answer,
            isCorrect: answer.isCorrect,
            correctAnswer:
              question?.questionType === "multiple_choice"
                ? question.correctAnswer
                : null,
          };
        }),
        submittedAt: response.submittedAt,
      })),
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// schoolController.js

// Track video view
exports.recordVideoView = async (req, res) => {
  try {
    const { videoId, learnerId, schoolId } = req.body;

    // Validate input
    if (!videoId || !learnerId || !schoolId) {
      return res.status(400).json({
        message: "videoId, learnerId, and schoolId are required",
      });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Record the view
    const view = new VideoView({
      videoId,
      learnerId,
      schoolId,
    });

    await view.save();

    res.status(201).json({ message: "View recorded successfully" });
  } catch (error) {
    console.error("Error recording video view:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get teacher's videos with view stats
exports.getTeacherVideos = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { schoolId } = req.query;

    const videos = await Video.find({
      uploadedBy: teacherId,
      schoolId,
    }).sort({ uploadedAt: -1 });

    // Get view stats for each video
    const videosWithStats = await Promise.all(
      videos.map(async (video) => {
        const views = await VideoView.find({ videoId: video._id });
        const uniqueViewers = [
          ...new Set(views.map((v) => v.learnerId.toString())),
        ];

        return {
          ...video.toObject(),
          viewCount: views.length,
          uniqueViewers: uniqueViewers.length,
        };
      })
    );

    res.json(videosWithStats);
  } catch (error) {
    console.error("Error fetching teacher videos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get teacher's video stats

// Get teacher's video stats
exports.getTeacherVideoStats = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { schoolId } = req.query;

    // Get total videos count
    const totalVideos = await Video.countDocuments({
      uploadedBy: teacherId,
      schoolId,
    });

    // Get all video IDs for this teacher
    const videos = await Video.find(
      {
        uploadedBy: teacherId,
        schoolId,
      },
      "_id"
    );

    const videoIds = videos.map((v) => v._id);

    // If no videos found, return zeros
    if (videoIds.length === 0) {
      return res.json({
        totalVideos: 0,
        totalViews: 0,
        uniqueViewers: 0,
      });
    }

    // Get total views across all videos
    const totalViews = await VideoView.countDocuments({
      videoId: { $in: videoIds },
      schoolId,
    });

    // Get unique viewers count
    const uniqueViewers = await VideoView.distinct("learnerId", {
      videoId: { $in: videoIds },
      schoolId,
    });

    res.json({
      totalVideos,
      totalViews,
      uniqueViewers: uniqueViewers.length,
    });
  } catch (error) {
    console.error("Error getting video stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all videos uploaded by a teacher
exports.getTeacherVideos = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { schoolId } = req.query;

    const videos = await Video.find({
      uploadedBy: teacherId,
      schoolId,
    }).sort({ createdAt: -1 }); // Sort by newest first

    // Optionally add view counts if needed
    const videosWithStats = await Promise.all(
      videos.map(async (video) => {
        const viewCount = await VideoView.countDocuments({
          videoId: video._id,
        });
        const uniqueViewers = await VideoView.distinct("learnerId", {
          videoId: video._id,
        });
        return {
          ...video.toObject(),
          viewCount,
          uniqueViewers: uniqueViewers.length,
        };
      })
    );

    res.json(videosWithStats);
  } catch (error) {
    console.error("Error getting teacher videos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Get teacher's assignments count
exports.getTeacherAssignmentsCount = async (req, res) => {
  try {
    const count = await Assignment.countDocuments({
      createdBy: req.params.teacherId,
      schoolId: req.query.schoolId,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//admin

// Admin Auth Controller
exports.requestAdminCode = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Received email:", email);

    // Validate email
    if (email !== "xe.fusion.xe@gmail.com") {
      console.log("Unauthorized email attempt:", email);
      return res.status(401).json({ message: "Unauthorized email address" });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save to database
    const codeRecord = await AdminCode.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log("Code record saved:", codeRecord);

    // Send email
    const mailOptions = {
      from: `"Kids Matter" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Admin Access Code",
      text: `Your admin access code is: ${code}\nThis code will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #9C27B0;">Admin Access Code</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; color: #9C27B0; margin: 20px 0;">${code}</div>
          <p>This code will expire in 5 minutes.</p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    res.json({
      message: "Verification code sent to admin email",
      code: code, // For development only - remove in production
    });
  } catch (error) {
    console.error("Error in requestAdminCode:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

//exports.verifyAdminCode = async (req, res) => {

exports.verifyAdminCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and code are required",
      });
    }

    const sanitizedInput = String(code).trim().replace(/\D/g, "");
    const codeRecord = await AdminCode.findOne({ email });

    if (!codeRecord) {
      return res.status(401).json({
        success: false,
        message: "No code requested for this email",
      });
    }

    console.log("Verification Debug:", {
      dbCode: codeRecord.code,
      inputCode: sanitizedInput,
      match: codeRecord.code === sanitizedInput,
    });

    if (codeRecord.code !== sanitizedInput) {
      return res.status(401).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    if (new Date() > new Date(codeRecord.expiresAt)) {
      return res.status(401).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    const token = jwt.sign(
      { email, role: "admin", authType: "government" },
      secretKey,
      { expiresIn: "8h" }
    );

    await AdminCode.deleteOne({ email });

    return res.json({
      success: true,
      message: "Admin authentication successful",
      token,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//validate admin
exports.validateAdminToken = async (req, res) => {
  try {
    // If we get here, the token was already validated by the middleware
    res.json({ valid: true });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Get all schools for admin dashboard
exports.getAllSchools = async (req, res) => {
  try {
    const schools = await School.find()
      .select(
        "schoolName schoolCode email phoneNumber address county subcounty location village website isActive createdAt"
      )
      .sort({ createdAt: -1 });

    res.json(schools);
  } catch (error) {
    console.error("Error getting schools:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get school details with students, teachers, parents

exports.getSchoolDetails = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Get complete school info
    const school = await School.findById(schoolId).select(
      "schoolName schoolCode email phoneNumber location village address subcounty county isActive createdAt"
    );

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Get all students
    const students = await Learner.find({ schoolId }).select(
      "fullName admissionNumber class"
    );

    // Get all teachers with proper subject data
    const teachers = await Teacher.find({ schoolId }).select(
      "fullName email subjectSpecialization"
    );

    // Get all parents with child names
    const parents = await Parent.find({ schoolId })
      .populate({
        path: "learnerId",
        select: "fullName",
      })
      .select("parentName email learnerId");

    res.json({
      school,
      students,
      teachers,
      parents,
      studentCount: students.length,
      teacherCount: teachers.length,
      parentCount: parents.length,
    });
  } catch (error) {
    console.error("Error getting school details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all students for a school (admin)
exports.getSchoolStudents = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const students = await Learner.find({ schoolId }).select(
      "fullName admissionNumber class gender"
    );
    res.json(students);
  } catch (error) {
    console.error("Error getting school students:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all teachers for a school (admin)
exports.getSchoolTeachers = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const teachers = await Teacher.find({ schoolId }).select(
      "fullName email phoneNumber gender subjects"
    );
    res.json(teachers);
  } catch (error) {
    console.error("Error getting school teachers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all parents for a school (admin)
exports.getSchoolParents = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const parents = await Parent.find({ schoolId }).select(
      "fullName email phoneNumber children"
    );
    res.json(parents);
  } catch (error) {
    console.error("Error getting school parents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete school and all its members
// controllers/schoolController.js
exports.deleteSchool = async (req, res) => {
  const { schoolId } = req.params;
  const { adminEmail } = req.body;

  try {
    // Validate admin email
    if (adminEmail !== "xe.fusion.xe@gmail.com") {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid admin email" });
    }

    // Find the school first
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Create a record in DeletedSchools
    const deletedSchool = new DeletedSchool({
      originalId: school._id,
      schoolName: school.schoolName,
      email: school.email,
      phoneNumber: school.phoneNumber,
      location: school.location,
      village: school.village,
      subcounty: school.subcounty,
      county: school.county,
      schoolCode: school.schoolCode,
      isActive: school.isActive,
      createdAt: school.createdAt,
      deletedBy: adminEmail,
    });
    await deletedSchool.save();

    // Now delete the original school and related data
    await Promise.all([
      School.findByIdAndDelete(schoolId),
      Learner.deleteMany({ schoolId }),
      Teacher.deleteMany({ schoolId }),
      Parent.deleteMany({ schoolId }),
    ]);

    res.json({
      success: true,
      message: "School and all members deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting school:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Add this new controller for fetching deleted schools
exports.getDeletedSchools = async (req, res) => {
  try {
    const deletedSchools = await DeletedSchool.find().sort({ deletedAt: -1 });
    res.json(deletedSchools);
  } catch (error) {
    console.error("Error fetching deleted schools:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Post Controller
// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, description, schoolId } = req.body;
    const images =
      req.files?.map((file) => ({
        url: file.path,
        publicId: file.filename,
      })) || [];

    if (!title || !description || !schoolId) {
      return res
        .status(400)
        .json({ message: "Title, description, and schoolId are required" });
    }

    const post = new Post({
      title,
      description,
      images,
      schoolId,
    });

    await post.save();

    // Populate school details before sending response
    const populatedPost = await Post.findById(post._id).populate(
      "schoolId",
      "schoolName location address"
    );

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all posts (for school feeds)
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("schoolId", "schoolName location address")
      .populate("likes", "schoolName")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message, // Include error details for debugging
    });
  }
};

// Like/unlike a post
exports.toggleLike = async (req, res) => {
  try {
    const { postId, schoolId } = req.body;

    if (!postId || !schoolId) {
      return res
        .status(400)
        .json({ message: "Post ID and school ID are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(schoolId);
    if (likeIndex === -1) {
      // Like the post
      post.likes.push(schoolId);
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.status(200).json({
      message:
        likeIndex === -1
          ? "Post liked successfully"
          : "Post unliked successfully",
      likes: post.likes,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get posts by a specific school
exports.getPostsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const posts = await Post.find({ schoolId })
      .populate("schoolId", "schoolName location address")
      .populate("likes", "schoolName")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching school posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { postId, title, description, schoolId } = req.body;
    const images =
      req.files?.map((file) => ({
        url: file.path,
        publicId: file.filename,
      })) || [];

    if (!postId || !schoolId) {
      return res
        .status(400)
        .json({ message: "Post ID and school ID are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Verify the requesting school owns the post
    if (post.schoolId.toString() !== schoolId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this post" });
    }

    // Update post fields
    post.title = title || post.title;
    post.description = description || post.description;
    if (images.length > 0) {
      post.images = images;
    }

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("schoolId", "schoolName location address")
      .populate("likes", "schoolName");

    res.status(200).json({
      message: "Post updated successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const { postId, schoolId } = req.body;

    if (!postId || !schoolId) {
      return res
        .status(400)
        .json({ message: "Post ID and school ID are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Verify the requesting school owns the post
    if (post.schoolId.toString() !== schoolId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this post" });
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add comment to post
exports.addComment = async (req, res) => {
  try {
    const { postId, schoolId, content } = req.body;

    if (!postId || !schoolId || !content) {
      return res
        .status(400)
        .json({ message: "Post ID, school ID, and content are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      content,
      schoolId,
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the newly added comment's school details
    const populatedPost = await Post.findById(postId)
      .populate("schoolId", "schoolName location address")
      .populate("comments.schoolId", "schoolName location address");

    res.status(201).json({
      message: "Comment added successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Like/unlike a comment
exports.toggleCommentLike = async (req, res) => {
  try {
    const { postId, commentId, schoolId } = req.body;

    if (!postId || !commentId || !schoolId) {
      return res
        .status(400)
        .json({ message: "Post ID, comment ID, and school ID are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const likeIndex = comment.likes.indexOf(schoolId);
    if (likeIndex === -1) {
      // Like the comment
      comment.likes.push(schoolId);
    } else {
      // Unlike the comment
      comment.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.status(200).json({
      message:
        likeIndex === -1
          ? "Comment liked successfully"
          : "Comment unliked successfully",
      comment,
    });
  } catch (error) {
    console.error("Error toggling comment like:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId, schoolId } = req.body;

    if (!postId || !commentId || !schoolId) {
      return res
        .status(400)
        .json({ message: "Post ID, comment ID, and school ID are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Verify the requesting school owns the comment
    if (comment.schoolId.toString() !== schoolId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this comment" });
    }

    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Rename the method from getSchoolProfile to getSchoolFeed
exports.getSchoolFeed = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Get school basic info
    const school = await School.findById(schoolId).select(
      "schoolName location address profileImage coverImage"
    );

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Get all posts by this school
    const posts = await Post.find({ schoolId })
      .populate("schoolId", "schoolName location address profileImage")
      .populate("likes", "schoolName")
      .sort({ createdAt: -1 });

    // Count likes and comments across all posts
    let totalLikes = 0;
    let totalComments = 0;

    posts.forEach((post) => {
      totalLikes += post.likes.length;
      totalComments += post.comments.length;
    });

    res.status(200).json({
      school,
      posts,
      stats: {
        totalPosts: posts.length,
        totalLikes,
        totalComments,
      },
    });
  } catch (error) {
    console.error("Error fetching school feed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get full school profile
exports.getSchoolProfile = async (req, res) => {
  const { schoolId } = req.query;

  try {
    // Validate schoolId
    if (!schoolId || !mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ message: "Invalid school ID" });
    }

    const school = await School.findById(schoolId)
      .select("-activationToken -__v") // Exclude sensitive/unnecessary fields
      .lean();

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Add some statistics
    const [learnersCount, teachersCount, parentsCount] = await Promise.all([
      Learner.countDocuments({ schoolId }),
      Teacher.countDocuments({ schoolId }),
      Parent.countDocuments({ schoolId }),
    ]);

    const schoolProfile = {
      ...school,
      statistics: {
        learners: learnersCount,
        teachers: teachersCount,
        parents: parentsCount,
      },
    };

    res.status(200).json(schoolProfile);
  } catch (error) {
    console.error("Error fetching school profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update school profile
exports.updateSchoolProfile = async (req, res) => {
  const { schoolId } = req.params;
  const { phoneNumber, email, website, address } = req.body;

  try {
    // Validate input
    if (!phoneNumber || !email) {
      return res
        .status(400)
        .json({ message: "Phone number and email are required" });
    }

    const updatedSchool = await School.findByIdAndUpdate(
      schoolId,
      { phoneNumber, email, website, address },
      { new: true, runValidators: true }
    ).select("-activationToken -__v");

    if (!updatedSchool) {
      return res.status(404).json({ message: "School not found" });
    }

    res.status(200).json(updatedSchool);
  } catch (error) {
    console.error("Error updating school profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//GUEST LEARNER

// Register Guest Learner
exports.registerGuestLearner = async (req, res) => {
  const { fullName, email, phoneNumber, password } = req.body;

  try {
    // Validate input
    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing email or phone
    const existingLearner = await GuestLearner.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingLearner) {
      return res.status(400).json({
        message: "Email or phone number already registered",
      });
    }

    // Create new guest learner
    const newGuestLearner = new GuestLearner({
      fullName,
      email,
      phoneNumber,
      password, // In production, you should hash this
    });

    await newGuestLearner.save();

    res.status(201).json({
      message: "Guest learner registered successfully",
      learnerId: newGuestLearner._id,
    });
  } catch (error) {
    console.error("Error registering guest learner:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Guest Learner Login
exports.guestLearnerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const guestLearner = await GuestLearner.findOne({ email });

    if (!guestLearner) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // In production, use bcrypt to compare hashed passwords
    if (guestLearner.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      learnerId: guestLearner._id,
      fullName: guestLearner.fullName,
    });
  } catch (error) {
    console.error("Error logging in guest learner:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Guest Learners (for admin)
exports.getGuestLearners = async (req, res) => {
  try {
    const guestLearners = await GuestLearner.find().select(
      "fullName email phoneNumber createdAt"
    );
    res.status(200).json(guestLearners);
  } catch (error) {
    console.error("Error fetching guest learners:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//const AmplifiedEvent = require('../models/AmplifiedEvent');

// Publish National Event
exports.publishAmplifiedEvent = async (req, res) => {
  const {
    eventName,
    dateTime,
    venue,
    organizer,
    objective,
    targetAudience,
    eventTheme,
    schedule,
    keySpeakers,
    workshops,
    entryRequirements,
    parkingTransport,
    cateringRefreshments,
    dressCode,
    sponsorships,
    contactInformation,
  } = req.body;

  try {
    const newEvent = new AmplifiedEvent({
      eventName,
      dateTime,
      venue,
      organizer,
      objective,
      targetAudience,
      eventTheme,
      schedule,
      keySpeakers,
      workshops,
      entryRequirements,
      parkingTransport,
      cateringRefreshments,
      dressCode,
      sponsorships,
      contactInformation,
    });

    await newEvent.save();
    res.status(201).json({
      message: "National event published successfully.",
      event: newEvent,
    });
  } catch (error) {
    console.error("Error publishing national event:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get All National Events
exports.getAmplifiedEvents = async (req, res) => {
  try {
    const events = await AmplifiedEvent.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching national events:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get Latest National Events (for home screens)
exports.getLatestAmplifiedEvents = async (req, res) => {
  try {
    const events = await AmplifiedEvent.find().sort({ createdAt: -1 }).limit(2); // Get only the 2 most recent events
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching latest national events:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//const Scholarship = require('../models/Scholarship');

// Publish Scholarship
exports.publishScholarship = async (req, res) => {
  try {
    const newScholarship = new Scholarship(req.body);
    await newScholarship.save();
    res.status(201).json({
      message: "Scholarship published successfully",
      scholarship: newScholarship,
    });
  } catch (error) {
    console.error("Error publishing scholarship:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Scholarships
exports.getAllScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find().sort({ createdAt: -1 });
    res.status(200).json(scholarships);
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Latest Scholarships (for home screens)
exports.getLatestScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find()
      .sort({ deadline: 1 }) // Sort by nearest deadline
      .limit(2);
    res.status(200).json(scholarships);
  } catch (error) {
    console.error("Error fetching latest scholarships:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Register device token for push notifications
exports.registerDeviceToken = async (req, res) => {
  const { userId, deviceToken } = req.body;

  try {
    // Validate input
    if (!userId || !deviceToken) {
      return res.status(400).json({
        success: false,
        message: "userId and deviceToken are required",
      });
    }

    // Find the parent and update their device token
    const parent = await Parent.findByIdAndUpdate(
      userId,
      { deviceToken },
      { new: true }
    );

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Device token registered successfully",
    });
  } catch (error) {
    console.error("Error registering device token:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
