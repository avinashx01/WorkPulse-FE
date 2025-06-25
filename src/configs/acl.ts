import { AbilityBuilder, PureAbility } from '@casl/ability'

import type { AppDetail } from '@/hooks/useAppDetails'

/**
 * Enum for page identifiers.
 * Add or remove entries based on your application modules.
 */
export enum PageIdentifier {
  Dashboard = 'Dashboard',
  Settings = 'Settings',

  login = 'login',

  // Super Admin

  Organization = 'Organization',

  // System Admin

  RoleManagement = 'Role Management',
  UserManagement = 'User Management',
  Employees = 'Employees',
  Configuration = 'Configuration',

  // Utility Billing

  Customers = 'Customers',
  Accounts = 'Accounts',
  Premises = 'Premises',
  Meters = 'Meters',
  MeterList = 'Meter List',
  MeterInstallation = 'Meter Installation',
  MeterReaderSchedule = 'Utility Schedule',
  MeterReadOrderCreation = 'Order Creation',
  MeterReadings = 'Meter Readings',
  MeterRemoval = 'Meter Removal',
  MeterReplacement = 'Meter Replacement',
  MeterReadingValidations = 'Meter Reading Validations',
  Contracts = 'Contracts',
  ContractList = 'Contract List',
  CreateContract = 'Create Contract',
  Billing = 'Billing',
  BillingDocument = 'Billing Document',
  BillingValidations = 'Billing Validations',
  MassBilling = 'Mass Billing',
  Invoices = 'Invoices',
  InvoiceList = 'Invoice List',
  MassInvoice = 'Mass Invoice',

  UpdatePersonalInformation = 'Update Personal Information',
  Requests = 'Requests',
  StartService = 'Start Service',
  StopServices = 'Stop Service',
  TransferService = 'Transfer Service',
  ServiceOrders = 'Service Orders',
  ViewAllRequest = 'View All Request',
  Parcel = 'Parcel',
  ServiceRequest = 'Service Request',
  Cases = 'Cases',
  EducationEventList = 'Education Events List',
  Calendar = 'Calendar',

  // Customer

  HomePage = 'Home Page',
  AccountDetails = 'Account Details',
  AutomaticPayments = 'Automatic Payments',

  AccountUsers = 'Account Users',
  Payments = 'Payments',
  PaymentLots = 'Payment Lots',

  Map = 'Map',
  EducationEvents = 'Education Events',
  FinancialTransactions = 'Financial Transactions',
  SecurityDeposit = 'Security Deposit',

  Reports = 'Reports',
  SocialMediaIntegration = 'Social Media Integration',
  SocialMediaCalender = 'Social Media Calendar',
  SocialMediaPosts = 'Social Media Post',
  RequestBulkPickup = 'Request Bulk Pickup',
  ReportMissedCollection = 'Report Missed Collection',
  Licenses = 'Licenses',
  LicenceListing = 'License list',
  LicenceApplication = 'License Application',
  PermitList = 'Permit List',
  PermitApplication = "Permit Application"
}

type PageIdentifierValue = (typeof PageIdentifier)[keyof typeof PageIdentifier]

// Define possible actions
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'

// Define possible subjects
export type Subjects = PageIdentifierValue | 'all' | 'none'

// **Ability** type using CASL’s PureAbility
export type AppAbility = PureAbility<[Actions, Subjects]>

/**
 * A small type for controlling ACL checks in your `<AclGuard>`.
 */
export type ACLObj = {
  action: Actions
  subject: Subjects
}

/**
 * Default ACL object: grants "manage" on "all".
 * (You can change this to be more restrictive, e.g. `action: 'none'`, `subject: 'none'`)
 */
export const defaultACLObj: ACLObj = {
  action: 'read', // or even deny all access
  subject: 'none'
}

// Helper to map module keys to PageIdentifier
function findPageIdentifier(moduleKey: string): PageIdentifier | null {
  const entry = Object.entries(PageIdentifier).find(([, value]) => value === moduleKey)

  return entry ? (entry[1] as PageIdentifier) : null
}

/**
 * Defines CASL rules based on the user’s role data.
 * By default, we start by denying everything (`cannot('manage', 'all')`),
 * then specifically enable modules that the user has permission for.
 */
function defineRulesFor(applicationData: AppDetail[]): PureAbility<[Actions, Subjects]> {
  // CASL’s recommended pattern: create an AbilityBuilder for a typed ability
  const builder = new AbilityBuilder<PureAbility<[Actions, Subjects]>>(PureAbility)

  const { can, cannot } = builder

  // 1. Deny all by default
  cannot('manage', 'all')
  can('manage', PageIdentifier.login)

  // 2. Grab roleKey and app type from localStorage
  const roleKey = localStorage.getItem('roleKey')
  const currentAppType = localStorage.getItem('currentAppType')

  // console.log('Retrieved from localStorage:', {
  //   roleKey,
  //   currentAppType,
  //   hasApplicationData: !!applicationData
  // })

  // If missing data, no further grants
  if (!roleKey || !currentAppType || !applicationData) {
    //   console.log('Missing required data - returning default "deny all" rules.')

    return new PureAbility<[Actions, Subjects]>(builder.rules)
  }

  // 3. Find the matching app
  const currentApp = applicationData.find(app => app.applicationName === currentAppType)

  // console.log('Found application:', {
  //   searched: currentAppType,
  //   found: !!currentApp,
  //   appName: currentApp?.applicationName
  // })

  if (!currentApp) {
    // console.log('No matching application found, keep all denied.')

    return new PureAbility<[Actions, Subjects]>(builder.rules)
  }

  // 4. Find role details
  const roleDetail = currentApp.roleDetails?.find(rd => rd.roleKey === roleKey)

  // console.log('Found role details:', {
  //   searched: roleKey,
  //   found: !!roleDetail,
  //   roleKey: roleDetail?.roleKey
  // })

  if (!roleDetail) {
    // console.log('No matching role detail found, keep all denied.')

    return new PureAbility<[Actions, Subjects]>(builder.rules)
  }

  // 5. Grant permissions for each module and submodule

  // console.log('Processing permissions for modules:')
  roleDetail.moduleData.forEach(module => {
    const modulePageId = findPageIdentifier(module.moduleKey)

    // console.log(`Module: ${module.moduleKey}`, {
    //   foundPageId: modulePageId,
    //   permissions: module.modulePermissions
    // })

    if (modulePageId) {
      // Grant "manage" on the identified page
      can('manage', modulePageId)

      // console.log(`✅ Granted "manage" permission for: ${modulePageId}`)
    }

    // SubModules
    module.subModuleData?.forEach(subModule => {
      if (!subModule.subModuleKey) return
      const subModulePageId = findPageIdentifier(subModule.subModuleKey)

      // console.log(`  SubModule: ${subModule.subModuleKey}`, {
      //   foundPageId: subModulePageId,
      //   permissions: subModule.subModulePermissions
      // })

      if (subModulePageId) {
        can('manage', subModulePageId)

        //  console.log(`  ✅ Granted "manage" permission for: ${subModulePageId}`)
      }
    })
  })

  //  console.log('Final ability rules from builder:', builder.rules)

  // Return a new typed PureAbility instance from the built rules
  return new PureAbility<[Actions, Subjects]>(builder.rules, {
    detectSubjectType: (object: { type: string } | undefined): Subjects => (object?.type as Subjects) || 'all'
  })
}

/**
 * Builds a typed ability object for the given appDetails.
 * Used in your <AclGuard> to check whether a user can do certain actions.
 */
export function buildAbilityFor(appDetails: AppDetail[]): AppAbility {
  return defineRulesFor(appDetails)
}

export default defineRulesFor
