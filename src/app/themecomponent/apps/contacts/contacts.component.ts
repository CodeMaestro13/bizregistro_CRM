import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'app-contacts',
    standalone: true,
    imports: [RouterLink, MatCardModule, MatButtonModule, MatMenuModule, MatFormFieldModule, MatInputModule, MatTableModule, MatCheckboxModule, MatPaginatorModule],
    templateUrl: './contacts.component.html',
    styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements AfterViewInit {

    displayedColumns: string[] = ['select', 'image', 'name', 'phoneNumber', 'email', 'dateOfBirth', 'address'];
    dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
    selection = new SelectionModel<PeriodicElement>(true, []);

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    @ViewChild(MatPaginator) paginator: MatPaginator;

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    toggleAllRows() {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }
        this.selection.select(...this.dataSource.data);
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: PeriodicElement): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.name + 1}`;
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

}

export interface PeriodicElement {
    name: string;
    image: string;
    phoneNumber: string;
    email: string;
    dateOfBirth: string;
    address: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
    {
        name: 'Alvarado Turner',
        image: 'img/user/user22.jpg',
        phoneNumber: '+754-3010764',
        email: 'alvaradoturner@tagus.com',
        dateOfBirth: '02/25/1990',
        address: 'Kansas 67701, USA',
    },
    {
        name: 'Evangelina Mcclain',
        image: 'img/user/user21.jpg',
        phoneNumber: '+123-3010764',
        email: 'evangelinamcclain@tagus.com',
        dateOfBirth: '21/12/1990',
        address: 'Colby 9XJ6+46, USA',
    },
    {
        name: 'Candice Munoz',
        image: 'img/user/user20.jpg',
        phoneNumber: '+212-3010764',
        email: 'candicemunoz@tagus.com',
        dateOfBirth: '17/05/1990',
        address: '9WPV+3Q Kansas, USA',
    },
    {
        name: 'Bernard Langley',
        image: 'img/user/user19.jpg',
        phoneNumber: '+321-3010764',
        email: 'bernardlangley@tagus.com',
        dateOfBirth: '10/08/1990',
        address: 'Manitoba, Canada',
    },
    {
        name: 'Kristie Hall',
        image: 'img/user/user15.jpg',
        phoneNumber: '+432-3010764',
        email: 'kristiehall@tagus.com',
        dateOfBirth: '03/06/1990',
        address: 'V8QC+Q9 Brochet, Canada',
    },
    {
        name: 'Bolton Obrien',
        image: 'img/user/user14.jpg',
        phoneNumber: '+342-3010764',
        email: 'boltonobrien@tagus.com',
        dateOfBirth: '11/06/1990',
        address: 'Jeollanam-do, South Korea',
    },
    {
        name: 'Dee Alvarado',
        image: 'img/user/user13.jpg',
        phoneNumber: '+543-3010764',
        email: 'deealvarado@tagus.com',
        dateOfBirth: '10/10/1990',
        address: 'Krasnoyarsk Krai, Russia',
    },
    {
        name: 'Cervantes Kramer',
        image: 'img/user/user11.jpg',
        phoneNumber: '+111-3010764',
        email: 'cervanteskramer@tagus.com',
        dateOfBirth: '02/12/1990',
        address: 'Laattaouia 43100, Morocco',
    },
    {
        name: 'Dejesus Michael',
        image: 'img/user/user9.jpg',
        phoneNumber: '+234-3010764',
        email: 'dejesusmichael@tagus.com',
        dateOfBirth: '01/03/1990',
        address: 'Meaulne-Vitray, France',
    },
    {
        name: 'Alissa Nelson',
        image: 'img/user/user8.jpg',
        phoneNumber: '+325-3010764',
        email: 'alissanelson@tagus.com',
        dateOfBirth: '31/11/1990',
        address: 'Saint-Bonnet-Tronçais, France',
    },
    {
        name: 'English Haney',
        image: 'img/user/user7.jpg',
        phoneNumber: '+653-3010764',
        email: 'englishhaney@tagus.com',
        dateOfBirth: '12/01/1990',
        address: 'Bern, Switzerland',
    },
    {
        name: 'Edwards Mckenzie',
        image: 'img/user/user6.jpg',
        phoneNumber: '+345-3010764',
        email: 'edwardsmckenzie@tagus.com',
        dateOfBirth: '12/12/1990',
        address: 'Ostermundigen, Switzerland',
    },
    {
        name: 'Lucile Young',
        image: 'img/user/user5.jpg',
        phoneNumber: '+765-3010764',
        email: 'lyoung4a@tagus.com',
        dateOfBirth: '11/11/1990',
        address: 'Gasthof Kreuz, Switzerland',
    },
    {
        name: 'Jordan Stevenson',
        image: 'img/user/user4.jpg',
        phoneNumber: '+456-3010764',
        email: 'jstevenson5c@tagus.com',
        dateOfBirth: '23/08/1990',
        address: 'Paris, France',
    },
    {
        name: 'Francis Frank',
        image: 'img/user/user3.jpg',
        phoneNumber: '+987-3010764',
        email: 'ffrank7e@tagus.com',
        dateOfBirth: '28/11/1990',
        address: 'Les Lilas, France',
    },
    {
        name: 'Phoebe Patterson',
        image: 'img/user/user2.jpg',
        phoneNumber: '+000-3010764',
        email: 'ppatterson2g@tagus.com',
        dateOfBirth: '02/01/1990',
        address: 'Neuilly-Plaisance, France',
    },
    {
        name: 'James Andy',
        image: 'img/user/user1.jpg',
        phoneNumber: '+999-3010764',
        email: 'andyjm32@tagus.com',
        dateOfBirth: '01/12/1990',
        address: 'Lidl, France',
    }
];