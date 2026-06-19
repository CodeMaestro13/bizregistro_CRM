import { NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-to-do-list',
    standalone: true,
    imports: [RouterLink, MatCardModule, MatButtonModule, MatMenuModule, MatTableModule, MatCheckboxModule, MatPaginatorModule, MatTooltipModule, NgIf],
    templateUrl: './to-do-list.component.html',
    styleUrls: ['./to-do-list.component.scss']
})
export class ToDoListComponent {

    constructor(
        public dialog: MatDialog
    ) {}

    openAddTaskDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
        this.dialog.open(AddTaskDialogBox, {
            width: '600px',
            enterAnimationDuration,
            exitAnimationDuration
        });
    }

    displayedColumns: string[] = ['taskName', 'assigned', 'deadline', 'status', 'completion', 'priority', 'action'];
    dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

    @ViewChild(MatPaginator) paginator: MatPaginator;

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    ongoing = true;
    pending = true;
    completed = true;

}

export interface PeriodicElement {
    deadline: string;
    assigned: any;
    taskName: string;
    completion: string;
    priority: string;
    action: string;
    status: any;
}

const ELEMENT_DATA: PeriodicElement[] = [
    {
        taskName: 'Public Beta Release',
        deadline: '14 Mar 2023',
        assigned: {
            img: 'img/user/user23.jpg',
            name: 'James Andy'
        },
        status: {
            ongoing: 'Ongoing'
        },
        completion: '10/10',
        priority: 'High',
        action: 'ri-more-fill'
    },
    {
        taskName: 'Fix Platform Errors',
        deadline: '12 Feb 2023',
        assigned: {
            img: 'img/user/user22.jpg',
            name: 'Alina Smith'
        },
        status: {
            completed: 'Completed'
        },
        completion: '9/10',
        priority: 'Low',
        action: 'ri-more-fill'
    },
    {
        taskName: 'Launch our Mobile App',
        deadline: '10 Mar 2023',
        assigned: {
            img: 'img/user/user21.jpg',
            name: 'David Warner'
        },
        status: {
            ongoing: 'Ongoing'
        },
        completion: '8/10',
        priority: 'High',
        action: 'ri-more-fill'
    },
    {
        taskName: 'Add the New Pricing Page',
        deadline: '08 Mar 2023',
        assigned: {
            img: 'img/user/user20.jpg',
            name: 'Steven Smith'
        },
        status: {
            ongoing: 'Ongoing'
        },
        completion: '7/10',
        priority: 'Medium',
        action: 'ri-more-fill'
    },
    {
        taskName: 'Redesign New Online Shop',
        deadline: '01 Mar 2023',
        assigned: {
            img: 'img/user/user19.jpg',
            name: 'Shane Cloud'
        },
        status: {
            pending: 'Pending'
        },
        completion: '6/10',
        priority: 'Low',
        action: 'ri-more-fill'
    },
    {
        taskName: 'Material Ui Design',
        deadline: '03 Apr 2023',
        assigned: {
            img: 'img/user/user18.jpg',
            name: 'Olivia Lucy'
        },
        status: {
            pending: 'Pending'
        },
        completion: '5/10',
        priority: 'High',
        action: 'ri-more-fill'
    },
    {
        taskName: 'Add Progress Track',
        deadline: '12 Feb 2023',
        assigned: {
            img: 'img/user/user17.jpg',
            name: 'Liam Payne'
        },
        status: {
            completed: 'Completed'
        },
        completion: '4/10',
        priority: 'Medium',
        action: 'ri-more-fill'
    },
    {
        taskName: 'Project for Client',
        deadline: '14 Mar 2023',
        assigned: {
            img: 'img/user/user16.jpg',
            name: 'David Warner'
        },
        status: {
            ongoing: 'Ongoing'
        },
        completion: '3/10',
        priority: 'Low',
        action: 'ri-more-fill'
    },
    {
        taskName: 'Opened New Showcase',
        deadline: '28 Feb 2023',
        assigned: {
            img: 'img/user/user15.jpg',
            name: 'Alina Smith'
        },
        status: {
            completed: 'Completed'
        },
        completion: '2/10',
        priority: 'High',
        action: 'ri-more-fill'
    },
    {
        taskName: 'Updated the Status',
        deadline: '10 Mar 2023',
        assigned: {
            img: 'img/user/user14.jpg',
            name: 'James Andy'
        },
        status: {
            completed: 'Completed'
        },
        completion: '1/10',
        priority: 'Medium',
        action: 'ri-more-fill'
    },
    {
        taskName: 'Product UI/UX Design',
        deadline: '08 Mar 2023',
        assigned: {
            img: 'img/user/user13.jpg',
            name: 'Liam Payne'
        },
        status: {
            ongoing: 'Ongoing'
        },
        completion: '10/10',
        priority: 'Low',
        action: 'ri-more-fill'
    },
    {
        taskName: 'Product Devlopment',
        deadline: '28 Feb 2023',
        assigned: {
            img: 'img/user/user12.jpg',
            name: 'Olivia Lucy'
        },
        status: {
            pending: 'Pending'
        },
        completion: '9/10',
        priority: 'High',
        action: 'ri-more-fill'
    },
    {
        taskName: 'New Office Building',
        deadline: '03 Apr 2023',
        assigned: {
            img: 'img/user/user11.jpg',
            name: 'Shane Cloud'
        },
        status: {
            ongoing: 'Ongoing'
        },
        completion: '8/10',
        priority: 'Medium',
        action: 'ri-more-fill'
    },
    {
        taskName: 'SEO Marketing',
        deadline: '01 Mar 2023',
        assigned: {
            img: 'img/user/user10.jpg',
            name: 'Steven Smith'
        },
        status: {
            pending: 'Pending'
        },
        completion: '7/10',
        priority: 'Low',
        action: 'ri-more-fill'
    }
];

@Component({
    selector: 'add-task-dialog',
    templateUrl: './add-task-dialog.html',
})
export class AddTaskDialogBox {

    constructor(
        public dialogRef: MatDialogRef<AddTaskDialogBox>
    ) {}

    close(){
        this.dialogRef.close(true);
    }

}