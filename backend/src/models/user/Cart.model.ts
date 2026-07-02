// backend/src/models/user/Cart.model.ts
import { userMongoose, userDb } from '../../config/db.js';

const cartSchema = new userMongoose.Schema({
  user: {
    type: userMongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [{
    product: {
      type: userMongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  }],
}, {
  timestamps: true,
});

export default userDb.model('Cart', cartSchema);
