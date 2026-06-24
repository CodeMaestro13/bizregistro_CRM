import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class LoaderService {
  loading = new BehaviorSubject<boolean>(false);

  show() {
    queueMicrotask(() => this.loading.next(true));
  }
  
  hide() {
    queueMicrotask(() => this.loading.next(false));
  }
}
