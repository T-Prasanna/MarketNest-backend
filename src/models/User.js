const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: {
      values: ['brand', 'customer'],
      message: 'Role must be either brand or customer'
    },
    required: [true, 'Role is required']
  },
  brandName: {
    type: String,
    required: function() { return this.role === 'brand'; },
    validate: {
      validator: function(v) {
        return this.role !== 'brand' || (v && v.trim().length > 0);
      },
      message: 'Brand name is required for brand accounts'
    }
  },
  refreshToken: String
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) return next();
    
    console.log('Hashing password for user:', this.email);
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);
