import { TransactionService } from "../services/transaction.service.js";
import { LoanService } from "../services/loan.service.js";
import { EventService } from "../services/event.service.js";
import { calculatePrecloserAmount } from "../utils/precloseramount.utils.js";
export class TransactionController {
    constructor() {
        this.transactionService = new TransactionService();
        this.loanService = new LoanService();
        this.eventService = new EventService();
    }

    createOrder = async (req, res) => {
        const { amount, currency, receipt } = req.body;
        if (!amount) {
            return res.status(400).json({ error: 'Amount is required to create an order' });
        }

        try {
            const order = await this.transactionService.createOrder(amount, currency, receipt);

            // activity log
            await this.eventService.createEvent(req.user.id, 'activity' , {
                title: 'Order Created',
                message: `A new order with amount ${amount} has been created on ${new Date().toLocaleString()}`
            });
            
            res.status(201).json(order);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    };

    createTransaction = async (req, res) => {
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


        if(!transactionData.transactionType.match(/^(repayment|disbursement|precloserrepayment)$/i)){
            errors.push({ field: "transactionType", message: "Transaction type must be either 'repayment', 'disbursement' or 'precloserrepayment'" });
            return res.status(400).json({ message: 'Validation errors', errors });
        }


        const loan = await this.loanService.getLoanById(parseInt(transactionData.loanId));
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        if(transactionData.amount > loan.remainingAmount) {
            return  res.status(400).json({ error: 'Amount exceeds remaining loan amount' });
        }


        // Precloser repayment is not applicable for flat interest type loans
        if(transactionData.transactionType.toLowerCase() === 'precloserrepayment' && loan.intrestType === 'flat'){
            return res.status(400).json({ error: 'Precloser repayment is not applicable for flat interest type loans' });
        }


        const currentDate = new Date();
        if(transactionData.transactionType.toLowerCase() === 'precloserrepayment' && currentDate > new Date(loan.endDate)){
            return res.status(400).json({ error: 'Precloser repayment is only allowed before the loan end date' });
        }






        try {
            const newTransaction = await this.transactionService.createTranscation(transactionData , loan.userId);

            if (!newTransaction) {
                return res.status(400).json({ error: 'Transaction creation failed due to invalid payment signature' });
            }

            let precCloserAmount = 0;
            if(transactionData.transactionType.toLowerCase() === 'precloserrepayment'){
                precCloserAmount = calculatePrecloserAmount(loan, process.env.PRECLOSER_CHARGES_PERCENTAGE || 1);
            }
            


            const payload = {
                paidAmount: newTransaction.amount + loan.paidAmount,
                remainingAmount: precCloserAmount > 0 && transactionData.amount === precCloserAmount ? 0 : loan.totalAmountPayable - (loan.paidAmount + newTransaction.amount)
            };

            if (payload.paidAmount === loan.totalAmountPayable || (precCloserAmount > 0 && transactionData.amount === precCloserAmount)) {
                payload.status = 'closed';
            }

            await this.loanService.userUpdateLoan(loan.id, payload);

            // activity log
            await this.eventService.createEvent(loan.userId, 'notification' , {
                title: 'Payment Successful',
                message: `Your payment of amount ${newTransaction.amount} for loan ID ${loan.loanNumber} has been successfully processed on ${new Date().toLocaleString()}.`
            });

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

    getOrderDeails = async (req, res) => {
        const orderId = req.params.orderId;
        try {
            const order = await this.transactionService.getOrderDetails(orderId);
            res.status(200).json({
                order : order,
                rzpKey : process.env.RAZORPAY_KEY_ID
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch order details' });
        }
    };
}