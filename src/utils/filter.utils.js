const getUserDetailsWRTFilter = (field) => {
    const include = {};

    switch (field) {
        case 'bankDetails':
            include.bankDetails = {
                where: {
                    isdeleted: false
                },
                select: {
                    id: true,
                    bankName: true,
                    accountNumber: true,
                    ifscCode: true,
                    accountHolderName: true,
                }
            }
            break;
        case 'addresses':
            include.addresses = true;
            break;
        case 'documents':
            include.documents = true;
            break;
        case 'loans':
            include.loans = {
                select: {
                    id: true,
                    loanNumber: true,
                    requestedAmount: true,
                    requestedTenure: true,
                    principalAmount: true,
                    tenure: true,
                    totalIntrest: true,
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
            }
            break;
        case 'activity':
            include.location = true;
            include.events = {
                select: {
                    id: true,
                    eventType: true,
                    title: true,
                    message: true,
                    createdAt: true,
                },
                orderBy  : {
                    createdAt : 'desc'
                }
            }
            break;
        case 'transactions':
            include.transactions = {
                select: {
                    id: true,
                    amount: true,
                    transactionType: true,
                    rpzOrderId: true,
                    rpzPaymentId: true,
                    createdAt: true,
                    loan: {
                        select: {
                            id: true,
                            loanNumber: true
                        }
                    }
                }
            }
            break;
        case 'agents':
            include.agentUsers = {
                select: {
                    id: true,
                    agent: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        }
                    }
                }
            }
            break;
        case 'followUps':
            include.followUps = {
                orderBy : {
                    createdAt : 'desc'
                }
            };
            break;
        case 'contactslist' : 
            include.contactslist = true;
            break;
        default:
            include.password = false;
            break;
    }

    return include;
}

export default getUserDetailsWRTFilter;