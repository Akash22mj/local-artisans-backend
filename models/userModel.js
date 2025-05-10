// // // // Origiunal code

// const { model, Schema } = require('../Connection');

// const myschema = new Schema({
//     name: { type: String, required: true, trim: true },
//     email: { type: String, required: true, unique: true, trim: true },
//     password: { type: String, required: true },  // Ensure password is required
//     avatar: { type: String, default: "" }  // Set default avatar
// });

// module.exports = model('users', myschema);


// Admin panel

const { model, Schema } = require('../Connection');

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  
  // 🔑 Role Field: Admin, Artisan, Customer
  role: {
    type: String,
    enum: ["admin", "artisan", "customer"],
    default: "customer",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
   // 🔁 Forgot Password Support
   resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  }

}, { timestamps: true }); // add timestamps for tracking

module.exports = model('users', userSchema);




