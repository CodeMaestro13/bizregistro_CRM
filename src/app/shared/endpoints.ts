const baseUrl = 'https://apis.bizregistro.com/'; // Base URL for the API
// localhost url 
// const baseUrl= 'http://localhost/bizBackend/'; // Base URL for the API in development
export const endpoints = {
    auth: `${baseUrl}Authorization/`,
    leads: `${baseUrl}Leads/`,
    lists: `${baseUrl}Lists/`,
    leadActivity: `${baseUrl}Leadactivity/`,
    converted: `${baseUrl}Convert/`,
    clients: `${baseUrl}Clients/`,
    payments: `${baseUrl}Payments/`,
    addon: `${baseUrl}Addon/`,
    raymentreceipt: `${baseUrl}Raymentreceipt/`,
    Services: `${baseUrl}Services/`,
    Dashboard: `${baseUrl}Dashboard/`,
    Workprogress: `${baseUrl}Workprogress/`,
    work_status: `${baseUrl}Workstatus/`,
    quotation: `${baseUrl}Quotation/`,
    quotationLegacy: `${baseUrl}index.php/Quotation/`
    // Other endpoints can be added here as needed  
};
