import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema({
  id:       { type: Number, required: true, unique: true },
  type:     { type: String, default: 'standard' },
  question: { type: String, required: true },
  options:  [String],
  votes:    [Number],
  voters:   [[String]],
}, { timestamps: true });

export default mongoose.model('Poll', pollSchema);
