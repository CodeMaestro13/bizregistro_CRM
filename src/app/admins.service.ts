import { data } from './themecomponent/dashboard/crypto/market-graph/series-data';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs';
import { throwError } from 'rxjs';
import { endpoints } from './shared/endpoints';
@Injectable({
  providedIn: 'root'
})
export class AdminsService {
    constructor(private http:HttpClient) {}
    login(obj:any)
    {
      return this.http.post(`${endpoints.auth}login`,obj).pipe(tap(res => console.log(res)))
    }

    leads(data:any)
    {
      return this.http.post(`${endpoints.leads}get`,data).pipe(tap(res => console.log(res)))
    }

    addLead(data:any){
      return this.http.post(`${endpoints.leads}add`,data).pipe(tap((res:any)=>{console.log(res)}))

    }

    deletelead(data:any)
    {
      return this.http.delete(`${endpoints.leads}delete?id=${data?.leadId}`).pipe(tap(res => console.log(res)))
    }

    status(){
      return this.http.get(`${endpoints.lists}status`).pipe(tap(res => console.log(res)))
    }
    getclients(){
      return this.http.get(`${endpoints.lists}clients`).pipe(tap(res => console.log(res)))
    }

    reasonList(){
      return this.http.get(`${endpoints.lists}reasons`).pipe(tap(res => console.log(res)))
    }

    campaignList(){
      return this.http.get(`${endpoints.lists}campaign`).pipe(tap(res => console.log(res)))
    }    

    source(){
      return this.http.get(`${endpoints.lists}source`).pipe(tap(res => console.log(res)))
    }
    
    services(){
      return this.http.get(`${endpoints.lists}services`).pipe(tap(res => console.log(res)))
    }
    
    serchBy(type:any,value:any){
      return this.http.get(`${endpoints.lists}searchby?type=${type}&value=${value}`).pipe(tap(res => console.log(res)))
    }

    searchbyMobile(mobile:any){
      return this.http.get(`${endpoints.lists}searchbyMobile?mobile=${mobile}`).pipe(tap(res => console.log(res)))
    }

    bde(type:any = ''){
      return this.http.get(`${endpoints.lists}bde?type=${type}`).pipe(tap(res => console.log(res)));
    }

    addCallAct(data:any){
      return this.http.post(`${endpoints.leadActivity}add`,data).pipe(tap(res => console.log(res)));
    }

    addAct(data:any){
      return this.http.post(`${endpoints.leadActivity}insertAct`,data).pipe(tap(res => console.log(res)));
    }

    getAct(id:any){
      return this.http.get(`${endpoints.leadActivity}get?lead_id=${id}`).pipe(tap(res => console.log(res)));
    }

    getactivities(admin_id:any,startDate:any,endDate:any){
      return this.http.get(`${endpoints.leadActivity}getactivities?admin_id=${admin_id}&start_date=${startDate}&end_date=${endDate}`).pipe(tap(res => console.log(res)));
    }

    lead(id:any){
      return this.http.get(`${endpoints.lists}lead?lead_id=${id}`).pipe(tap(res => console.log(res)));
    }

    convertLead(data:any){
      return this.http.post(`${endpoints.converted}insert`,data).pipe(tap(res => console.log(res)));
    }

    clients(data:any){
      return this.http.post(`${endpoints.clients}`,data).pipe(tap(res => console.log(res)));      
    }

    pendingPaymentData(data:any){
      return this.http.post(`${endpoints.clients}pending`,data).pipe(tap(res => console.log(res)));      
    }

    serchClientBy(type:any,value:any){
      return this.http.get(`${endpoints.clients}searchby?type=${type}&value=${value}`).pipe(tap(res => console.log(res)))
    }

    updateClient(data:any){
      return this.http.put(`${endpoints.clients}update`,data).pipe(tap(res => console.log(res)));      
    }

    deleteClient(id:any){
      return this.http.delete(`${endpoints.clients}delete?client_id=${id}`).pipe(tap(res => console.log(res)));      
    }

    getPaymentDetails(id:any){
      return this.http.get(`${endpoints.payments}get?client_id=${id}`).pipe(tap(res => console.log(res)));      
    }

    savePayment(data:any){
      return this.http.post(`${endpoints.payments}add`,data).pipe(tap(res => console.log(res)));      
    }

    updatePaymentStatus(_id:any,status:any){
      return this.http.patch(`${endpoints.payments}updateStatus?id=${_id}`,{'status':status});
    }

    getClientsAvailableServices(id:any){
      return this.http.get(`${endpoints.lists}getClientsAvailableServices?client_id=${id}`).pipe(tap(res => console.log(res)));      
    }

    getClientsServices(id:any){
      return this.http.get(`${endpoints.lists}getClientsServices?client_id=${id}`).pipe(tap(res => console.log(res)));      
    }

    getWorkStatusList(client_id:any){
      return this.http.get(`${endpoints.lists}getWorkStatusList?client_id=${client_id}`).pipe(tap(res => console.log(res)));      
    }

    addonadd(data:any){
      return this.http.post(`${endpoints.addon}add`,data).pipe(tap(res => console.log(res)));      
    }

    ranymentreceipt(data:any)
    {
      return this.http.post(`${endpoints.raymentreceipt}get`,data).pipe(tap((res:any) => {console.log(res)}));
    }

    getServices(){
      return this.http.get(`${endpoints.Services}get`).pipe(tap((res:any) => console.log(res)));
    }

    addService(data:any){
      return this.http.post(`${endpoints.Services}add`,data).pipe(tap(res => console.log(res)));
    }

    toggleService(serivceId:any){
      return this.http.get(`${endpoints.Services}toggle?serviceId=${serivceId}`).pipe(tap(res => console.log(res)));
    }

    updateService(data:any){
      return this.http.post(`${endpoints.Services}update`,data).pipe(tap(res => console.log(res)));
    }

    getDashboardData(){
      return this.http.get(`${endpoints.Dashboard}get`).pipe(tap(res => console.log(res)));
    }

    takeReportGraphData(date:any){
      return this.http.get(`${endpoints.Dashboard}dallyActivity?date=${date}`).pipe(tap(res => console.log(res)));
    }

    addWorkProcess(data:any){
      return this.http.post(`${endpoints.Workprogress}add`,data).pipe(tap(res => console.log(res)));
    }

    getWorkProcess(client_id:any){
      return this.http.get(`${endpoints.Workprogress}?client_id=${client_id}`).pipe(tap(res => console.log(res)));
    }
    
    getWorkStatus(){
      return this.http.get(`${endpoints.work_status}get`).pipe(tap((res:any) => console.log(res)));
    }

    addWorkStatus(data:any){
      return this.http.post(`${endpoints.work_status}add`,data).pipe(tap(res => console.log(res)));
    }

    updateWorkStatus(data:any){
      return this.http.post(`${endpoints.work_status}update`,data).pipe(tap(res => console.log(res)));
    }

    getWorkFilter(form:any)
    {
      return this.http.post(`${endpoints.Workprogress}filter`,form);
    }

    // added service for qutation 
    postQuotation(data:any){
      return this.http.post(`${endpoints.leads}addQuotation`,data).pipe(tap(res => console.log(res)));
    }

    createQuotation(data:any){
      return this.http.post(`${endpoints.quotation}create`, data).pipe(
        tap(res => console.log(res)),
        catchError((error) => {
          return this.http.post(`${endpoints.quotationLegacy}create`, data).pipe(
            tap(res => console.log(res)),
            catchError((legacyError) => throwError(() => legacyError || error))
          );
        })
      );
    }

    getLeadQuotations(leadId:any){
      return this.http.get(`${endpoints.quotation}get?lead_id=${encodeURIComponent(leadId)}`).pipe(tap(res => console.log(res)));
    }

    viewQuotation(id:any){
      return this.http.get(`${endpoints.quotation}view?id=${encodeURIComponent(id)}`).pipe(tap(res => console.log(res)));
    }

}
