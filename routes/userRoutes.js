const express = require("express");
const router = express.Router();
const { storage } = require("../config/firebase");
const User = require("../models/userModel");
const multer = require("multer");
const { ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const upload = multer();

module.exports = (io) => {
  router.post("/upload", upload.array("images"), async (req, res) => {
    try {
      const { name, socialMediaHandle } = req.body;
      const images = req.files;
      const uploadedImageUrls = [];

      for (const image of images) {
        try {
          const storageRef = ref(
            storage,
            `images/${Date.now()}-${name}-${image.originalname}`
          );

          // Attempt to upload the image
          await uploadBytes(storageRef, image.buffer);

          // Get the download URL after successful upload
          const imageUrl = await getDownloadURL(storageRef);
          uploadedImageUrls.push(imageUrl);
        } catch (uploadError) {
          console.error(`Error uploading image ${image.originalname}:`, uploadError);
          continue; // Continue to the next image
        }
      }

      // Create a new user with the uploaded image URLs
      const newUser = new User({
        name,
        socialMediaHandle,
        imageUrls: uploadedImageUrls,
      });

      try {
        // Attempt to save the new user to the database
        await newUser.save();
        console.log("User saved successfully");

        // Emit an event when a new user is added
        io.emit("userAdded", newUser); // Emit userAdded event with the new user data
      } catch (saveError) {
        console.error("Error saving user data:", saveError);
        return res.status(500).json({ message: "Error saving user data", error: saveError });
      }

      // If everything went well, send a success response
      res.status(201).json({ message: "User data and images uploaded successfully!" });
    } catch (error) {
      console.error("Error during user upload:", error);
      res.status(500).json({ message: "Error uploading images or saving data", error });
    }
  });

  return router;
};
