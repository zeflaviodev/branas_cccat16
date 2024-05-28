//framework and driver
import Account from "../../domain/Account";
import DatabaseConnection from "../database/DatabaseConnection";
//Port
export interface AccountRepository {
	getAccountByEmail (email: string): Promise<Account | undefined>
	getAccountById (accountId: string): Promise<Account>
	createAccount (account: Account): Promise<void> 
}
//Adapter
export class AccountRepositoryDatabase implements AccountRepository {
	constructor (readonly connection: DatabaseConnection) {
	
	}
	async getAccountByEmail(email: string) {
		try {
			const [accountData] = await this.connection.query("select * from cccat16.account where email = $1", [email]);
			if(!accountData) return;
			return Account.restore(
				accountData.account_id,
				accountData.name,
				accountData.email,
				accountData.cpf,
				accountData.car_plate,
				accountData.is_passenger,
				accountData.is_driver
			);
		}catch(error: any){
			throw new Error('Error while fetching the account:: ' + error.message);
		}
	}
	
	async getAccountById(accountId: string) {
		try {
			const [accountData] = await this.connection.query("select * from cccat16.account where account_id = $1", [accountId]);
			return Account.restore(
				accountData.account_id,
				accountData.name,
				accountData.email,
				accountData.cpf,
				accountData.car_plate,
				accountData.is_passenger,
				accountData.is_driver
			);
		}catch(error: any){
			throw new Error('Error while fetching the account:: ' + error.message);
		}
	}
	
	async createAccount(account: Account): Promise<void> {
		try {
			await this.connection.query("insert into cccat16.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)", [account.accountId, account.name, account.email, account.cpf, account.carPlate, !!account.isPassenger, !!account.isDriver]);	
		} catch(error: any){
			throw new Error('Error while creating a new account: ' + error.message);
		}
	}
}
//Adapter
export class AccountRepositoryMemory implements AccountRepository {
	accounts: any[]
	
	constructor() {
		this.accounts = []
	}

	async getAccountByEmail(email: string): Promise<Account>  {
		const account = this.accounts.find((account: any) => account.email === email);
		return account
	}

	async getAccountById(accountId: string): Promise<Account> {
		const account = this.accounts.find((account: any) => account.accountId === accountId);
		return account
	}

	async createAccount(account: Account): Promise<void> {
		this.accounts.push(account);
	}
}