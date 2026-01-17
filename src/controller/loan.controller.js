import { LoanService } from "../services/loan.service.js";

export class LoanController {
    constructor() {
        this.loanService = new LoanService();
    }

    createLoan = async (req, res) => {
        const user = req.user;
        const loanData = req.body

        if (!loanData.bankId || !loanData.requestedAmount || !loanData.requestedTenure) {
            const errors = [];
            if (!loanData.bankId) errors.push({ field: "bankId", message: "Bank ID is required" });
            if (!loanData.requestedAmount) errors.push({ field: "requestedAmount", message: "Requested amount is required" });
            if (!loanData.requestedTenure) errors.push({ field: "requestedTenure", message: "Requested tenure is required" });
            return res.status(400).json({ message: 'Validation errors', errors });
        }

        try {
            const newLoan = await this.loanService.createLoan(user.id, loanData);
            res.status(201).json({
                message: 'Loan created successfully',
                loan: newLoan
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create loan' });
        }
    };



    // admin methods to review and update the loan ammount and tenure can be added here
    reviewLoan = async (req, res) => {
        try {
            const loanId = req.params.id;
            const loanData = req.body;

            const errors = [];

            if (!loanData.principalAmount || !loanData.tenure || !loanData.intrestType || !loanData.intrestRate || !loanData.totalIntrest || !loanData.totalAmountPayable) {
                ``
                if (!loanData.principalAmount) errors.push({ field: "principalAmount", message: "Principal amount is required" });
                if (!loanData.tenure) errors.push({ field: "tenure", message: "Tenure is required" });
                if (!loanData.intrestType) errors.push({ field: "intrestType", message: "Intrest type is required" });
                if (!loanData.intrestRate) errors.push({ field: "intrestRate", message: "Intrest rate is required" });
                if (!loanData.totalIntrest) errors.push({ field: "totalIntrest", message: "Total intrest is required" });
                if (!loanData.totalAmountPayable) errors.push({ field: "totalAmountPayable", message: "Total amount payable is required" });
                return res.status(400).json({ message: 'Validation errors', errors });
            }

            if (loanData.intrestType.match(/^flat|daily^/)) {
                errors.push({ field: "intrestType", message: "Intrest type must be either 'flat' or 'daily'" });
                return res.status(400).json({ message: 'Validation errors', errors });
            }

            const payload = {
                principalAmount: loanData.principalAmount,
                tenure: loanData.tenure,
                intrestType: loanData.intrestType,
                intrestRate: loanData.intrestRate,
                totalIntrest: loanData.totalIntrest,
                totalAmountPayable: loanData.totalAmountPayable,
                status: 'approved'
            }

            const updatedLoan = await this.loanService.adminUpdateLoan(loanId, payload);
            res.status(200).json({
                message: 'Loan reviewed successfully',
                loan: updatedLoan
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to review loan' });
        }
    }

    appliedLoan = async (req, res) => {
        try {
            const user = req.user;
            const loanId = req.params.id;
            
            const payload = {
                status: 'applied',
            }
            const updatedLoan = await this.loanService.userUpdateLoan(loanId, payload, user.id);
            res.status(200).json({
                message: 'Loan requested successfully',
                loan: updatedLoan
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to request loan' });
        }
    }

    approveLoan = async (req, res) => {
        try {
            const loanId = req.params.id;

            const date = new Date();
            const loan = await this.loanService.getLoanById(loanId);


            const payload = {
                status: 'active',
                startDate: date,
                endDate: new Date(date.getTime() + (loan.tenure * 24 * 60 * 60 * 1000)), // adding tenure days to start date,
                paidAmount: 0,
                remainingAmount: loan.totalAmountPayable,
            }
            const updatedLoan = await this.loanService.adminUpdateLoan(loanId, payload);
            res.status(200).json({
                message: 'Loan approved successfully',
                loan: updatedLoan
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to approve loan' });
        }
    }


    changesLoanStatus = async (req, res) => {
        try {
            const loanId = req.params.id;
            const { status } = req.body;

            const payload = {
                status: status,
            }
            const updatedLoan = await this.loanService.adminUpdateLoan(loanId, payload);
            res.status(200).json({
                message: 'Loan status updated successfully',
                loan: updatedLoan
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update loan status' });
        }
    }

    getLoanById = async (req, res) => {
        try {
            const user = req.user;
            const loanId = req.params.id;

            const loan = await this.loanService.getLoanById(loanId);

            if (!loan) {
                return res.status(404).json({ error: 'Loan not found' });
            }
            res.status(200).json({
                loan: loan
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch loan' });
        }
    }


    getLoansByUserId = async (req, res) => {
        try {
            const user = req.user;
            const loans = await this.loanService.getLoansByUserId(user.id);
            res.status(200).json({
                loans: loans
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch loans' });
        }
    }
}
