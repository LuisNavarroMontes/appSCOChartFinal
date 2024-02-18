export class mensaje_disp_iot{
    id:string;
    lon:string;
    lat:string;
    name:string;
    status:string;
    temp: number[];

    constructor(obj:any){
        this.id = obj.id;
        this.lon = obj.lon;
        this.lat = obj.lat;
        this.name = obj.name;
        this.status = obj.status;
        this.temp = obj.temp;
    }
}