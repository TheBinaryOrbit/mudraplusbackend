import { UserService } from "../services/user.service.js";
import { DocumentService } from "../services/document.service.js";
import { upload } from "../config/multerConfig.js";
import { EventService } from "../services/event.service.js";

export class UserController {
    constructor() {
        this.userService = new UserService();
        this.documentService = new DocumentService();
        this.eventService = new EventService();
    }

    registerUser = async (req, res) => {
        try {
            const userData = req.body;

            // validation
            if (!userData.name || !userData.email || !userData.phone || !userData.password) {
                const errors = [];
                if (!userData.name) errors.push({ field: "name", message: "Name is required" });
                if (!userData.email) errors.push({ field: "email", message: "Email is required" });
                if (!userData.phone) errors.push({ field: "phone", message: "Phone is required" });
                if (!userData.password) errors.push({ field: "password", message: "Password is required" });
                return res.status(400).json({ message: 'All fields are required', errors });
            }


            const existingUser = await this.userService.getUserByEmail(userData.email);
            if (existingUser) {
                const errors = [];
                if (existingUser.email === userData.email) errors.push({ field: "email", message: "Email already in use" });
                if (existingUser.phone === userData.phone) errors.push({ field: "phone", message: "Phone already in use" });
                return res.status(409).json({ message: 'User already exists', errors });
            }

            // generate hashed password
            const hashedPassword = await this.userService.generateHashPassword(userData.password);
            userData.password = hashedPassword;

            const newUser = await this.userService.createUser(userData);
            // activity log
            await this.eventService.createEvent(newUser.id, 'notification', {
                title: 'User Registered',
                message: `A new user with email ${newUser.email} has registered on ${new Date().toLocaleString()}`
            });
            res.status(201).json(newUser);

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to register user', message: error.message });
        }
    }

    profileStatus = async (req, res) => {
        try {
            const user = req.user; // from auth middleware
            const { kycstatus, isVerified, profileStatus } = await this.userService.getUserProfileStatus(user.id);

            res.status(200).json({ isCompleted: profileStatus.length === 0, kycstatus, isVerified, profileStatus });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to fetch profile status', message: error.message });
        }

    }


    getProfile = async (req, res) => {
        try {
            const user = req.user;
            const userData = await this.userService.getUserByEmail(user.email);
            userData.password = undefined; // remove password from response
            userData.kycCompletedAt = undefined; // remove kycCompletedAt from response
            userData.updatedAt = undefined; // remove createdAt from response
            userData.isBlocked = undefined; // remove isBlocked from response
            res.status(200).json({ user: userData });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch profile', message: error.message });
        }
    }


    updateProfile = async (req, res) => {
        try {
            const user = req.user;
            const updateData = req.body;

            // validate 
            if (!updateData.name && !updateData.gender && !updateData.dob && !updateData.employmentType && !updateData.companyName && !updateData.netMonthlyIncome && !updateData.nextIncomeDate) {
                const errors = [];
                if (!updateData.name) errors.push({ field: "name", message: "Name is required" });
                if (!updateData.gender) errors.push({ field: "gender", message: "Gender is required" });
                if (!updateData.dob) errors.push({ field: "dob", message: "Date of Birth is required" });
                if (!updateData.employmentType) errors.push({ field: "employmentType", message: "Employment Type is required" });
                if (!updateData.companyName) errors.push({ field: "companyName", message: "Company Name is required" });
                if (!updateData.netMonthlyIncome) errors.push({ field: "netMonthlyIncome", message: "Net Monthly Income is required" });
                if (!updateData.nextIncomeDate) errors.push({ field: "nextIncomeDate", message: "Next Income Date is required" });
                return res.status(400).json({ message: 'At least one field is required to update', errors });
            }



            // creating payload so that only provided fields are updated
            const payload = {};
            if (updateData.name) payload.name = updateData.name;
            if (updateData.gender) payload.gender = updateData.gender;
            if (updateData.dob) payload.dob = updateData.dob;
            if (updateData.employmentType) payload.employmentType = updateData.employmentType;
            if (updateData.companyName) payload.companyName = updateData.companyName;
            if (updateData.netMonthlyIncome) payload.netMonthlyIncome = updateData.netMonthlyIncome;
            if (updateData.nextIncomeDate) payload.nextIncomeDate = updateData.nextIncomeDate;


            const updatedUser = await this.userService.updateUser(user.id, payload);

            // activity log
            await this.eventService.createEvent(user.id, 'activity', {
                title: 'Profile Updated',
                message: `successfully updated your profile on ${new Date().toLocaleString()}`
            });
            res.status(200).json({ user: updatedUser });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update profile', message: error.message });
        }
    }


    uploadDocument = async (req, res) => {
        try {
            const user = req.user;
            const documentData = req.body;
            const { doctype } = req.params;


            if (!doctype || doctype.trim() === "") {
                return res.status(400).json({
                    message: "Document type is required",
                    errors: [{ field: "documentType", message: "Document type cannot be empty" }],
                });
            }

            console.log("Document type: ", doctype);

            upload.single(doctype)(req, res, async (err) => {
                try {
                    if (err) {
                        console.log("Error uploading document: ", err);
                        return res.status(500).json({
                            error: "Failed to upload document",
                            message: err.message,
                        });
                    }

                    const file = req.file;

                    if (!file) {
                        return res.status(400).json({
                            error: "No file uploaded",
                        });
                    }


                    const documentRecord =
                        await this.documentService.uploadDocument(
                            user.id,
                            doctype,
                            file.filename
                        );

                    /// activity log
                    await this.eventService.createEvent(user.id, 'activity', {
                        title: 'Document Uploaded',
                        message: `${doctype} uploaded on ${new Date().toLocaleString()}`
                    });

                    return res.status(201).json({
                        message: "Document uploaded successfully",
                        data: documentRecord,
                    });
                } catch (innerError) {
                    return res.status(500).json({
                        error: "Something went wrong while saving document",
                        message: innerError.message,
                    });
                }
            });
        } catch (error) {
            console.log("Error uploading document: ", error);
            return res.status(500).json({
                error: "Unexpected server error",
                message: error.message,
            });
        }
    };


    getDocuments = async (req, res) => {
        try {
            const user = req.user;
            const kycstatus = await this.userService.kycstatus(user.id);
            let documents = await this.documentService.getDocumentByUserId(user.id);
            documents = documents.filter(doc => doc.documentType != 'employmentAddressProof' && doc.documentType != 'residentialAddressProof');
            res.status(200).json({ documents, kycstatus });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch documents', message: error.message });
        }
    }


    updateDocument = async (req, res) => {
        try {
            const user = req.user;
            const { doctype } = req.params;

            if (!doctype || doctype.trim() === "") {
                return res.status(400).json({
                    message: "Document type is required",
                    errors: [{ field: "documentType", message: "Document type cannot be empty" }],
                });
            }

            upload.single(doctype)(req, res, async (err) => {
                try {
                    if (err) {
                        return res.status(500).json({
                            error: "Failed to upload document",
                            message: err.message,
                        });
                    }

                    const file = req.file;

                    if (!file) {
                        return res.status(400).json({
                            error: "No file uploaded",
                        });
                    }


                    const documentRecord =
                        await this.documentService.updateDocument(
                            user.id,
                            doctype,
                            file.filename
                        );

                        /// activity log
                    await this.eventService.createEvent(user.id, 'activity', {
                        title: 'Document Updated',
                        message: `${doctype} updated on ${new Date().toLocaleString()}`
                    });

                    return res.status(201).json({
                        message: "Document updated successfully",
                        data: documentRecord,
                    });
                } catch (innerError) {
                    return res.status(500).json({
                        error: "Something went wrong while saving document",
                        message: innerError.message,
                    });
                }
            });
        } catch (error) {
            console.log("Error updating document: ", error);
            return res.status(500).json({
                error: "Unexpected server error",
                message: error.message,
            });
        }
    };


    submitkyc = async (req, res) => {
        try {
            const user = req.user;
            const updatedUser = await this.userService.updateKycStatus(user.id, 'submitted');

            // activity log
            await this.eventService.createEvent(user.id, 'notification', {
                title: 'KYC Submitted',
                message: `You have successfully submitted your KYC on ${new Date().toLocaleString()}`
            });

            res.status(200).json({ user: updatedUser });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update KYC status', message: error.message });
        }
    }


    getDashboardStats = async (req, res) => {
        try {
            const user = req.user;
            const { loans, contactList, location } = await this.userService.getUserDashboardStats(user.id);
            const totalborrowedAmount = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
            res.status(200).json({ totalborrowedAmount, contactList, location, stats: loans, });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Failed to fetch dashboard stats', message: error.message });
        }
    }

    contactList = async (req, res) => {
        try {
            const user = req.user;
            const { contacts } = req.body;

            console.log("Received contactsList: ", contacts);
            console.log("Received contactsList: ", contacts.length);
            // check  json contactsList is provided
            if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
                return res.status(400).json({ message: 'Contacts list is required and should be a non-empty array' });
            }
            const updatedContactList = await this.userService.addcontactslist(user.id, contacts);

            // activity log
            await this.eventService.createEvent(user.id, 'activity', {
                title: 'Contact List Updated',
                message: `Contact list successfully updated on ${new Date().toLocaleString()}`
            });

            res.status(200).json({ contactList: updatedContactList });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update contact list', message: error.message });
        }
    }

    location = async (req, res) => {
        try {
            const user = req.user;
            const { latitude, longitude } = req.body;
            console.log("Received location: ", req.body);
            const updatedLocation = await this.userService.updaloadLocation(user.id, latitude, longitude);

            res.status(200).json({ location: updatedLocation });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update location', message: error.message });
        }
    }

}

