export class dispositivo_iot{
    id:string;
    lon:string;
    lat:string;
    name:string;
    status:string;

    constructor(obj:any){
        this.id = obj.id;
        this.lon = obj.lon;
        this.lat = obj.lat;
        this.name = obj.name;
        this.status = obj.status;
    }
}