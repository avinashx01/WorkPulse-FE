// configs/aclRules.ts
import { PageIdentifier } from '@/configs/acl'
import type { ACLObj } from '@/configs/acl'

export const ACL_RULES: Record<string, ACLObj> = {
  login: {
    action: 'manage',
    subject: PageIdentifier.login
  },
  'dashboards/analytics': {
    action: 'manage',
    subject: PageIdentifier.Dashboard
  },

  'pages/account-settings/profile': {
    action: 'manage',
    subject: PageIdentifier.Settings
  },
  'pages/account-settings/security': {
    action: 'manage',
    subject: PageIdentifier.Settings
  },

  // Super Admin

  'superAdmin/waterPurveyor': {
    action: 'manage',
    subject: PageIdentifier.Dashboard
  },
  'pages/adminapp-settings/apptype': {
    action: 'manage',
    subject: PageIdentifier.Organization
  },

  'pages/adminapp-settings/adminusers': {
    action: 'manage',
    subject: PageIdentifier.Organization
  },

  'pages/adminapp-settings/stripepayment': {
    action: 'manage',
    subject: PageIdentifier.Organization
  },
  'pages/adminapp-settings/imagetab': {
    action: 'manage',
    subject: PageIdentifier.Settings
  },

  'pages/account-settings/roles': {
    action: 'manage',
    subject: PageIdentifier.Settings
  },

  'pages/account-settings/permissions': {
    action: 'manage',
    subject: PageIdentifier.Settings
  },

  // System Admin

  'administration/userManagement': {
    action: 'manage',
    subject: PageIdentifier.UserManagement
  },

  // Account User Management

  'administration/accountUserManagement': {
    action: 'manage',
    subject: PageIdentifier.UserManagement
  },
  'administration/roleManagement': {
    action: 'manage',
    subject: PageIdentifier.RoleManagement
  },
  'administration/employees': {
    action: 'manage',
    subject: PageIdentifier.Employees
  },
  'administration/configuration': {
    action: 'manage',
    subject: PageIdentifier.Configuration
  },

  // Utility Billing

  consoleHomePage: {
    action: 'manage',
    subject: PageIdentifier.Customers
  },

  customers: {
    action: 'manage',
    subject: PageIdentifier.Customers
  },

  'pages/customers/customerinfo': {
    action: 'manage',
    subject: PageIdentifier.Customers
  },
  'pages/customers/contactdetails': {
    action: 'manage',
    subject: PageIdentifier.Customers
  },
  'pages/customers/address': {
    action: 'manage',
    subject: PageIdentifier.Customers
  },
  'pages/customers/relations': {
    action: 'manage',
    subject: PageIdentifier.Customers
  },
  'pages/customers/additionaldetails': {
    action: 'manage',
    subject: PageIdentifier.Customers
  },
  'pages/customers/bankdetails': {
    action: 'manage',
    subject: PageIdentifier.Customers
  },
  'pages/customers/creditcarddetails': {
    action: 'manage',
    subject: PageIdentifier.Customers
  },
  'pages/customers/notesAndAttachments': {
    action: 'manage',
    subject: PageIdentifier.Customers
  },
  'pages/customer360': {
    action: 'manage',
    subject: PageIdentifier.Customers
  },
  accounts: {
    action: 'manage',
    subject: PageIdentifier.Accounts
  },
  'pages/contract-accounts/contractaccountinfo': {
    action: 'manage',
    subject: PageIdentifier.Accounts
  },
  'pages/contract-accounts/contractdetails': {
    action: 'manage',
    subject: PageIdentifier.Accounts
  },
  'pages/contract-accounts/autopay': {
    action: 'manage',
    subject: PageIdentifier.Accounts
  },
  'pages/contract-accounts/onlineaccount': {
    action: 'manage',
    subject: PageIdentifier.Accounts
  },

  premises: {
    action: 'manage',
    subject: PageIdentifier.Premises
  },
  'pages/premises/service': {
    action: 'manage',
    subject: PageIdentifier.Premises
  },
  parcel: {
    action: 'manage',
    subject: PageIdentifier.Parcel
  },
  meters: {
    action: 'manage',
    subject: PageIdentifier.Meters
  },
  'meterInstallation/add': {
    action: 'manage',
    subject: PageIdentifier.MeterInstallation
  },
  'meterInstallation/list': {
    action: 'manage',
    subject: PageIdentifier.MeterList
  },
  meterReadOrderCreation: {
    action: 'manage',
    subject: PageIdentifier.MeterReadOrderCreation
  },
  massMeterOrder: {
    action: 'manage',
    subject: PageIdentifier.MeterList
  },
  meterReadings: {
    action: 'manage',
    subject: PageIdentifier.MeterReadings
  },
  'pages/meterReading/meterRead': {
    action: 'manage',
    subject: PageIdentifier.MeterReadings
  },

  'pages/meterReading/readHistory': {
    action: 'manage',
    subject: PageIdentifier.MeterReadings
  },
  meterReadingValidations: {
    action: 'manage',
    subject: PageIdentifier.MeterReadingValidations
  },
  meterReaderSchedule: {
    action: 'manage',
    subject: PageIdentifier.MeterReaderSchedule
  },

  'meterInstallation/removal': {
    action: 'manage',
    subject: PageIdentifier.MeterRemoval
  },
  'meterInstallation/replacement': {
    action: 'manage',
    subject: PageIdentifier.MeterReplacement
  },

  'pages/meters/register': {
    action: 'manage',
    subject: PageIdentifier.Meters
  },

  'meterReadOrderCreation/add': {
    action: 'manage',
    subject: PageIdentifier.MeterReadOrderCreation
  },

  serviceOrders: {
    action: 'manage',
    subject: PageIdentifier.ServiceOrders
  },

  'pages/serviceOrders/serviceOrdersDetails': {
    action: 'manage',
    subject: PageIdentifier.ServiceOrders
  },

  'pages/serviceOrders/items': {
    action: 'manage',
    subject: PageIdentifier.ServiceOrders
  },

  'pages/serviceOrders/notes': {
    action: 'manage',
    subject: PageIdentifier.ServiceOrders
  },

  'pages/serviceOrders/partiesInvovled': {
    action: 'manage',
    subject: PageIdentifier.ServiceOrders
  },

  'pages/serviceOrders/attachments': {
    action: 'manage',
    subject: PageIdentifier.ServiceOrders
  },
  'pages/serviceOrders/statuslog': {
    action: 'manage',
    subject: PageIdentifier.ServiceOrders
  },

  'serviceOrders/serviceOrderProcess': {
    action: 'manage',
    subject: PageIdentifier.ServiceOrders
  },

  'contract/list': {
    action: 'manage',
    subject: PageIdentifier.ContractList
  },
  'contract/review': {
    action: 'manage',
    subject: PageIdentifier.ContractList
  },
  'contract/add': {
    action: 'manage',
    subject: PageIdentifier.StartService
  },
  'contract/endOrCancelContract/add': {
    action: 'manage',
    subject: PageIdentifier.StopServices
  },
  'contract/endOrCancelContract': {
    action: 'manage',
    subject: PageIdentifier.StopServices
  },
  'contract/transferService/add': {
    action: 'manage',
    subject: PageIdentifier.TransferService
  },
  'billingDocument/add': {
    action: 'manage',
    subject: PageIdentifier.BillingDocument
  },
  massBilling: {
    action: 'manage',
    subject: PageIdentifier.MassBilling
  },
  billingValidations: {
    action: 'manage',
    subject: PageIdentifier.BillingValidations
  },
  'requests/startService/list': {
    action: 'manage',
    subject: PageIdentifier.StartService
  },
  'requests/startService/add': {
    action: 'manage',
    subject: PageIdentifier.StartService
  },
  'requests/stopService': {
    action: 'manage',
    subject: PageIdentifier.StopServices
  },
  'requests/stopService/add': {
    action: 'manage',
    subject: PageIdentifier.StopServices
  },
  'requests/transferService/add': {
    action: 'manage',
    subject: PageIdentifier.TransferService
  },
  'requests/transferService/list': {
    action: 'manage',
    subject: PageIdentifier.TransferService
  },
  'requests/viewAllRequest': {
    action: 'manage',
    subject: PageIdentifier.ViewAllRequest
  },
  'requests/ReportMissedCollection/list': {
    action: 'manage',
    subject: PageIdentifier.ReportMissedCollection
  },
  'requests/ReportMissedCollection/add': {
    action: 'manage',
    subject: PageIdentifier.ReportMissedCollection
  },
  'requests/BulkPickUpRequest/list': {
    action: 'manage',
    subject: PageIdentifier.RequestBulkPickup
  },
  'requests/BulkPickUpRequest/add': {
    action: 'manage',
    subject: PageIdentifier.RequestBulkPickup
  },

  'pages/requests/stopService/accountAndContracts': {
    action: 'manage',
    subject: PageIdentifier.Requests
  },

  'pages/requests/stopService/stopServiceDetails': {
    action: 'manage',
    subject: PageIdentifier.Requests
  },

  'pages/requests/stopService/review': {
    action: 'manage',
    subject: PageIdentifier.Requests
  },

  treeView: {
    action: 'manage',
    subject: PageIdentifier.Premises
  },
  chat: {
    action: 'manage',
    subject: PageIdentifier.Requests
  },
  serviceRequest: {
    action: 'manage',
    subject: PageIdentifier.ServiceRequest
  },

  'pages/serviceRequest/overview': {
    action: 'manage',
    subject: PageIdentifier.ServiceRequest
  },

  'pages/serviceRequest/activities': {
    action: 'manage',
    subject: PageIdentifier.ServiceRequest
  },

  'pages/serviceRequest/interactions': {
    action: 'manage',
    subject: PageIdentifier.ServiceRequest
  },

  'pages/serviceRequest/notes': {
    action: 'manage',
    subject: PageIdentifier.ServiceRequest
  },
  'pages/serviceRequest/attachments': {
    action: 'manage',
    subject: PageIdentifier.ServiceRequest
  },

  'pages/serviceRequest/serviceOrder': {
    action: 'manage',
    subject: PageIdentifier.ServiceRequest
  },

  'invoice/add': {
    action: 'manage',
    subject: PageIdentifier.Invoices
  },
  'invoice/edit': {
    action: 'manage',
    subject: PageIdentifier.Invoices
  },
  'invoice/list': {
    action: 'manage',
    subject: PageIdentifier.InvoiceList
  },
  'invoice/massInvoice': {
    action: 'manage',
    subject: PageIdentifier.MassInvoice
  },
  'invoice/preview': {
    action: 'manage',
    subject: PageIdentifier.Invoices
  },
  'invoice/print': {
    action: 'manage',
    subject: PageIdentifier.Invoices
  },
  'payments/paymentLot': {
    action: 'manage',
    subject: PageIdentifier.PaymentLots
  },
  'payments/paymentItem': {
    action: 'manage',
    subject: PageIdentifier.Payments
  },
  'educationEvents/dashboard': {
    action: 'manage',
    subject: PageIdentifier.EducationEvents
  },
  'educationEvents/list': {
    action: 'manage',
    subject: PageIdentifier.EducationEventList
  },

  'financialTransaction/list': {
    action: 'manage',
    subject: PageIdentifier.FinancialTransactions
  },

  'financialTransaction/securityDeposit/list': {
    action: 'manage',
    subject: PageIdentifier.FinancialTransactions
  },

  reports: {
    action: 'manage',
    subject: PageIdentifier.Reports
  },

  'reports/list/paymentsHistory': {
    action: 'manage',
    subject: PageIdentifier.Reports
  },

  'reports/list/seniorCitizenDiscounts': {
    action: 'manage',
    subject: PageIdentifier.Reports
  },

  cases: {
    action: 'manage',
    subject: PageIdentifier.Cases
  },

  'cases/list': {
    action: 'manage',
    subject: PageIdentifier.Cases
  },

  'cases/add': {
    action: 'manage',
    subject: PageIdentifier.Cases
  },
  email: {
    action: 'manage',
    subject: PageIdentifier.Cases
  },
  calendar: {
    action: 'manage',
    subject: PageIdentifier.Calendar
  },

  // Customer Portal

  homePage: {
    action: 'manage',
    subject: PageIdentifier.HomePage
  },

  'pages/account-settings/communicationpreferences': {
    action: 'manage',
    subject: PageIdentifier.Settings
  },

  accountDetails: {
    action: 'manage',
    subject: PageIdentifier.AccountDetails

    //subject: PageIdentifier.AccountDetails
  },

  'payments/cardCheckout': {
    action: 'manage',
    subject: PageIdentifier.HomePage
  },

  'payments/cardCheckout/confirmation': {
    action: 'manage',
    subject: PageIdentifier.HomePage
  },

  'payments/bankCheckout': {
    action: 'manage',
    subject: PageIdentifier.HomePage
  },
  'payments/AutomaticPayments': {
    action: 'manage',
    subject: PageIdentifier.AutomaticPayments
  },

  'requests/missedCollection': {
    action: 'manage',
    subject: PageIdentifier.Requests
  },
  'requests/requestBulkPickup': {
    action: 'manage',
    subject: PageIdentifier.Requests
  },
  'pages/chats': {
    action: 'manage',
    subject: PageIdentifier.Requests
  },
  socialMediaManagment: {
    action: 'manage',
    subject: PageIdentifier.SocialMediaIntegration
  },
  socialMediaCalender: {
    action: 'manage',
    subject: PageIdentifier.SocialMediaCalender
  },
  socialMediaPosts: {
    action: 'manage',
    subject: PageIdentifier.SocialMediaPosts
  },
  emails: {
    action: 'manage',
    subject: PageIdentifier.Requests
  },
  license: {
    action: 'manage',
    subject: PageIdentifier.Licenses
  },
  licenceList: {
    action: 'manage',
    subject: PageIdentifier.LicenceListing
  },
  licenceApplication: {
    action: 'manage',
    subject: PageIdentifier.LicenceApplication
  },
  'licenceApplication/add': {
    action: 'manage',
    subject: PageIdentifier.LicenceApplication
  },
  selectBusinessLicence: {
    action: 'manage',
    subject: PageIdentifier.LicenceApplication
  },
  'licenceApplication/payment': {
    action: 'manage',
    subject: PageIdentifier.LicenceApplication
  },
    'blm/invoice': {
    action: 'manage',
    subject: PageIdentifier.LicenceApplication
  },
    'blm/invoice/add': {
    action: 'manage',
    subject: PageIdentifier.LicenceApplication
  },
    'blm/invoice/preview': {
    action: 'manage',
    subject: PageIdentifier.LicenceApplication
  },
    'blm/invoice/print': {
    action: 'manage',
    subject: PageIdentifier.LicenceApplication
  }, 'blm/payment': {
    action: 'manage',
    subject: PageIdentifier.LicenceApplication
  },
  permitList: {
    action: 'manage',
    subject: PageIdentifier.PermitList
  },
  permitApplication: {
    action: 'manage',
    subject: PageIdentifier.PermitApplication
  },
  'permitApplication/add': {
    action: 'manage',
    subject: PageIdentifier.PermitApplication
  },
  selectPermitApplication: {
    action: 'manage',
    subject: PageIdentifier.PermitApplication
  },
  
  'licenceApplication/approve': {
    action: 'manage',
    subject: PageIdentifier.LicenceApplication
  },


  // other routess
}
