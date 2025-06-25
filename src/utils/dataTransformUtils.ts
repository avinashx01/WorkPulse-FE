export const transformFormDataToApiFormat = (formData: any) => {
  const { business, license, ownership, revenue, fees, categoryCode, fileuploadIds, type } = formData;

  console.log(type);

  return {
    formValue: {
      // Transform from snake_case to camelCase
      taxId: business.tax_Id,
      businessName: business.business_Name,
      businessDescription: business.business_Description,
      businessStartDate: business.business_Start_Date,
      licenseCategoryCode: categoryCode,
      type:type,

      // Address information
      locationAddress: `${business.addressLine1},${business.addressLine2},${business.city},${business.state},${business.zipCode}`,
      mailingAddress: business.isMailingAddressSame ?
        `${business.addressLine1},${business.addressLine2},${business.city},${business.state},${business.zipCode}` :
        `${business.mailingAddressLine1},${business.mailingAddressLine2},${business.mailingCity},${business.mailingState},${business.mailingZipCode}`,

      // Contact information
      businessPhoneNo: business.business_PhoneNo,
      mobilePhone: business.business_MobileNo,
      email: business.email,
      careOfName: business.care_Of_Name,

      // Business classification
      businessOwnershipType: business.business_Ownership_Type,
      incorporatedState: business.incorporated_State,
      incorporatedDate: business.incorporated_Date,
      citizenshipStatus: business.citizenship_Status,
      selfOwnedBusiness: business.self_Owned_Business,
      homeBasedBusiness: business.home_Based_Business,
      specialType: business.special_Type,

      // Industry codes
      naicCode: business.naic_Code,
      naicDescription: business.naic_Description,
      sicCode: business.sic_Code,
      sicDescription: business.sic_Description,

      // Additional fields from business
      tin: business.tin,
      salesTaxId: business.salesTaxId,
      industryDescription: business.industryDescription,

      // License information
      licenseType: license.license_Type,
      licenseDescription: license.license_Description,
      licenseNumber: license.license_Number,
      licenseExpiratonDate: license.license_Expiraton_Date,
      alcoholLicense: license.alcohol_License,
      isBusinessRequiredToHaveStateLicense: license.isBusinessRequiredToHaveStateLicense,
      ForPractitionersOfAProfession: license.forPractitionersOfAProfession || '',
      numberOfPractitioners: license.numberOfPractitioners || '',

      // Revenue information
      year: revenue.year,
      noOfEmployees: revenue.no_Of_Employees,
      estimatedRevenue: revenue.estimated_Revenue,
      eVerifyNumber: revenue.e_Verify_Number,
      eVerifyDate: revenue.e_Verify_Date,
      taxRate: revenue.tax_Rate,
      taxOccupationTax_Due: revenue.tax_Occupation_Tax_Due,

      // Fees
      taxProfFees: fees.tax_Prof_Fees,
      adminFee: fees.admin_Fee,
      lateFilingFee: fees.late_Filing_Fee,
      latePaymentFee: fees.late_Payment_Fee,
      interest: fees.interest,
      invoiceAmount: fees.invoice_Amount,

      // These will be overridden in Step7
      organizationId: 2,
      userId: formData.userId || null,
      customerUsersId: null,
      customerId: business.customerId || null,
      createdBy: "system",
      updatedBy: "system"
    },

    // Transform ownership data
    lineItemValue: ownership.map((item: {
      owner_Type: string;
      primary_Firstname: string;
      primary_Lastname: string;
      organization_Name: any;
      primary_Contact_PhoneNo: any;
      primary_Contact_Email: any;
      business_Owner_AddressLine1: any;
      business_Owner_AddressLine2: any;
      business_Owner_City: any;
      business_Owner_State: any;
      business_Owner_ZipCode: any;
      primary_Business_Owner: any;
      primary_Registered_Agent: any;
      primary_Alcohol_Licensee: any;
      forPractitionersOfAProfession: any;
      numberOfPractitioners: any;
    }) => {
      return {
        ownerType: item.owner_Type.toLowerCase(),
        firstname: item.primary_Firstname,
        lastname: item.primary_Lastname,
        name: item.organization_Name || item.primary_Firstname + " " + item.primary_Lastname,
        contactPhoneNo: item.primary_Contact_PhoneNo,
        contactEmail: item.primary_Contact_Email,
        ownerAddress: `${item.business_Owner_AddressLine1},${item.business_Owner_AddressLine2},${item.business_Owner_City},${item.business_Owner_State},${item.business_Owner_ZipCode}`,
        businessOwner: item.primary_Business_Owner,
        registeredAgent: item.primary_Registered_Agent,
        alcoholLicensee: item.primary_Alcohol_Licensee,

        // ForPractitionersOfAProfession: item.forPractitionersOfAProfession || "",
        // numberOfPractitioners: item.numberOfPractitioners || 0
      };
    }),

    // Comments
    blmApplicationComments: [
      {
        description: "Submitted via web form",
        commentType: "BLM_APP_COMM"
      }
    ],
    fileuploadIds: Array.isArray(fileuploadIds) ? fileuploadIds : []
  };
};