import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  id:         { type: Number, required: true, unique: true },
  opponent:   { type: String, required: true },
  date:       { type: String, required: true },
  map:        String,
  tournament: String,
  type:       { type: String, enum: ['official', 'training'], default: 'official' },
}, { timestamps: true });

export default mongoose.model('Match', matchSchema);
