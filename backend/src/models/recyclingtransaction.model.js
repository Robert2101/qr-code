import mongoose from "mongoose";
const Schema = mongoose.Schema;

const recyclingTransactionSchema = new Schema({
    recycler: {
        type: Schema.Types.ObjectId,
        ref: 'Recycler',
        required: true
    },
    transporter: {
        type: Schema.Types.ObjectId,
        ref: 'Transporter',
        required: true
    },
    // An array of all the individual collections included in this load
    collections: [{
        type: Schema.Types.ObjectId,
        ref: 'Collection'
    }],
    totalWeight: {
        type: Number,
        required: true
    },
    totalRevenue: { // The total monetary value of the load, entered by the recycler
        type: Number,
        required: true
    },

    distribution: {
        usersAmount: { type: Number, required: true },
        transporterAmount: { type: Number, required: true },
        municipalityAmount: { type: Number, required: true },
        centralGovAmount: { type: Number, required: true },
        recyclerAmount: { type: Number, required: true }
    },
    transactionDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('RecyclingTransaction', recyclingTransactionSchema);