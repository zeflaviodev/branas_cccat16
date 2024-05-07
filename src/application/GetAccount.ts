import { AccountDAO } from "../resource/AccountDAO";

export class GetAccount {

	constructor (readonly accountDAO: AccountDAO) {

	}

	async execute (input: any): Promise<any> {
		const account = await this.accountDAO.getAccountById(input.accountId);
		if(!account) throw new Error('Account not found');
		return account;
	}
}
