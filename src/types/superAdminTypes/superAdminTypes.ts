export type AdminOrganizationType = {
    id: string
    organizationName?: string
    organizationDescription: string
    organizationLogo: string
    organizationType: string
    phoneNo: string
    addressLine1: string
    addressLine2: string
    streetNumber: string
    streetName: string
    apartment: string
    city: string
    state: string
    postalCode: string
    isActive: boolean
    emailId: string
    organizationShortName: string
    utilityName?: string
    utilityLocationId? : string
    submissionMethod?: string
    contactPerson?: string
    superAdminOrgId?: string
    utilityLocation?: string

    latitude: string
    longitude: string
    timeZone?: string
    country?: string
}
