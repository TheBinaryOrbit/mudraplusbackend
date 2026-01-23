
import Prisma from "../config/prismaClient.js";
import { hashPassword } from "../utils/password.utils.js";
import getUserDetailsWRTFilter from "../utils/filter.utils.js";
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
            where: { email },
            include: {
                referencesContacts: {
                    select: {
                        id: true,
                        name: true,
                        relation: true,
                        phone: true,
                    }
                }
            }
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
                { type: 'documents', message: 'Aadhar card , Pan card , Selfie, Bank statement are required' },
                { type: 'CIBIL Score', message: 'Update your latest CIBIL score' },
            ];

            // 1. Get a simple list of document types the user actually has

            const uploadedTypes = user.documents.map(doc => doc.documentType);

            if (!uploadedTypes.includes('cibilScore')) { profileStatus.push({ section: "Cibil Score", message: 'Update your latest CIBIL score' }); }
            if (!uploadedTypes.includes('aadhar') || !uploadedTypes.includes('pan') || !uploadedTypes.includes('selfie') || !uploadedTypes.includes('bankStatement')) profileStatus.push({ section: "documents", message: 'Aadhar card , Pan card , Selfie, Bank statement are required'});
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

        const data = {
            kycStatus: status
        }

        if (status === 'verified') {
            data.isVerified = true;
            const date = new Date();
            date.setMonth(date.getMonth() + 3);
            data.kycExpireAt = date;
        }

        return await Prisma.user.update({
            where: { id: userId },
            data: data
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
            },
            orderBy : {
                createdAt : 'desc'
            }
        })

        const [contactList, location] = await Promise.all([
            Prisma.contactslist.findFirst({
                where: { userId }
            }),
            Prisma.location.count({
                where: { userId }
            })
        ]);

        return {
            contactList: contactList?.contactList?.length || 0,
            location: location,
            loans: loans
        };
    }

    async addcontactslist(userId, contactList) {
        try {
            const existingContactList = await Prisma.contactslist.findUnique({
                where: { userId }
            })

            console.log("Updating contact list for userId:", userId);



            if (existingContactList) {
                return await Prisma.contactslist.update({
                    where: { userId },
                    data: {
                        contactList: [...existingContactList.contactList, ...contactList]
                    }
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


    // admin user list
    async getAllUsers(where, page, limit) {
        try {
            const users = await Prisma.user.findMany({
                where: {
                    ...where,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                    employmentType: true,
                    companyName: true,
                    createdAt: true,
                    isVerified: true,
                    kycStatus: true,
                    isBlocked: true,
                    _count : {
                        select : {
                            agentUsers : true
                        }
                    }
                },
                skip: page && limit ? (parseInt(page) - 1) * parseInt(limit) : undefined,
                take: limit ? parseInt(limit) : undefined,
            });
            return users;
        } catch (error) {
            console.error(error);
            throw new Error('Error fetching users from the database');
        }
    }

    // agent 
    async getUsersByAgentId(where, page, limit) {
        return await Prisma.agentUser.findMany({
            where: {
                ...where,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                        employmentType: true,
                        companyName: true,
                        createdAt: true,
                        isVerified: true,
                        kycStatus: true,
                    },
                }
            },
            skip: page && limit ? (parseInt(page) - 1) * parseInt(limit) : undefined,
            take: limit ? parseInt(limit) : undefined,
        });
    }




    async blockUser(userId) {
        try {
            await Prisma.user.update({
                where: { id: userId },
                data: { isBlocked: true }
            });
            return { message: 'User blocked successfully' };
        } catch (error) {
            throw new Error('Error blocking user in the database');
        }
    }

    async restoreUser(userId) {
        try {
            await Prisma.user.update({
                where: { id: userId },
                data: { isBlocked: false }
            });
            return { message: 'User restored successfully' };
        } catch (error) {
            throw new Error('Error restoring user in the database');
        }
    }


    async getUserById(userId) {
        try {
            const user = await Prisma.user.findUnique({
                where: { id: userId }
            });
            return user;
        } catch (error) {
            throw new Error('Error fetching user from the database');
        }
    }

    async getSpecficUser(userId, field) {
        const include = getUserDetailsWRTFilter(field);
        try {
            const user = await Prisma.user.findUnique({
                where: { id: userId },
                include: include
            });
            return user;
        } catch (error) {
            console.error(error);
            throw new Error('Error fetching user from the database');
        }
    }
}