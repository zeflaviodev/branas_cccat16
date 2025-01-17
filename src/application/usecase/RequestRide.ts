import { AccountRepositoryDatabase } from "../../infra/repository/AccountRepository";
import { RideRepositoryDatabase } from "../../infra/repository/RideRepository";
import Ride from "../../domain/Ride"
export default class RequestRide {

    constructor (readonly accountRepository: AccountRepositoryDatabase, readonly rideRepository: RideRepositoryDatabase) {
    }

    async execute(input: Input): Promise<Output> {
        const account = await this.accountRepository.getAccountById(input.passengerId);
        if(!account.isPassenger) throw new Error("Account is not from a passenger");
        const hasActiveRide = await this.rideRepository.hasActiveRideByPassengerId(input.passengerId);
        if(hasActiveRide) throw new Error("Passenger has an active ride");
        const ride = Ride.create(
            input.passengerId,
            input.fromLat,
            input.fromLong,
            input.toLat,
            input.toLong
        )
        await this.rideRepository.saveRide(ride);
        return { 
            rideId: ride.rideId
        }
    }
}

type Input = {
    passengerId: string,
    fromLat: number,
    fromLong: number,
    toLat: number,
    toLong: number
}

type Output = {
    rideId: string
}
