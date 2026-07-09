const cloudinary = require("../config/cloudinary");
const pool = require("../config/db");
const streamifier = require("streamifier");

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image.",
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "taskflow-profile-pictures",
      },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            message: "Cloudinary upload failed.",
          });
        }

        await pool.query(
          "UPDATE users SET profile_image = $1 WHERE id = $2",
          [result.secure_url, req.user.id]
        );

        return res.status(200).json({
          message: "Profile picture updated successfully!",
          image: result.secure_url,
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  uploadProfileImage,
};