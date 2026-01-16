import Prisma from "../config/prismaClient.js";
import path from "path";
import { deleteFile } from "../utils/deletefile.utils.js";

export class DocumentService {
    async uploadDocument(userId, documentType , documentUrl) {

        if(!documentType.match(/^(aadhar|pan|selfie|bankStatement|cibilScore|residentialAddressProof|employmentAddressProof)$/)){
            throw new Error('Invalid document type documentType must be one of aadhar, pan, selfie, bankStatement, cibilScore, residentialAddressProof, employmentAddressProof');
        }

        // Add prefix to document URL based on type
        const documentUrlWithPrefix = `uploads/${documentType}/${documentUrl}`;

        const document = await Prisma.document.create({
            data: {
                userId,
                documentType,
                documentUrl: documentUrlWithPrefix
            }
        });

        return document;
    }


    async getDocumentsByUserIdAndFileType(userId, documentType) {
        return await Prisma.document.findMany({
            where: {
                userId,
                documentType
            }
        });
    }

    async updateDocument(userId, documentType , documentUrl ) {

        if(!documentType.match(/^(aadhar|pan|selfie|bankStatement|cibilScore|residentialAddressProof|employmentAddressProof)$/)){
            throw new Error('Invalid document type documentType must be one of aadhar, pan, selfie, bankStatement, cibilScore, residentialAddressProof, employmentAddressProof');
        }


        const previousDocument = await this.getDocumentsByUserIdAndFileType(userId, documentType);
        

        if (!previousDocument || previousDocument.length === 0) {
            throw new Error('No existing document found to update');
        }

        

        const fileToDelete = path.join(previousDocument[0].documentUrl);
        const fullPath = path.join(process.cwd(), fileToDelete);

        console.log("File to delete: ", fullPath);

        await deleteFile(fullPath);
    

        // Add prefix to document URL based on type
        const documentUrlWithPrefix = `uploads/${documentType}/${documentUrl}`;

        const document = await Prisma.document.update({
            where : {
                id : previousDocument[0].id,
                userId : userId,
                documentType : documentType
            },
            data: {
                documentUrl: documentUrlWithPrefix
            }
        });

        return document;
    }


    async getDocumentByUserId(userId) {
        return await Prisma.document.findMany({
            where: {
                userId
            }
        });
    }
}