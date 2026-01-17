import Prisma from "../config/prismaClient.js";
import razorpayInstance from "../config/razorpay.config.js";
import crypto from "crypto";

export class TransactionService {
    async createOrder(amount, currency = 'INR', receipt = `rcpt_${Date.now()}`) {
        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency,
            receipt,
        };
        try {
            const order = await razorpayInstance.orders.create(options);
            return order;
        } catch (error) {
            throw new Error('Error creating order with Razorpay');
        }
    }

    async createTranscation(transactionData) {

        //  Verify payment signature
        const { rpzOrderId, rpzPaymentId, rpzSignature } = transactionData;
        if(this.verifyPaymentSignature({rpzOrderId , rpzPaymentId, rpzSignature})){
            throw new Error('Invalid payment signature');
        }

        // create transaction in the database
        try {
            const newTransaction = await Prisma.transaction.create({
                data: {
                    loanId: transactionData.loanId,
                    userId: transactionData.userId,
                    amount: transactionData.amount,
                    transactionType: transactionData.transactionType,
                    rpzOrderId: transactionData.rpzOrderId,
                    rpzPaymentId: transactionData.rpzPaymentId,
                }
            });
            return newTransaction;
        } catch (error) {
            throw new Error('Error creating transaction in the database');
        }
    }

    async verifyPaymentSignature(paymentDetails) {    
        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(paymentDetails.rpzOrderId + '|' + paymentDetails.rpzPaymentId)
            .digest('hex');
        return generatedSignature === paymentDetails.rpzSignature;
    }

    async getTransactionByLoanId(loanId) {
        try {
            const transactions = await Prisma.transaction.findMany({
                where: { loanId }
            });
            return transactions;
        } catch (error) {
            throw new Error('Error fetching transactions from the database');
        }
    }

    async getTransactionByUserId(userId) {
        try {
            const transactions = await Prisma.transaction.findMany({
                where: { userId }
            });
            return transactions;
        } catch (error) {
            throw new Error('Error fetching transactions from the database');
        }
    }
}
