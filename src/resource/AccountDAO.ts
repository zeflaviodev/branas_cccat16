import pgp from "pg-promise";
//Port
export interface AccountDAO {
	getAccountByEmail (email: string): Promise<any>
	getAccountById (accountId: string): Promise<any>
	createAccount (request: any): Promise<any> 
}
//Adapter
export class AccountDAODatabase implements AccountDAO {

	async getAccountByEmail(email: string): Promise<any>{
		try {
			const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
			const [acc] = await connection.query("select * from cccat16.account where email = $1", [email]);
			await connection.$pool.end();
			return acc;
		}catch(error: any){
			throw new Error('Error while fetching the account:: ' + error.message);
		}
	}
	
	async getAccountById(accountId: string): Promise<any> {
		try {
			const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
			const [acc] = await connection.query("select * from cccat16.account where account_id = $1", [accountId]);
			await connection.$pool.end();
			return acc;
		}catch(error: any){
			throw new Error('Error while fetching the account:: ' + error.message);
		}
	}
	
	async createAccount(request: any): Promise<any> {
		try {
			const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
			await connection.query("insert into cccat16.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)", [request.accountId, request.name, request.email, request.cpf, request.carPlate, !!request.isPassenger, !!request.isDriver]);	
			await connection.$pool.end();
		} catch(error: any){
			throw new Error('Error while creating a new account: ' + error.message);
		}
	}
}
//Adapter
export class AccountDAOMemory implements AccountDAO {
	accounts: any[]
	
	constructor() {
		this.accounts = []
	}

	async getAccountByEmail(email: string): Promise<any>  {
		const account = this.accounts.find((account: any) => account.email === email);
		return account
	}

	async getAccountById(accountId: string): Promise<any> {
		const account = this.accounts.find((account: any) => account.accountId === accountId);
		return account
	}

	async createAccount(account: any): Promise<void> {
		this.accounts.push(account);
	}
}