// main
import { AccountRepositoryDatabase } from "./infra/repository/AccountRepository";
import { Signup } from "./application/usecase/Signup";
import { GetAccount } from "./application/usecase/GetAccount";
import { MailerGatewayMemory } from "./infra/gateway/MailerGateway";
import { PgPromiseAdapter } from "./infra/database/DatabaseConnection";
import { ExpressAdapter } from "./infra/http/HttpServer";
import AccountController from "./infra/http/AccountController";

const connection = new PgPromiseAdapter()
const httpServer = new ExpressAdapter()
const accountRepository = new AccountRepositoryDatabase(connection)
const mailerGateway = new MailerGatewayMemory()
const signup = new Signup(accountRepository, mailerGateway)
const getAccount = new GetAccount(accountRepository)
new AccountController(httpServer, signup, getAccount)
console.log("API is running");
httpServer.listen(3000)