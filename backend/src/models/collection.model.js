import mongoose from "mongoose";
const Schema = mongoose.Schema;


const collectionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Index for faster lookups of a user's history
    },
    transporter: {
        type: Schema.Types.ObjectId,
        ref: 'Transporter',
        required: true,
        index: true // Index for finding all collections by a transporter
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    recycler: {
        type: Schema.Types.ObjectId,
        ref: 'Recycler',
        index: true
    },
    
    wasteTypes: {
        wet: { type: Number, default: 0 },
        dry: { type: Number, default: 0 },
        hazardous: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['Collected', 'Completed'],
        default: 'Collected'
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
}, {
    timestamps: true
});

const Collection = mongoose.model('Collection', collectionSchema);
export default Collection;
