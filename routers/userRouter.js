const express = require("express");
const router = express.Router();
const Users = require("../models/userModel");
const Messagebird = require("messagebird");
const messagebird = Messagebird("YOUR_API_KEY");

router.post("/send_otp", async (req, res) => {
  // user will send phone number from frontend
  const { phone } = req.body;
  const formatedPhone = "+91" + phone;

  try {
    // Now we will check user is exist in DB or not ?
    const phoneExist = await Users.findOne({ phone: phone });
    if (phoneExist === null) {
      return res.status(404).send("User not Resiter!");
    }

    // Now finally Send OTP to user
    var params = {
      template: "Your Login OTP is: %token",
      timeout: 600000, // otp is valid for 10 min
    };

    messagebird.verify.create(formatedPhone, params, (err, response) => {
      if (err) {
        console.log(`Error while OTP Sending: ${err}`);
        return res.status(500).send({
          status: "Failed",
          message: `Error while sending OTP: ${err}`,
        });
      }
      return res.status(200).send({
        status: "Send",
        message: "OTP send Successfully !",
        id: response.id, // id is sending to frontend for further validation of otp, we will store id to session storage
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/verify_otp", async (req, res) => {
  const { id, otp } = req.body; // take the otp and otp_id from the frontend

  try {
    messagebird.verify.verify(id, otp, (err, response) => {
      if (err) {
        console.log(`OTP verification Error: ${err}`);
        return res
          .status(400)
          .send({ status: "Failed", message: "Invalid OTP" });
      }
      console.log("Login Sucessfully !");
      return res
        .status(200)
        .send({ status: "success", message: "Login Successfully !", response });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Check if email already exists
  try {
    const existingUser = await Users.findOne({ phone: phone });
    if (existingUser) {
      return res.status(409).json({ message: "User Already Exists!" });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }

  // Hash the password before saving it
  const newUser = new Users({ name, email, phone, password });

  try {
    // Save the user with the hashed password
    await newUser.save();
    return res.status(200).json(newUser);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
