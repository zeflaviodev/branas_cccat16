import crypto from "crypto"
import { validateCpf } from "./validateCpf";

function validateName(name: string): boolean {
    return /[a-zA-Z] [a-zA-Z]+/.test(name);
}

function validateEmail(email: string): boolean {
    return /^(.+)@(.+)$/.test(email);
}

function validateCarPlate(car_plate: string): boolean {
    return /[A-Z]{3}[0-9]{4}/.test(car_plate);
}

export default class Account {
    private constructor(readonly accountId: string, readonly name: string, readonly email: string, readonly cpf: string, readonly carPlate: string, readonly isPassenger: boolean, readonly isDriver: boolean) {
        if(!validateName(this.name)) throw new Error('Invalid name')
        if(!validateEmail(this.email)) throw new Error('Invalid email')
        if(!validateCpf(this.cpf)) throw new Error('Invalid cpf')
        if(this.isDriver && !validateCarPlate(this.carPlate)) throw new Error('Invalid car plate')
    }

    static create(name: string, email: string, cpf: string, carPlate: string, isPassenger: boolean, isDriver: boolean) {
        const accountId = crypto.randomUUID()
        return new Account(accountId, name, email, cpf, carPlate, isPassenger, isDriver)
    }

    static restore(accountId: string, name: string, email: string, cpf: string, carPlate: string, isPassenger: boolean, isDriver: boolean) {
        return new Account(accountId, name, email, cpf, carPlate, isPassenger, isDriver)
    }
}
