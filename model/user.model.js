const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
      validate(value) {
        if (!validator.isMobilePhone(value, "any", { strictMode: false })) {
          throw new Error("Invalid phone number");
        }
      },
    },
    password: {
      type: String,
      // required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      default: "user",
    },
    image: {
      type: String,
    },
    fcmToken: {
      type: String,
    },
    otp: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneNumberVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    zip: {
      type: String,
    },
    state: {
      type: String,
    },
    countryCode: {
      type: String,
    },

    age: {
      type: Number,
      min: [1, "Age must be a positive number"],
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
