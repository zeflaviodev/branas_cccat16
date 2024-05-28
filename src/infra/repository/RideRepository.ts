import pgp from "pg-promise";
import Ride from "../../domain/Ride"

export default interface RideRepository {
    saveRide(ride: Ride): Promise<any>
    hasActiveRideByPassengerId(passengerId: string): Promise<boolean>
    getRideById(rideId: string): Promise<Ride>
}

export class RideRepositoryDatabase implements RideRepository {

    async saveRide(ride: Ride): Promise<void> {
        try {
			const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
            await connection.query("insert into cccat16.ride (ride_id, passenger_id, from_lat, from_long, to_lat, to_long, status, date) values ($1, $2, $3, $4, $5, $6, $7, $8)", [ride.rideId, ride.passengerId, ride.fromLat, ride.fromLong, ride.toLat, ride.toLong, ride.status, ride.date]);	
			await connection.$pool.end();
		} catch(error: any){
			throw new Error('Error while creating a new ride: ' + error.message);
		}
    }

    async getRideById(rideId: any): Promise<Ride> {
        try {
			const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
            const [rideData] = await connection.query("select * from cccat16.ride where ride_id = $1", [rideId]);	
			await connection.$pool.end();
            return Ride.restore(
                rideData.ride_id, 
                rideData.passenger_id, 
                parseFloat(rideData.from_lat),
                parseFloat(rideData.from_long),
                parseFloat(rideData.to_lat),
                parseFloat(rideData.to_long),
                rideData.status, 
                rideData.date
            )
		} catch(error: any){
			throw new Error('Error while creating a new ride: ' + error.message);
		}
    }

    async hasActiveRideByPassengerId(passengerId: any): Promise<boolean> {
        try {
			const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
            const [rideData] = await connection.query("select * from cccat16.ride where passenger_id = $1 and status <> 'completed'", [passengerId]);	
			await connection.$pool.end();
            return !!rideData
		} catch(error: any){
			throw new Error('Error while creating a new ride: ' + error.message);
		}
    }
}