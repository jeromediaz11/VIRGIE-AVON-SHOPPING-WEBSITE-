import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
      timestamps: true,
    }
  );
  
  const Like = mongoose.model('Like', likeSchema);
  export default Like;