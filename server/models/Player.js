import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  id:       { type: Number, required: true, unique: true },
  name:     { type: String, required: true },
  roles:    [String],
  avatar:   String,
  agents:   [String],
  note:     String,
  photo:    String,
  password: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Player', playerSchema);
