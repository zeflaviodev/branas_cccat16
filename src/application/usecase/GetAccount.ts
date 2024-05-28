// use case
import { AccountRepository } from "../../infra/repository/AccountRepository";

export class GetAccount {

	constructor (readonly accountRepository: AccountRepository) {

	}

	async execute (input: any): Promise<any> {
		const account = await this.accountRepository.getAccountById(input.accountId);
		if(!account) throw new Error('Account not found');
		return account;
	}
}
