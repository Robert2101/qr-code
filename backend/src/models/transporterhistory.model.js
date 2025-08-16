const transporterHistorySchema = new Schema({
    transporter: {
        type: Schema.Types.ObjectId,
        ref: "Transporter",
        required: true,
        index: true
    },

    date: {
        type: Date,
        default: () => new Date().setHours(0, 0, 0, 0), // store per day
        index: true
    },

    checkpoints: [
        {
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
            },
            scannedAt: { type: Date, default: Date.now } // timestamp of scan
        }
    ]
}, { timestamps: true });

export default mongoose.model("TransporterHistory", transporterHistorySchema);
