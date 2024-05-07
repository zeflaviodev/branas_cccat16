import { GetAccount } from "../src/application/GetAccount";
import { Signup } from "../src/application/Signup";
import { AccountDAODatabase, AccountDAOMemory } from "../src/resource/AccountDAO";
import { MailerGatewayMemory } from "../src/resource/MailerGateway";
import sinon from "sinon";

let signup: Signup
let getAccount: GetAccount

beforeEach(async function () {
	//Fake é uma implementacao falsa que mimifica a implementacao original
	const accountDAO = new AccountDAOMemory()
	const mailerGateway = new MailerGatewayMemory()
	signup = new Signup(accountDAO, mailerGateway)
	getAccount = new GetAccount(accountDAO)
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
	const createAccountStub = sinon.stub(AccountDAODatabase.prototype, "createAccount").resolves()
	const getAccountByEmailStub = sinon.stub(AccountDAODatabase.prototype, "getAccountByEmail").resolves(null)
	const getAccountByIdStub = sinon.stub(AccountDAODatabase.prototype, "getAccountById").resolves(input)
	const accountDAO = new AccountDAODatabase()
	const mailerGateway = new MailerGatewayMemory()
	const signup = new Signup(accountDAO, mailerGateway)
	const getAccount = new GetAccount(accountDAO)
	const outputSignup = await signup.execute(input)
	expect(outputSignup.accountId).toBeDefined()
	const outputGetAccount = await getAccount.execute(outputSignup)
	expect(outputGetAccount.name).toBe(input.name);
	expect(outputGetAccount.email).toBe(input.email);
	expect(outputGetAccount.cpf).toBe(input.cpf);
	createAccountStub.restore()
	getAccountByEmailStub.restore()
	getAccountByIdStub.restore()
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
	const accountDAO = new AccountDAODatabase()
	const mailerGateway = new MailerGatewayMemory()
	const signup = new Signup(accountDAO, mailerGateway)
	const getAccount = new GetAccount(accountDAO)
	const outputSignup = await signup.execute(input)
	expect(outputSignup.accountId).toBeDefined()
	const outputGetAccount = await getAccount.execute(outputSignup)
	expect(outputGetAccount.name).toBe(input.name);
	expect(outputGetAccount.email).toBe(input.email);
	expect(outputGetAccount.cpf).toBe(input.cpf);
	expect(sendSpy.calledOnce).toBe(true)
	expect(sendSpy.calledWith(input.email, "Welcome !", "Welcome to our app")).toBe(true)
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
		.callsFake(async () => { 
			console.log('aqui')
		})
	const accountDAO = new AccountDAODatabase()
	const mailerGateway = new MailerGatewayMemory()
	const signup = new Signup(accountDAO, mailerGateway)
	const getAccount = new GetAccount(accountDAO)
	const outputSignup = await signup.execute(input)
	expect(outputSignup.accountId).toBeDefined()
	const outputGetAccount = await getAccount.execute(outputSignup)
	expect(outputGetAccount.name).toBe(input.name);
	expect(outputGetAccount.email).toBe(input.email);
	expect(outputGetAccount.cpf).toBe(input.cpf);
	sendMock.verify()
	sendMock.restore()
});