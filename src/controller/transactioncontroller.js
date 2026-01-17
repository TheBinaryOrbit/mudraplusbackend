import { TransactionService } from "../services/transaction.service.js";
import { LoanService } from "../services/loan.service.js";

export class TransactionController {
    constructor() {
        this.transactionService = new TransactionService();
        this.loanService = new LoanService();
    }

    createOrder = async (req, res) => {
        const { amount, currency, receipt } = req.body;
        if (!amount) {
            return res.status(400).json({ error: 'Amount is required to create an order' });
        }

        try {
            const order = await this.transactionService.createOrder(amount, currency, receipt);
            res.status(201).json(order);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    };

    createTransaction = async (req, res) => {
        const user = req.user;
        const transactionData = req.body;

        const errors = [];
        if (!transactionData.loanId || !transactionData.amount || !transactionData.transactionType || !transactionData.rpzOrderId || !transactionData.rpzPaymentId || !transactionData.rpzSignature) {
            if (!transactionData.loanId) errors.push({ field: "loanId", message: "Loan ID is required" });
            if (!transactionData.amount) errors.push({ field: "amount", message: "Amount is required" });
            if (!transactionData.transactionType) errors.push({ field: "transactionType", message: "Transaction type is required" });
            if (!transactionData.rpzOrderId) errors.push({ field: "rpzOrderId", message: "Razorpay Order ID is required" });
            if (!transactionData.rpzPaymentId) errors.push({ field: "rpzPaymentId", message: "Razorpay Payment ID is required" });
            if (!transactionData.rpzSignature) errors.push({ field: "rpzSignature", message: "Razorpay Signature is required" });
            return res.status(400).json({ message: 'Validation errors', errors });
        }


        if(!transactionData.transactionType.match(/^(repayment|disbursement)$/i)){
            errors.push({ field: "transactionType", message: "Transaction type must be either 'repayment' or 'disbursement'" });
            return res.status(400).json({ message: 'Validation errors', errors });
        }


        const loan = await this.loanService.getLoanById(transactionData.loanId);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        try {
            const newTransaction = await this.transactionService.createTranscation(transactionData , user.id);

            if (!newTransaction) {
                return res.status(400).json({ error: 'Transaction creation failed due to invalid payment signature' });
            }

            // logic to update loan status or paid amount can be added here

            const payload = {
                paidAmount: newTransaction.amount + loan.paidAmount,
                remainingAmount: loan.totalAmountPayable - (loan.paidAmount + newTransaction.amount)
            };

            if (payload.paidAmount === loan.totalAmountPayable) {
                payload.status = 'closed';
            }

            await this.loanService.userUpdateLoan(loan.id, payload);

            res.status(201).json({
                message: 'Transaction created successfully',
                transaction: newTransaction
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }

    }

    getTrascationsByLoanId = async (req, res) => {
        const loanId = req.params.loanId;
        try {
            const transactions = await this.transactionService.getTransactionByLoanId(loanId);
            res.status(200).json(transactions);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch transactions' });
        }
    };

    getTrascationsByUserId = async (req, res) => {
        const user = req.user;
        try {
            const transactions = await this.transactionService.getTransactionByUserId(user.id);
            transactions.map((tnx) => {
                tnx.rpzOrderId = undefined;
                tnx.rpzRefundPaymentId = undefined;
                tnx.rpzPaymentId = undefined;
                tnx.updatedAt = undefined;
            })
            res.status(200).json(transactions);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch transactions' });
        }
    };


}