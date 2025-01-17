import Account from "../src/domain/Account";
import { GetAccount } from "../src/application/usecase/GetAccount";
import { Signup } from "../src/application/usecase/Signup";
import { AccountRepositoryDatabase, AccountRepositoryMemory } from "../src/infra/repository/AccountRepository";
import { MailerGatewayMemory } from "../src/infra/gateway/MailerGateway";
import sinon from "sinon";
import DatabaseConnection, { PgPromiseAdapter } from "../src/infra/database/DatabaseConnection";

let signup: Signup
let getAccount: GetAccount

beforeEach(async function () {
	//Fake é uma implementacao falsa que mimifica a implementacao original
	const accountRepository = new AccountRepositoryMemory()
	const mailerGateway = new MailerGatewayMemory()
	signup = new Signup(accountRepository, mailerGateway)
	getAccount = new GetAccount(accountRepository)
})

test("Deve criar uma conta para o passageiro", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "87748248800",
		isPassenger: true
	};
	const outputSignup = await signup.execute(input)
	expect(outputSignup.accountId).toBeDefined()
	const outputGetAccount = await getAccount.execute(outputSignup)
	expect(outputGetAccount.name).toBe(input.name);
	expect(outputGetAccount.email).toBe(input.email);
	expect(outputGetAccount.cpf).toBe(input.cpf);
});

test("Deve criar uma conta para o motorista", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "87748248800",
		carPlate: "AAA9999",
		isPassenger: false,
		isDriver: true
	};
	const outputSignup = await signup.execute(input)
	expect(outputSignup.accountId).toBeDefined()
	const outputGetAccount = await getAccount.execute(outputSignup)
	expect(outputGetAccount.name).toBe(input.name);
	expect(outputGetAccount.email).toBe(input.email);
	expect(outputGetAccount.cpf).toBe(input.cpf);
	expect(outputGetAccount.carPlate).toBe(input.carPlate);
});

test("Não deve criar uma conta para o passageiro se o nome for inválido", async function () {
	const input = {
		name: "John",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "87748248800",
		isPassenger: true
	};
	await expect(() => signup.execute(input)).rejects.toThrow(new Error("Invalid name"))
});

test("Não deve criar uma conta para o passageiro se o email for inválido", async function () {
	const input = {
		name: "John Dow",
		email: `john.doe${Math.random()}`,
		cpf: "87748248800",
		isPassenger: true
	};
	await expect(() => signup.execute(input)).rejects.toThrow(new Error("Invalid email"))
});

test("Não deve criar uma conta para o passageiro se o cpf for inválido", async function () {
	const input = {
		name: "John Dow",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "877482488",
		isPassenger: true
	};
	await expect(() => signup.execute(input)).rejects.toThrow(new Error("Invalid cpf"))
});


test("Não deve criar uma conta para o passageiro se a conta ja existe", async function () {
	const input = {
		name: "John Dow",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "87748248800",
		isPassenger: true
	};
	await signup.execute(input)
	await expect(() => signup.execute(input)).rejects.toThrow(new Error("Account already exists"))
});

test("Não deve criar uma conta para o passageiro se a placa do carro é invalida", async function () {
	const input = {
		name: "John Dow",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "87748248800",
		carPlate: 'AAA999',
		isDriver: true
	};
	await expect(() => signup.execute(input)).rejects.toThrow(new Error("Invalid car plate"))
});

//Stub faz uma sobrescrtita de metado, retornando aquilo que voce precisa
test("Deve criar uma conta para o passageiro com stub", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "87748248800",
		isPassenger: true
	};
	const createAccountStub = sinon.stub(AccountRepositoryDatabase.prototype, "createAccount").resolves()
	const getAccountByEmailStub = sinon.stub(AccountRepositoryDatabase.prototype, "getAccountByEmail").resolves(undefined)
	const getAccountByIdStub = sinon.stub(AccountRepositoryDatabase.prototype, "getAccountById").resolves(Account.restore("", input.name, input.email, input.cpf, "", true, false))
	const connection = new PgPromiseAdapter()
	const accountRepository = new AccountRepositoryDatabase(connection)
	const mailerGateway = new MailerGatewayMemory()
	const signup = new Signup(accountRepository, mailerGateway)
	const getAccount = new GetAccount(accountRepository)
	const outputSignup = await signup.execute(input)
	expect(outputSignup.accountId).toBeDefined()
	const outputGetAccount = await getAccount.execute(outputSignup)
	expect(outputGetAccount.name).toBe(input.name);
	expect(outputGetAccount.email).toBe(input.email);
	expect(outputGetAccount.cpf).toBe(input.cpf);
	createAccountStub.restore()
	getAccountByEmailStub.restore()
	getAccountByIdStub.restore()
	await connection.close()
});

//Spy registra tudo que aconteceu com o componente que esta sendo espionado,
//depois voce faz a verificacao que quiser
test("Deve criar uma conta para o passageiro com spy", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "87748248800",
		isPassenger: true
	};
	const sendSpy = sinon.spy(MailerGatewayMemory.prototype, "send")
	const connection = new PgPromiseAdapter()
	const accountRepository = new AccountRepositoryDatabase(connection)
	const mailerGateway = new MailerGatewayMemory()
	const signup = new Signup(accountRepository, mailerGateway)
	const getAccount = new GetAccount(accountRepository)
	const outputSignup = await signup.execute(input)
	expect(outputSignup.accountId).toBeDefined()
	const outputGetAccount = await getAccount.execute(outputSignup)
	expect(outputGetAccount.name).toBe(input.name);
	expect(outputGetAccount.email).toBe(input.email);
	expect(outputGetAccount.cpf).toBe(input.cpf);
	expect(sendSpy.calledOnce).toBe(true)
	expect(sendSpy.calledWith(input.email, "Welcome !", "Welcome to our app")).toBe(true)
	sendSpy.restore()
	await connection.close()
});

//Mock mistura caracteristicas de Stub e spy, criando as expectativas no próprio objeto (mock)
test("Deve criar uma conta para o passageiro com mock", async function () {
	const input = {
		name: "John Doe",
		email: `john.doe${Math.random()}@gmail.com`,
		cpf: "87748248800",
		isPassenger: true
	};
	const sendMock = sinon.mock(MailerGatewayMemory.prototype)
	sendMock
		.expects("send")
		.withArgs(input.email, "Welcome !", "Welcome to our app")
		.once()
		// .callsFake(async () => { })
	const connection = new PgPromiseAdapter()
	const accountRepository = new AccountRepositoryDatabase(connection)
	const mailerGateway = new MailerGatewayMemory()
	const signup = new Signup(accountRepository, mailerGateway)
	const getAccount = new GetAccount(accountRepository)
	const outputSignup = await signup.execute(input)
	expect(outputSignup.accountId).toBeDefined()
	const outputGetAccount = await getAccount.execute(outputSignup)
	expect(outputGetAccount.name).toBe(input.name);
	expect(outputGetAccount.email).toBe(input.email);
	expect(outputGetAccount.cpf).toBe(input.cpf);
	sendMock.verify()
	sendMock.restore()
	await connection.close()
});