
import Prisma from "../config/prismaClient.js";
import { hashPassword } from "../utils/password.utils.js";

export class UserService {

    async createUser(userData) {
        return await Prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                password: userData.password
            }
        });
    }

    async getUserByEmail(email) {
        return await Prisma.user.findUnique({
            where: { email }
        });
    }

    async getUserByPhone(phone) {
        return await Prisma.user.findUnique({
            where: { phone }
        });
    }

    async generateHashPassword(password) {
        return await hashPassword(password);
    }

    async getUserProfileStatus(userId) {
        const user = await Prisma.user.findUnique({
            where: { id: userId },
            include: {
                bankDetails: true,
                addresses: true,
                documents: true,
            }
        });


        if (!user) {
            throw new Error('User not found');
        }

        const profileStatus = [];


        // the condition is like must have 
        // at least 1 bank detail
        // at least 2 addresses redintial and employment
        // at least 5 documents aadhar , pan , selfie , bankstatment, cibil score

        if (user.gender == null || user.dob == null || user.employmentType == null || user.companyName == null || user.netMonthlyIncome == null || user.nextIncomeDate == null) {
            const missingFields = [];
            if (user.gender == null) missingFields.push('gender');
            if (user.dob == null) missingFields.push('dob');
            if (user.employmentType == null) missingFields.push('employmentType');
            if (user.companyName == null) missingFields.push('companyName');
            if (user.netMonthlyIncome == null) missingFields.push('netMonthlyIncome');
            if (user.nextIncomeDate == null) missingFields.push('nextIncomeDate');

            profileStatus.push({ section: 'basicInfo', message: 'Complete your basic information' });
        }


        if (user.bankDetails.length === 0) {
            profileStatus.push({ section: 'bankDetails', message: 'Required at least one bank detail' });
        }

        if (user.addresses.length < 2) {
            const requiredAddresses = [
                { type: 'residential', message: 'Residential address not added' },
                { type: 'employment', message: 'Employment address not added' }
            ];

            // 1. Get a simple list of types the user actually has
            const existingAddressTypes = user.addresses.map(addr => addr.type);

            // 2. Identify what's missing and add it to the status
            requiredAddresses.forEach(req => {
                if (!existingAddressTypes.includes(req.type)) {
                    profileStatus.push({
                        section: req.type,
                        message: req.message
                    });
                }
            });
        }

        if (user.documents.filter(doc => doc.documentType == 'employmentAddressProof' || doc.documentType == 'residentialAddressProof').length < 5) {
            const requiredDocs = [
                { type: 'aadhar', message: 'Aadhar card not uploaded' },
                { type: 'pan', message: 'PAN card not uploaded' },
                { type: 'selfie', message: 'Selfie not uploaded' },
                { type: 'bankStatement', message: 'Bank statement not uploaded' },
                { type: 'cibilScore', message: 'CIBIL score not uploaded' }
            ];

            // 1. Get a simple list of document types the user actually has
            const uploadedTypes = user.documents.map(doc => doc.documentType);

            // 2. Filter the requirements to find what's MISSING
            const missingDocs = requiredDocs.filter(req => !uploadedTypes.includes(req.type));

            // 3. Add only the missing ones to your status
            missingDocs.forEach(missing => {
                profileStatus.push({ section: 'documents', message: missing.message });
            });
        }

        return {
            kycstatus: user.kycStatus,
            isVerified: user.isVerified,
            profileStatus
        };
    }

    async updateUser(userId, updateData) {
        return await Prisma.user.update({
            where: { id: userId },
            data: updateData
        });
    }


    async kycstatus(userId) {
        const user = await Prisma.user.findUnique({
            where: { id: userId },
            select: { kycStatus: true }
        });

        return user.kycStatus;
    }

    async updateKycStatus(userId, status) {
        return await Prisma.user.update({
            where: { id: userId },
            data: { kycStatus: status }
        });
    }


    async getUserDashboardStats(userId) {
        const loans = await Prisma.loan.findMany({
            where: {
                userId,
                status: { not: 'closed' }

            },
            select: {
                id: true,
                loanNumber: true,
                intrestRate: true,
                totalAmountPayable: true,
                status: true,
                startDate: true,
                endDate: true,
                remainingAmount: true,
                createdAt: true,
            }
        })

        const [contactList, location] = await Promise.all([
            Prisma.contactslist.count({
                where: { userId }
            }),
            Prisma.location.count({
                where: { userId }
            })
        ]);

        return {
            contactList: contactList,
            location: location,
            loans: loans
        };
    }

    async addcontactslist(userId, contactList) {
        try {
            const existingContactList = await Prisma.contactslist.findUnique({
                where: { userId }
            })

            if (existingContactList) {
                return await Prisma.contactslist.update({
                    where: { userId },
                    data: { contactList }
                });
            } else {
                return await Prisma.contactslist.create({
                    data: {
                        userId,
                        contactList
                    }
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    async updaloadLocation(userId, latitude, longitude) {
        const location = await Prisma.location.findUnique({
            where: { userId }
        })

        if (location) {
            return await Prisma.location.update({
                where: { userId },
                data: {
                    latitude,
                    longitude
                }
            });
        }
        return await Prisma.location.create({
            data: {
                userId,
                latitude,
                longitude
            }
        });
    }
}