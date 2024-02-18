import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'appSCOChartFinal';
  chart: any = [];
  constructor(
    private socket: Socket
  ) {
  }
  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  ngOnInit() {
    this.createChart();
      this.socket.on('message', (data:any) => {
        var jsonObject = JSON.parse(data);
        console.log('Mensaje del servidor:', jsonObject);
        this.chart.data.datasets[0].data.push(jsonObject.temperatura);
        this.chart.update();
      });
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
  createChart(){
    
    this.chart = new Chart("MyChart", {
      type: 'line', //this denotes tha type of chart

      data: {// values on X-Axis
        labels: Array.from({length: 100}, (_, index) => index + 1), 
	       datasets: [
          {
            label: "Temperatura",
            data: [10, 20, NaN, 40, 50, 60, 70, 80, 90, 100],
            backgroundColor: 'blue'
          },  
        ]
      },
      options: {
        aspectRatio:2.5
      }
      
    });
  }
  
}
