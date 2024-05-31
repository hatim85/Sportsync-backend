import mongoose from "mongoose";
// Define a schema for the Address collection
const addressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who owns the address
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    isDefault: { type: Boolean, default: false } // Indicates if this address is the user's default address
});

// Create a model for the Address collection using the schema
const Address = mongoose.model('Address', addressSchema);
export default Address;
