import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayPayoutService {
    private razorpay: any;

    constructor(private configService: ConfigService) {
        this.razorpay = new Razorpay({
            key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
            key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
        });
    }

    async createPayout(
        accountNumber: string,
        fundAccountId: string,
        amount: number,
        currency: string = 'INR',
        mode: string = 'IMPS',
        purpose: string = 'payout',
        queueIfLowBalance: boolean = true,
        referenceId?: string,
    ): Promise<any> {
        try {
            const payoutRequest = {
                account_number: this.configService.get<string>('RAZORPAY_ACCOUNT_NUMBER'),
                fund_account_id: fundAccountId,
                amount: amount * 100, // Amount in paise
                currency,
                mode,
                purpose,
                queue_if_low_balance: queueIfLowBalance,
                reference_id: referenceId,
            };

            const payout = await this.razorpay.payouts.create(payoutRequest);
            return payout;
        } catch (error) {
            console.error('Razorpay Payout Error:', error);
            throw new InternalServerErrorException('Failed to create payout');
        }
    }

    async createContact(
        name: string,
        email: string,
        contact: string,
        type: string = 'vendor',
    ): Promise<any> {
        try {
            return await this.razorpay.contacts.create({
                name,
                email,
                contact,
                type,
            });
        } catch (error) {
            console.error('Razorpay Contact Error:', error);
            throw new InternalServerErrorException('Failed to create contact');
        }
    }

    async createFundAccount(
        contactId: string,
        accountType: string = 'bank_account',
        bankAccountDetails: any,
    ): Promise<any> {
        try {
            return await this.razorpay.fund_accounts.create({
                contact_id: contactId,
                account_type: accountType,
                bank_account: bankAccountDetails,
            });
        } catch (error) {
            console.error('Razorpay Fund Account Error:', error);
            throw new InternalServerErrorException('Failed to create fund account');
        }
    }
}
