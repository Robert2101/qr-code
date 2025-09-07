import mongoose from "mongoose";
const Schema = mongoose.Schema;

const recyclingTransactionSchema = new Schema({
    recycler: {
        type: Schema.Types.ObjectId,
        ref: 'Recycler',
        required: true
    },
    totalWeight: {
        type: Number,
        required: true
    },
    totalRevenue: {
        type: Number,
        required: true
    },
    distribution: {
        usersAmount: { type: Number, required: true },
        municipalityAmount: { type: Number, required: true },
        centralGovAmount: { type: Number, required: true },
        recyclerAmount: { type: Number, required: true }
    },
    transactionDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default mongoose.model('RecyclingTransaction', recyclingTransactionSchema);