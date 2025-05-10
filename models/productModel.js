
// //Correctly and perfectly working code

const { model, Schema } = require('../Connection');

const reviewSchema = new Schema({
    user: { 
        type: String,  // Changed from ObjectId to String to match frontend
        required: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    comment: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const productSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    description: { type: String, required: false },
    material: { type: String, required: true },
    image: { type: String, required: true },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
    // artisanId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'users',
    //     required: true,
    //   },
    //   stock: {
    //     type: Number,
    //     required: true,
    //     default: 0,
    //   },

    

},{ timestamps: true });  

module.exports = model('Product', productSchema);


