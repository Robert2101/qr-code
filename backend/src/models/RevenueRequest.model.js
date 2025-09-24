import mongoose from "mongoose";
const Schema = mongoose.Schema;

const revenueRequestSchema = new Schema({
    recycler: {
        type: Schema.Types.ObjectId,
        ref: 'Recycler',
        required: true
    },
    collections: [{
        type: Schema.Types.ObjectId,
        ref: 'Collection'
    }],
    wastePrices: {
        wet: { type: Number, required: true },
        dry: { type: Number, required: true },
        hazardous: { type: Number, required: true }
    },
    totalCalculatedRevenue: {
        type: Number,
        required: true
    },
    finalDistribution: {
        totalUserShare: { type: Number },
        totalTransporterShare: { type: Number },
        municipalityShare: { type: Number },
        centralGovShare: { type: Number },
        recyclerShare: { type: Number },
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Declined'],
        default: 'Pending'
    }
}, { timestamps: true });

const RevenueRequest = mongoose.model('RevenueRequest', revenueRequestSchema);
export default RevenueRequest;
