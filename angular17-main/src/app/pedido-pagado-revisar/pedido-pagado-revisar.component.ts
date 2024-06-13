import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiServiceService } from '../services/api-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-pedido-pagado-revisar',
  templateUrl: './pedido-pagado-revisar.component.html',
  styleUrls: ['./pedido-pagado-revisar.component.scss']
})
export class PedidoPagadoRevisarComponent implements OnInit {
  pago: any;
  loading: boolean = true;
  total: number = 0;
  detallesCarrito: any[] = [];

  constructor(
    private http: HttpClient,
    private ApiServiceService: ApiServiceService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const idPedido = +params['id_pedido'];
      if (!isNaN(idPedido)) {
        this.pagoIndividual(idPedido);
      } else {
        console.error('ID del pedido inválido');
        this.loading = false;
      }
    });
  }

  pagoIndividual(idPedido: number) {
    this.ApiServiceService.getPagoBueno(idPedido).pipe(
      catchError(error => {
        console.error('Error al obtener datos:', error);
        this.loading = false;
        return of(null);  // Devuelve un observable null en caso de error
      })
    ).subscribe((data: any) => {
      this.loading = false;
      this.pago = data;
      this.total = parseFloat(data.pedido.total);
      this.obtenerDetallesServicios(data.pedido.detalles_carrito);
    });
  }

  obtenerDetallesServicios(detallesCarrito: any[]): void {
    const servicioObservables = detallesCarrito.map(detalle => 
      this.ApiServiceService.getServicio(detalle.servicio)
    );

    forkJoin(servicioObservables).subscribe((servicios: any[]) => {
      this.detallesCarrito = detallesCarrito.map((detalle, index) => {
        return {
          ...detalle,
          servicio: servicios[index]
        };
      });
      console.log(this.detallesCarrito); // Verifica los detalles del carrito aquí
    });
  }

  generatePDF(): void {
    const factura = document.getElementById('factura');
    if (factura) {
      html2canvas(factura).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF('p', 'mm', 'a4');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        doc.save(`factura_pedido_${this.pago.pedido.id}.pdf`);
      });
    }
  }
}
