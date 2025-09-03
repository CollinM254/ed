// controllers/teacherResourceController.js
const TeacherResource = require("../models/TeacherResource");
const { cloudinary } = require("../config/cloudinary");
const mongoose = require("mongoose");
const axios = require("axios");

// Helper functions
const getResourceType = (mimetype) => {
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("image/")) return "image";
  return "raw";
};

const getFormat = (mimetype) => {
  const parts = mimetype.split("/");
  if (
    parts[1] === "vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "docx";
  if (parts[1] === "msword") return "doc";
  return parts[1];
};

exports.uploadTeacherResource = async (req, res) => {
  try {
    const { title, description, class: className, subject } = req.body;

    if (!title || !className || !subject || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Title, class, subject, and file are required",
      });
    }

    // Extract public ID from Cloudinary response
    const publicId = req.file.filename.replace(/\.[^/.]+$/, "");

    const resource = new TeacherResource({
      title,
      description: description || "",
      class: className,
      subject,
      fileUrl: req.file.path,
      fileType: req.file.originalname.split(".").pop().toLowerCase(),
      publicId: publicId,
      resourceType: req.file.resource_type || "raw",
      fileSize: req.file.size,
    });

    await resource.save();

    res.status(201).json({
      success: true,
      message: "Resource uploaded successfully",
      resource,
    });
  } catch (error) {
    console.error("Error uploading teacher resource:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all teacher resources (for teachers)
exports.getAllTeacherResources = async (req, res) => {
  try {
    const resources = await TeacherResource.find()
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    console.error("Error fetching teacher resources:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get resources by class and subject
exports.getResourcesByClassAndSubject = async (req, res) => {
  try {
    const { class: className, subject } = req.query;

    if (!className || !subject) {
      return res.status(400).json({
        success: false,
        message: "Class and subject are required",
      });
    }

    const resources = await TeacherResource.find({ class: className, subject })
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    console.error("Error fetching resources by class/subject:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// // Fixed getDownloadUrl function
// exports.getDownloadUrl = async (req, res) => {
//   try {
//     const resourceId = req.params.id;

//     if (!mongoose.Types.ObjectId.isValid(resourceId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid resource ID format",
//       });
//     }

//     const resource = await TeacherResource.findById(resourceId);
//     if (!resource) {
//       return res.status(404).json({
//         success: false,
//         message: "Resource not found",
//       });
//     }

//     if (!resource.fileUrl) {
//       return res.status(404).json({
//         success: false,
//         message: "Resource has no file URL",
//       });
//     }

//     console.log("Resource found:", {
//       id: resource._id,
//       title: resource.title,
//       fileUrl: resource.fileUrl,
//       publicId: resource.publicId,
//       fileType: resource.fileType,
//     });

//     let downloadUrl;

//     if (resource.fileUrl.includes("cloudinary.com")) {
//       try {
//         // Extract public ID from the URL if not stored
//         let publicId = resource.publicId;
//         if (!publicId) {
//           // Extract from URL: https://res.cloudinary.com/[cloud]/[resource_type]/upload/[public_id].[format]
//           const urlParts = resource.fileUrl.split("/");
//           const lastPart = urlParts[urlParts.length - 1];
//           publicId = lastPart.split(".")[0]; // Remove extension
//         }

//         console.log("Using publicId:", publicId);

//         // Determine resource type
//         const resourceType = resource.resourceType || "raw";

//         // Generate download URL with attachment flag
//         // downloadUrl = cloudinary.url(publicId, {
//         //   resource_type: resourceType,
//         //   secure: true,
//         //   flags: 'attachment',
//         //   sign_url: false, // Try without signing first
//         //   type: 'upload'
//         // });
//         // Generate download URL with attachment flag
//         downloadUrl = cloudinary.url(publicId, {
//           resource_type: resourceType,
//           secure: true,
//           flags: "attachment",
//           sign_url: true, // Enable signing for private resources
//           type: "upload",
//           fetch_format: "auto", // Let Cloudinary handle format
//           quality: "auto", // Let Cloudinary handle quality
//         });

//         console.log("Generated Cloudinary download URL:", downloadUrl);

//         // Test if the URL is accessible
//         try {
//           const testResponse = await axios.head(downloadUrl, {
//             timeout: 5000,
//             headers: {
//               "User-Agent": "Node.js/Resource-Downloader",
//             },
//           });

//           if (testResponse.status !== 200) {
//             console.warn(
//               "Cloudinary URL test failed with status:",
//               testResponse.status
//             );
//             throw new Error("URL not accessible");
//           }
//         } catch (testError) {
//           console.warn("Cloudinary URL test failed:", testError.message);
//           // Fall back to direct download endpoint
//           downloadUrl = `https://kidsm.vercel.app/api/schools/teacher-resources/direct-download/${resource._id}`;
//         }
//       } catch (cloudinaryError) {
//         console.error("Cloudinary URL generation failed:", cloudinaryError);
//         // Fallback to direct download endpoint
//         downloadUrl = `https://kidsm.vercel.app/api/schools/teacher-resources/direct-download/${resource._id}`;
//       }
//     } else {
//       // If not a Cloudinary URL, use direct download endpoint
//       downloadUrl = `https://kidsm.vercel.app/api/schools/teacher-resources/direct-download/${resource._id}`;
//     }

//     res.status(200).json({
//       success: true,
//       url: downloadUrl,
//       fileType: resource.fileType,
//       title: resource.title,
//       fileSize: resource.fileSize || 0,
//     });
//   } catch (error) {
//     console.error("Error generating download URL:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// exports.getDownloadUrl = async (req, res) => {
//   try {
//     const resourceId = req.params.id;

//     if (!mongoose.Types.ObjectId.isValid(resourceId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid resource ID format",
//       });
//     }

//     const resource = await TeacherResource.findById(resourceId);
//     if (!resource) {
//       return res.status(404).json({
//         success: false,
//         message: "Resource not found",
//       });
//     }

//     if (!resource.fileUrl) {
//       return res.status(404).json({
//         success: false,
//         message: "Resource has no file URL",
//       });
//     }

//     console.log("Resource found:", {
//       id: resource._id,
//       title: resource.title,
//       fileUrl: resource.fileUrl,
//       publicId: resource.publicId,
//       fileType: resource.fileType,
//     });

//     let downloadUrl = resource.fileUrl;
//     let viewUrl = resource.fileUrl;

//     if (resource.fileUrl.includes("cloudinary.com")) {
//       try {
//         let publicId = resource.publicId;
//         if (!publicId) {
//           const urlParts = resource.fileUrl.split("/");
//           const lastPart = urlParts[urlParts.length - 1];
//           publicId = lastPart.split(".")[0];
//         }

//         console.log("Using publicId:", publicId);

//         const resourceType =
//           resource.resourceType || determineResourceType(resource.fileType);
//         const fileType = resource.fileType?.toLowerCase() || "file";

//         // Generate download URL with attachment flag
//         downloadUrl = cloudinary.url(`${publicId}.${fileType}`, {
//           resource_type: resourceType,
//           secure: true,
//           flags: "attachment",
//           type: "upload",
//         });

//         // Generate view URL without attachment flag for preview
//         viewUrl = cloudinary.url(`${publicId}.${fileType}`, {
//           resource_type: resourceType,
//           secure: true,
//           type: "upload",
//         });

//         console.log("Generated URLs:", { downloadUrl, viewUrl });

//         // Test the view URL
//         try {
//           const testResponse = await axios.head(viewUrl, {
//             timeout: 5000,
//             headers: {
//               "User-Agent": "Node.js/Resource-Viewer",
//             },
//           });

//           if (testResponse.status !== 200) {
//             console.warn(
//               "Cloudinary view URL test failed with status:",
//               testResponse.status
//             );
//             viewUrl = `https://kidsm.vercel.app/api/schools/teacher-resources/direct-download/${resource._id}`;
//             downloadUrl = viewUrl;
//           }
//         } catch (testError) {
//           console.warn("Cloudinary view URL test failed:", testError.message);
//           viewUrl = `https://kidsm.vercel.app/api/schools/teacher-resources/direct-download/${resource._id}`;
//           downloadUrl = viewUrl;
//         }
//       } catch (cloudinaryError) {
//         console.error("Cloudinary URL generation failed:", cloudinaryError);
//         viewUrl = `https://kidsm.vercel.app/api/schools/teacher-resources/direct-download/${resource._id}`;
//         downloadUrl = viewUrl;
//       }
//     }

//     // Check if the request expects a blob (for direct download/view)
//     const acceptHeader = req.headers.accept || "";
//     if (
//       acceptHeader.includes("application/octet-stream") ||
//       acceptHeader.includes("blob")
//     ) {
//       // Stream the file directly
//       const response = await axios({
//         method: "GET",
//         url: viewUrl,
//         responseType: "stream",
//         timeout: 30000,
//         headers: {
//           "User-Agent": "Node.js/Resource-Downloader",
//           Accept: getMimeType(resource.fileType),
//         },
//       });

//       if (response.status !== 200) {
//         return res.status(response.status).json({
//           success: false,
//           message: `Failed to fetch file: ${response.statusText}`,
//         });
//       }

//       const contentType =
//         getMimeType(resource.fileType) || "application/octet-stream";
//       const filename = `${resource.title.replace(/[^a-zA-Z0-9\s\-_.]/g, "")}.${
//         resource.fileType || "file"
//       }`;

//       res.setHeader("Content-Type", contentType);
//       res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
//       res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

//       if (response.headers["content-length"]) {
//         res.setHeader("Content-Length", response.headers["content-length"]);
//       }

//       response.data.pipe(res);

//       response.data.on("error", (streamError) => {
//         console.error("Stream error:", streamError);
//         if (!res.headersSent) {
//           res.status(500).json({
//             success: false,
//             message: "Stream error occurred",
//           });
//         }
//       });
//     } else {
//       // Return JSON with URLs for viewing and downloading
//       res.status(200).json({
//         success: true,
//         viewUrl,
//         downloadUrl,
//         fileType: resource.fileType || "file",
//         mimeType: getMimeType(resource.fileType),
//         title: resource.title,
//         fileSize: resource.fileSize || 0,
//       });
//     }
//   } catch (error) {
//     console.error("Error generating download URL:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
exports.getDownloadUrl = async (req, res) => {
  try {
    const resourceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID format",
      });
    }

    const resource = await TeacherResource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    if (!resource.fileUrl) {
      return res.status(404).json({
        success: false,
        message: "Resource has no file URL",
      });
    }

    console.log("Resource found:", {
      id: resource._id,
      title: resource.title,
      fileUrl: resource.fileUrl,
      publicId: resource.publicId,
      fileType: resource.fileType,
    });

    let downloadUrl = resource.fileUrl;
    let viewUrl = resource.fileUrl;

    // if (resource.fileUrl.includes("cloudinary.com")) {
    //   try {
    //     let publicId = resource.publicId;
    //     if (!publicId) {
    //       const urlParts = resource.fileUrl.split("/");
    //       publicId = urlParts[urlParts.length - 1].split(".")[0];
    //     }

    //     console.log("Using publicId:", publicId);

    //     const resourceType = resource.resourceType || determineResourceType(resource.fileType);

    //     // Generate download URL without extension for raw files
    //     downloadUrl = cloudinary.url(publicId, {
    //       resource_type: resourceType,
    //       secure: true,
    //       flags: resourceType === "raw" ? "attachment" : undefined,
    //       type: "upload",
    //       sign_url: false, // Public resources don't need signing
    //     });

    //     // Generate view URL without attachment flag
    //     viewUrl = cloudinary.url(publicId, {
    //       resource_type: resourceType,
    //       secure: true,
    //       type: "upload",
    //       sign_url: false,
    //     });

    //     console.log("Generated URLs:", { downloadUrl, viewUrl });

    //     // Test the view URL
    //     try {
    //       const testResponse = await axios.head(viewUrl, {
    //         timeout: 5000,
    //         headers: {
    //           "User-Agent": "Node.js/Resource-Viewer",
    //         },
    //       });

    //       if (testResponse.status !== 200) {
    //         console.warn("Cloudinary view URL test failed with status:", testResponse.status);
    //         viewUrl = `https://kidsm.vercel.app/api/schools/teacher-resources/direct-download/${resource._id}`;
    //         downloadUrl = viewUrl;
    //       }
    //     } catch (testError) {
    //       console.warn("Cloudinary view URL test failed:", testError.message);
    //       viewUrl = `https://kidsm.vercel.app/api/schools/teacher-resources/direct-download/${resource._id}`;
    //       downloadUrl = viewUrl;
    //     }
    //   } catch (cloudinaryError) {
    //     console.error("Cloudinary URL generation failed:", cloudinaryError);
    //     viewUrl = `https://kidsm.vercel.app/api/schools/teacher-resources/direct-download/${resource._id}`;
    //     downloadUrl = viewUrl;
    //   }
    // }
    if (resource.fileUrl.includes("cloudinary.com")) {
      try {
        let publicId = resource.publicId;
        if (!publicId) {
          const urlParts = resource.fileUrl.split("/");
          publicId = urlParts[urlParts.length - 1].split(".")[0];
        }

        console.log("Using publicId:", publicId);

        const resourceType =
          resource.resourceType || determineResourceType(resource.fileType);

        // Generate download URL
        downloadUrl = cloudinary.url(
          resourceType === "raw"
            ? publicId
            : `${publicId}.${resource.fileType}`,
          {
            resource_type: resourceType,
            secure: true,
            flags: resourceType === "raw" ? "attachment" : undefined,
            type: "upload",
            sign_url: false,
          }
        );

        // Generate view URL
        viewUrl = cloudinary.url(
          resourceType === "raw"
            ? publicId
            : `${publicId}.${resource.fileType}`,
          {
            resource_type: resourceType,
            secure: true,
            type: "upload",
            sign_url: false,
          }
        );

        console.log("Generated URLs:", { downloadUrl, viewUrl });

        // Test the view URL
        try {
          const testResponse = await axios.head(viewUrl, {
            timeout: 5000,
            headers: {
              "User-Agent": "Node.js/Resource-Viewer",
            },
          });

          if (testResponse.status !== 200) {
            console.warn(
              "Cloudinary view URL test failed with status:",
              testResponse.status
            );
            viewUrl = `https://kidsm.vercel.app/api/schools/teacher-resources/direct-download/${resource._id}`;
            downloadUrl = viewUrl;
          }
        } catch (testError) {
          console.warn("Cloudinary view URL test failed:", testError.message);
          viewUrl = `https://kidsm.vercel.app/api/schools/teacher-resources/direct-download/${resource._id}`;
          downloadUrl = viewUrl;
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary URL generation failed:", cloudinaryError);
        viewUrl = `https://kidsm.vercel.app/api/schools/teacher-resources/direct-download/${resource._id}`;
        downloadUrl = viewUrl;
      }
    }

    // Handle direct download/view request
    const acceptHeader = req.headers.accept || "";
    if (
      acceptHeader.includes("application/octet-stream") ||
      acceptHeader.includes("blob")
    ) {
      const response = await axios({
        method: "GET",
        url: viewUrl,
        responseType: "stream",
        timeout: 30000,
        headers: {
          "User-Agent": "Node.js/Resource-Downloader",
          Accept: getMimeType(resource.fileType),
        },
      });

      if (response.status !== 200) {
        return res.status(response.status).json({
          success: false,
          message: `Failed to fetch file: ${response.statusText}`,
        });
      }

      const contentType =
        getMimeType(resource.fileType) || "application/octet-stream";
      const filename = `${resource.title.replace(/[^a-zA-Z0-9\s\-_.]/g, "")}.${
        resource.fileType || "file"
      }`;

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

      if (response.headers["content-length"]) {
        res.setHeader("Content-Length", response.headers["content-length"]);
      }

      response.data.pipe(res);

      response.data.on("error", (streamError) => {
        console.error("Stream error:", streamError);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Stream error occurred",
          });
        }
      });
    } else {
      res.status(200).json({
        success: true,
        viewUrl,
        downloadUrl,
        fileType: resource.fileType || "file",
        mimeType: getMimeType(resource.fileType),
        title: resource.title,
        fileSize: resource.fileSize || 0,
      });
    }
  } catch (error) {
    console.error("Error generating download URL:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Helper function to determine resource type
function determineResourceType(fileType) {
  if (!fileType) return "raw";

  const fileTypeLower = fileType.toLowerCase();
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  const videoExtensions = ["mp4", "mov", "avi", "webm", "mkv"];

  if (imageExtensions.includes(fileTypeLower)) {
    return "image";
  } else if (videoExtensions.includes(fileTypeLower)) {
    return "video";
  } else {
    return "raw";
  }
}

// Helper function to determine MIME type
function getMimeType(fileType) {
  const mimeTypes = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    txt: "text/plain",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
  };
  return mimeTypes[fileType?.toLowerCase()] || "application/octet-stream";
}

// // Enhanced direct download endpoint
// exports.downloadResource = async (req, res) => {
//   try {
//     const resourceId = req.params.id;

//     if (!mongoose.Types.ObjectId.isValid(resourceId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid resource ID format",
//       });
//     }

//     const resource = await TeacherResource.findById(resourceId);
//     if (!resource) {
//       return res.status(404).json({
//         success: false,
//         message: "Resource not found",
//       });
//     }

//     if (!resource.fileUrl) {
//       return res.status(404).json({
//         success: false,
//         message: "File URL not found",
//       });
//     }

//     console.log(`Starting direct download for: ${resource.title}`);
//     console.log(`Source URL: ${resource.fileUrl}`);

//     // Determine content type based on file extension
//     const fileTypeLower = (resource.fileType || "").toLowerCase();
//     let contentType = "application/octet-stream";

//     const mimeTypes = {
//       pdf: "application/pdf",
//       doc: "application/msword",
//       docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       xls: "application/vnd.ms-excel",
//       xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       ppt: "application/vnd.ms-powerpoint",
//       pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//       jpg: "image/jpeg",
//       jpeg: "image/jpeg",
//       png: "image/png",
//       gif: "image/gif",
//       txt: "text/plain",
//       zip: "application/zip",
//       rar: "application/x-rar-compressed",
//     };

//     if (mimeTypes[fileTypeLower]) {
//       contentType = mimeTypes[fileTypeLower];
//     }

//     console.log(`Using content type: ${contentType}`);

//     // Create a safe filename
//     const safeTitle = resource.title.replace(/[^a-zA-Z0-9\s\-_.]/g, "");
//     const filename = `${safeTitle}.${fileTypeLower}`;

//     try {
//       console.log("Attempting to fetch file from:", resource.fileUrl);

//       const response = await axios({
//         method: "GET",
//         url: resource.fileUrl,
//         responseType: "stream",
//         timeout: 30000,
//         headers: {
//           "User-Agent": "Node.js/Resource-Downloader",
//           Accept: "*/*",
//         },
//       });

//       console.log("File fetch successful, status:", response.status);
//       console.log("Response headers:", response.headers);

//       // Set response headers
//       res.setHeader("Content-Type", contentType);
//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename="${encodeURIComponent(filename)}"`
//       );
//       res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

//       // Set content length if available
//       if (response.headers["content-length"]) {
//         res.setHeader("Content-Length", response.headers["content-length"]);
//       }

//       // Pipe the response
//       response.data.pipe(res);

//       // Handle stream errors
//       response.data.on("error", (streamError) => {
//         console.error("Stream error:", streamError);
//         if (!res.headersSent) {
//           res.status(500).json({
//             success: false,
//             message: "Stream error occurred",
//           });
//         }
//       });

//       response.data.on("end", () => {
//         console.log("Download completed successfully");
//       });
//     } catch (fetchError) {
//       console.error("Error fetching file:", fetchError);

//       // More detailed error handling
//       if (fetchError.response) {
//         console.error("Response status:", fetchError.response.status);
//         console.error("Response data:", fetchError.response.data);

//         return res.status(fetchError.response.status).json({
//           success: false,
//           message: `Failed to fetch file: ${fetchError.response.status} ${fetchError.response.statusText}`,
//           error: fetchError.message,
//         });
//       } else if (fetchError.request) {
//         console.error("No response received:", fetchError.request);
//         return res.status(502).json({
//           success: false,
//           message: "No response from file server",
//           error: fetchError.message,
//         });
//       } else {
//         console.error("Request setup error:", fetchError.message);
//         return res.status(500).json({
//           success: false,
//           message: "Request setup failed",
//           error: fetchError.message,
//         });
//       }
//     }
//   } catch (error) {
//     console.error("Download process error:", error);
//     if (!res.headersSent) {
//       res.status(500).json({
//         success: false,
//         message: "Download process failed",
//         error: error.message,
//       });
//     }
//   }
// };

// exports.downloadResource = async (req, res) => {
//   try {
//     const resourceId = req.params.id;

//     if (!mongoose.Types.ObjectId.isValid(resourceId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid resource ID format",
//       });
//     }

//     const resource = await TeacherResource.findById(resourceId);
//     if (!resource) {
//       return res.status(404).json({
//         success: false,
//         message: "Resource not found",
//       });
//     }

//     if (!resource.fileUrl) {
//       return res.status(404).json({
//         success: false,
//         message: "File URL not found",
//       });
//     }

//     // Create a safe filename
//     const safeTitle = resource.title.replace(/[^a-zA-Z0-9\s\-_.]/g, "");
//     const filename = `${safeTitle}.${resource.fileType.toLowerCase()}`;

//     // If it's a Cloudinary URL
//     if (resource.fileUrl.includes("cloudinary.com")) {
//       try {
//         // Extract public ID if not stored
//         let publicId =
//           resource.publicId || resource.fileUrl.split("/").pop().split(".")[0];

//         // // Generate signed download URL
//         // const downloadUrl = cloudinary.url(publicId, {
//         //   resource_type: resource.resourceType || 'raw',
//         //   secure: true,
//         //   flags: 'attachment',
//         //   sign_url: true,
//         //   type: 'upload',
//         //   filename_override: filename,
//         //   disposition: 'attachment'
//         // });
//         const downloadUrl = cloudinary.url(publicId, {
//           resource_type: resource.resourceType || "raw", // Critical for non-image files
//           secure: true,
//           flags: "attachment", // Forces download
//           type: "upload",
//           sign_url: true, // Required for private resources
//           expires_at: Math.floor(Date.now() / 1000) + 3600, // URL expires in 1 hour
//         });

//         // Redirect to Cloudinary's signed URL
//         return res.redirect(downloadUrl);
//       } catch (cloudinaryError) {
//         console.error("Cloudinary URL generation failed:", cloudinaryError);
//         return res.status(500).json({
//           success: false,
//           message: "Failed to generate download URL",
//         });
//       }
//     }

//     // For non-Cloudinary URLs, use axios to stream
//     try {
//       const response = await axios({
//         method: "GET",
//         url: resource.fileUrl,
//         responseType: "stream",
//         timeout: 30000,
//       });

//       // Set proper headers
//       res.setHeader(
//         "Content-Type",
//         response.headers["content-type"] || "application/octet-stream"
//       );
//       res.setHeader(
//         "Content-Disposition",
//         `attachment; filename="${encodeURIComponent(filename)}"`
//       );
//       res.setHeader(
//         "Content-Length",
//         response.headers["content-length"] || resource.fileSize || ""
//       );

//       // Pipe the response
//       response.data.pipe(res);

//       response.data.on("error", (err) => {
//         console.error("Stream error:", err);
//         if (!res.headersSent) {
//           res.status(500).json({
//             success: false,
//             message: "Download failed during streaming",
//           });
//         }
//       });
//     } catch (fetchError) {
//       console.error("Error fetching file:", fetchError);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to download file",
//         error: fetchError.message,
//       });
//     }
//   } catch (error) {
//     console.error("Download process error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
// exports.downloadResource = async (req, res) => {
//   try {
//     const resource = await TeacherResource.findById(req.params.id);

//     if (!resource) {
//       return res.status(404).json({
//         success: false,
//         message: 'Resource not found'
//       });
//     }

//     // Create safe filename with extension
//     const fileExt = resource.fileType?.toLowerCase() || 'pdf';
//     const safeTitle = resource.title.replace(/[^a-zA-Z0-9\s\-_]/g, '');
//     const filename = `${safeTitle}.${fileExt}`;

//     // For Cloudinary files
//     if (resource.fileUrl.includes("cloudinary.com")) {
//       const publicId = resource.publicId ||
//                       resource.fileUrl.split('/').pop().split('.')[0];

//       // Generate signed download URL with extension
//       const downloadUrl = cloudinary.url(`${publicId}.${fileExt}`, {
//         resource_type: resource.resourceType || 'raw',
//         secure: true,
//         flags: 'attachment',
//         sign_url: true,
//         type: 'upload',
//         filename_override: filename,
//         disposition: 'attachment'
//       });

//       return res.redirect(downloadUrl);
//     }

//     // For non-Cloudinary files
//     const response = await axios({
//       method: 'GET',
//       url: resource.fileUrl,
//       responseType: 'stream'
//     });

//     // Set proper headers with filename and extension
//     res.setHeader('Content-Type', resource.mimeType || 'application/octet-stream');
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

//     response.data.pipe(res);

//   } catch (error) {
//     console.error('Download error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Download failed',
//       error: error.message
//     });
//   }
// };


// exports.downloadResource = async (req, res) => {
//   try {
//     const resource = await TeacherResource.findById(req.params.id);

//     if (!resource) {
//       return res.status(404).json({
//         success: false,
//         message: "Resource not found",
//       });
//     }

//     // Create safe filename without extension for raw files
//     const fileExt =
//       resource.resourceType === "raw"
//         ? ""
//         : resource.fileType?.toLowerCase() || "file";
//     const safeTitle = resource.title.replace(/[^a-zA-Z0-9\s\-_]/g, "");
//     const filename = fileExt ? `${safeTitle}.${fileExt}` : safeTitle;

//     // // For Cloudinary files
//     // if (resource.fileUrl.includes("cloudinary.com")) {
//     //   const publicId =
//     //     resource.publicId || resource.fileUrl.split("/").pop().split(".")[0];

//     //   // Generate signed download URL without extension for raw files
//     //   const downloadUrl = cloudinary.url(publicId, {
//     //     resource_type: resource.resourceType || "raw",
//     //     secure: true,
//     //     flags: resource.resourceType === "raw" ? "attachment" : undefined,
//     //     type: "upload",
//     //     sign_url: false,
//     //     filename_override: filename,
//     //     disposition: "attachment",
//     //   });

//     //   return res.redirect(downloadUrl);
//     // }
//     if (resource.fileUrl.includes("cloudinary.com")) {
//       const publicId =
//         resource.publicId || resource.fileUrl.split("/").pop().split(".")[0];

//       const downloadUrl = cloudinary.url(
//         resource.resourceType === "raw"
//           ? publicId
//           : `${publicId}.${resource.fileType}`,
//         {
//           resource_type: resource.resourceType || "raw",
//           secure: true,
//           flags: resource.resourceType === "raw" ? "attachment" : undefined,
//           type: "upload",
//           sign_url: false,
//           filename_override: filename,
//           disposition: "attachment",
//         }
//       );

//       return res.redirect(downloadUrl);
//     }

//     // For non-Cloudinary files
//     const response = await axios({
//       method: "GET",
//       url: resource.fileUrl,
//       responseType: "stream",
//     });

//     res.setHeader(
//       "Content-Type",
//       resource.mimeType || "application/octet-stream"
//     );
//     res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

//     response.data.pipe(res);
//   } catch (error) {
//     console.error("Download error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Download failed",
//       error: error.message,
//     });
//   }
// };
exports.downloadResource = async (req, res) => {
  try {
    const resource = await TeacherResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    // Create safe filename with extension
    const fileExt = resource.fileType?.toLowerCase() || '';
    const safeTitle = resource.title.replace(/[^a-zA-Z0-9\s\-_]/g, '');
    const filename = fileExt ? `${safeTitle}.${fileExt}` : safeTitle;

    // For Cloudinary files
    if (resource.fileUrl.includes("cloudinary.com")) {
      const publicId = resource.publicId || resource.fileUrl.split("/").pop().split(".")[0];

      // Generate download URL with proper extension if it's not a raw file
      const downloadUrl = cloudinary.url(resource.resourceType === "raw" ? publicId : `${publicId}.${fileExt}`, {
        resource_type: resource.resourceType || "raw",
        secure: true,
        flags: "attachment",
        type: "upload",
        sign_url: false,
        filename_override: filename,
        disposition: "attachment"
      });

      return res.redirect(downloadUrl);
    }

    // For non-Cloudinary files
    const response = await axios({
      method: "GET",
      url: resource.fileUrl,
      responseType: "stream",
    });

    // Set proper content type and filename
    const contentType = getMimeType(resource.fileType) || "application/octet-stream";
    
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    response.data.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Download failed",
      error: error.message,
    });
  }
};

// Helper function to determine resource type
function determineResourceType(fileType) {
  if (!fileType) return "raw";

  const fileTypeLower = fileType.toLowerCase();

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
  const videoExtensions = ["mp4", "mov", "avi", "webm", "mkv"];

  if (imageExtensions.includes(fileTypeLower)) {
    return "image";
  } else if (videoExtensions.includes(fileTypeLower)) {
    return "video";
  } else {
    return "raw";
  }
}

exports.getResourcesByFilter = async (req, res) => {
  try {
    const { class: className, subject } = req.query;

    if (!className || !subject) {
      return res.status(400).json({
        success: false,
        message: "Both class and subject parameters are required",
      });
    }

    const filterQuery = {};

    if (className !== "All") filterQuery.class = className;
    if (subject !== "All") filterQuery.subject = subject;

    console.log("Filtering resources with query:", filterQuery);

    const resources = await TeacherResource.find(filterQuery).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    console.error("Error filtering resources:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getResources = async (req, res) => {
  try {
    const resources = await TeacherResource.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getResourceCategories = async (req, res) => {
  try {
    const classes = await TeacherResource.distinct("class");
    const subjects = await TeacherResource.distinct("subject");

    res.status(200).json({
      success: true,
      classes,
      subjects,
    });
  } catch (error) {
    console.error("Error fetching resource categories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID",
      });
    }

    const resource = await TeacherResource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    if (
      resource.fileUrl &&
      resource.fileUrl.includes("cloudinary.com") &&
      resource.publicId
    ) {
      try {
        await cloudinary.uploader.destroy(resource.publicId, {
          resource_type: resource.resourceType || "raw",
        });
      } catch (cloudinaryError) {
        console.warn("Error deleting from Cloudinary:", cloudinaryError);
      }
    }

    await TeacherResource.findByIdAndDelete(resourceId);

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getResourcesGrouped = async (req, res) => {
  try {
    const resources = await TeacherResource.aggregate([
      {
        $group: {
          _id: {
            class: "$class",
            subject: "$subject",
          },
          resources: {
            $push: {
              id: "$_id",
              title: "$title",
              description: "$description",
              fileUrl: "$fileUrl",
              fileType: "$fileType",
              createdAt: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.class": 1, "_id.subject": 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      groupedResources: resources,
    });
  } catch (error) {
    console.error("Error fetching grouped resources:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
