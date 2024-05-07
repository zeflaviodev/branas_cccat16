import crypto from "crypto";
import { validateCpf } from "./validateCpf";
import { AccountDAO } from "../resource/AccountDAO";
import { MailerGateway } from "../resource/MailerGateway";

function validateName(name: string): boolean {
    return /[a-zA-Z] [a-zA-Z]+/.test(name);
}

function validateEmail(email: string): boolean {
    return /^(.+)@(.+)$/.test(email);
}

function validateCarPlate(car_plate: string): boolean {
    return /[A-Z]{3}[0-9]{4}/.test(car_plate);
}

export class Signup {

	constructor (readonly accountDAO: AccountDAO, readonly mailerGateway: MailerGateway) {

	}

	async execute (input: any): Promise<any> {
		const account = input
		if(!validateName(input.name)) throw new Error('Invalid name')
		if(!validateEmail(input.email)) throw new Error('Invalid email')
		if(!validateCpf(input.cpf)) throw new Error('Invalid cpf')
		if(input.isDriver && !validateCarPlate(input.carPlate)) throw new Error('Invalid car plate')
		const existingAccount = await this.accountDAO.getAccountByEmail(input.email);
		if(existingAccount) throw new Error('Account already exists');
		account.accountId = crypto.randomUUID();
		await this.accountDAO.createAccount(account)
		await this.mailerGateway.send(account.email, 'Welcome !', 'Welcome to our app')
		return {
			accountId: account.accountId
		}
	}
	
}