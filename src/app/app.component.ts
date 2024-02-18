import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Socket } from 'ngx-socket-io';
import { dispositivo_iot } from './models/dispositivo_iot';
import { mensaje_disp_iot } from './models/mensaje_disp_iot';
import { TemperaturaService } from './services/temperaturas.services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'appSCOChartFinal';
  chart: any = undefined;

  temperaturas: { [key: string]: Array<number> } = {};
  contadores: { [key: string]: number } = {};
  valorMaximo: any = { key: null, value: -Infinity };
  mostrar: boolean = false;

  dispositivos_iot_mostrandose: Array<dispositivo_iot> = new Array;
  dispositivos_iot: Array<dispositivo_iot> = new Array;
  dispositivos_iot_reset: Array<dispositivo_iot> = new Array;
  page: number = 1;
  count_dispositivos: number = 0;
  table_size: number = 5;
  paginacion: any = [5, 10, 15, 20];
  dispositivo_iot = {} as dispositivo_iot;

  constructor(private socket: Socket, private temperaturaService: TemperaturaService) { }
  ngOnDestroy(): void {
    //this.socket.disconnect();
  }

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  ngOnInit() {
    this.dispositivos_iot = [];
    this.dispositivos_iot_mostrandose = [];
    this.temperaturas = {};
    this.dispositivos_iot_reset = [];
    if (this.chart != undefined) {
      this.chart.destroy();
    }
    this.chart = new Chart("MyChart", {
      type: 'line',
      data: {
        labels: Array.from({ length: 100 }, (_, index) => index + 1),
        datasets: [] // Remove the initial dataset
      },
      options: {
        aspectRatio: 2.5,
        events: ['click'],
        animation: {
          duration: 0, // general animation time
        },
      }
    });
    this.temperaturaService.getTemperaturas().forEach((data: any) => {
      console.log('Data:', data);
      //this.activarContadores(data);
      this.llegaMensaje(data).then(() => {
        if (this.chart) {
          for (const key in this.temperaturas) {
            this.chart.data.datasets.push({
              label: this.dispositivos_iot.find(obj => obj.id.toString() === key)?.id.toString(),
              data: this.temperaturas[key], // Use the device id as the key
              backgroundColor: `rgba(${parseInt(key) * 10}, 99, 132, 0.2)`,
              borderColor: `rgba(${parseInt(key) * 10}, 99, 132, 1)`,
            });
          }
          this.chart.update();     
        }
      }).catch(error => {
        console.error('Error al actualizar el gráfico:', error);
      });
    });

    setInterval(() => {
      this.temperaturas = {};
      this.chart.data.datasets = [];
      /*if (this.chart != undefined) {
        this.chart.destroy();
      }
      this.chart = new Chart("MyChart", {
        type: 'line',
        data: {
          labels: Array.from({ length: 100 }, (_, index) => index + 1),
          datasets: [] // Remove the initial dataset
        },
        options: {
          aspectRatio: 2.5,
          animation: {
            duration: 0, // general animation time
          },
        }
      });*/
      this.temperaturaService.getTemperaturas().forEach((data: any) => {
        console.log('Data:', data);
        //this.activarContadores(data);
        this.llegaMensaje(data).then(() => {
          if (this.chart) {
            for (const key in this.temperaturas) {
              this.chart.data.datasets.push({
                label: this.dispositivos_iot.find(obj => obj.id.toString() === key)?.id.toString(),
                data: this.temperaturas[key], // Use the device id as the key
                backgroundColor: `rgba(${parseInt(key) * 10}, 99, 132, 0.2)`,
                borderColor: `rgba(${parseInt(key) * 10}, 99, 132, 1)`,
              });
            }
            this.chart.update();     
          }
        }).catch(error => {
          console.error('Error al actualizar el gráfico:', error);
        });
      });
    }, 5000);

    /*this.socket.on('message', (data: any) => {
      this.temperaturas = {};
      this.chart.destroy();
      this.chart = new Chart("MyChart", {
        type: 'line',
        data: {
          labels: Array.from({ length: 100 }, (_, index) => index + 1),
          datasets: [] // Remove the initial dataset
        },
        options: {
          aspectRatio: 2.5
        }
      });
      this.llegaMensaje(data).then(() => {
        if (this.chart) {
          this.chart.update();
        }
      }).catch(error => {
        console.error('Error al actualizar el gráfico:', error);
      });
    });
    this.socket.connect();
    */
  }

  async createChart() {
    this.chart = new Chart("MyChart", {
      type: 'line',
      data: {
        labels: Array.from({ length: 100 }, (_, index) => index + 1),
        datasets: [] // Remove the initial dataset
      },
      options: {
        aspectRatio: 2.5
      }
    });
  }


  async llegaMensaje(jsonData: any) {
    for (const key in jsonData) {
      if (key.startsWith("IoT")) {
        const iotData = jsonData[key];
        const iotObject = new dispositivo_iot(iotData);
        const iotObjectMensaje = new mensaje_disp_iot(iotData);

        if (!this.dispositivos_iot.find(obj => obj.id === iotObject.id)) {
          this.dispositivos_iot.push(iotObject);
          this.count_dispositivos++;
          this.temperaturas[iotObject.id] = []; // Use the device id as the key
          this.postListDispositivos();
        }
        if (!this.dispositivos_iot_reset.find(obj => obj.id === iotObject.id)) {
          this.dispositivos_iot_reset.push(iotObject);
          this.temperaturas[iotObject.id] = []; // Use the device id as the key

          this.chart.data.datasets.push({
            label: iotObject.name,
            data: this.temperaturas[iotObject.id], // Use the device id as the key
            backgroundColor: `rgba(${parseInt(iotObject.id) * 10}, 99, 132, 0.2)`,
            borderColor: `rgba(${parseInt(iotObject.id) * 10}, 99, 132, 1)`,
          });
        }
        if (!this.temperaturas[iotObject.id]) {
          this.temperaturas[iotObject.id] = [];
        }

        iotObjectMensaje.temp.forEach((temp: number) => {
          this.temperaturas[iotObject.id].push(temp);
        });
        while (this.temperaturas[iotObject.id].length >= 100){
          this.temperaturas[iotObject.id].shift();
        }
      }
    }
  }

  async activarContadores(jsonData: any) {
    for (const key in jsonData) {
      if (key.startsWith("IoT")) {
        const iotData = jsonData[key];
        const iotObject = new dispositivo_iot(iotData);
        const iotObjectMensaje = new mensaje_disp_iot(iotData);

        if (!this.dispositivos_iot.find(obj => obj.id === iotObject.id)) {
          this.contadores[iotObject.id] = 0; // Use the device id as the key
        }

        if (!this.contadores[iotObject.id]) {
          this.contadores[iotObject.id] = 0;
        }

        this.contadores[iotObject.id]++;
        if(this.contadores[iotObject.id] >= 100){
          this.contadores[iotObject.id] = 100;
        }

      }
    }
    this.valorMaximo = Object.entries(this.contadores).reduce(
      (acc: { key: string | null; value: number }, [key, value]: [string, number]) => {
        return value > acc.value ? { key, value } : acc;
      },
      { key: null, value: -Infinity } as { key: string | null; value: number }
    );

  }

  dispositivoClick(dispositivo: any) {
    this.dispositivo_iot = dispositivo;
    this.mostrar = true;
  }

  onTableSizeChange(event: any): void {
    this.table_size = event.target.value;
    this.page = 1;
    this.postListDispositivos();
  }

  postListDispositivos() {
    this.dispositivos_iot_mostrandose = this.dispositivos_iot.slice((this.page - 1) * this.table_size, ((this.page - 1) * this.table_size) + this.table_size);
  }

  onTableDataChange(event: any) {
    this.page = event;
    this.postListDispositivos();
  }
}