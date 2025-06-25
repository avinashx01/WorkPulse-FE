import { useEffect, useRef, useState } from 'react'

import Button from '@mui/material/Button'
import { CSVLink } from 'react-csv'

import toast from 'react-hot-toast'
import * as XLSX from 'xlsx';
import { Menu, MenuItem } from '@mui/material'

import Icon from '@/@core/components/icon'
import type { DateType } from '@/types/reactDatepickerTypes'


export type CustomerExport = {
  id: string
  accountName: string
  email: string
  serviceLocation: string
  firstName: string
  lastName: string
  customerSequence: string
  mailingAddress: string
  accountType: string
  neighborhood: string
  phoneNo: string
  websiteUrl: string
}

export type DeviceExport = {
  id: string
  serial: string
  type: string
  manufacturer: string
  serviceAddress: string
  deviceSequence: string
  meterNumber: string
  assemblyLocation: string
  model: string
  size: string
  status: boolean
  hazardType: string
  installDate: Date
  nextTestDueDate: Date
  lastTestDate: Date
  testingFrequencies: string
  notificationMonth: string
  lastNotifiedAt: Date
  notificationStatus: string
  testStatus: string
  winterization: boolean
}

export type TesterExport = {
  id: string
  certificateNo: string
  technicianName: string
  calibrationExpirationDate: DateType
  certificateExpirationDate: DateType
  testerSequence: string
  testerUserId: string
  testerEmail: string
  accountName: string
  mailingAddress: string
  telephoneNumber: string
  gaugeSerialNo: string
  gaugeModel: string
  gaugeManufacturer: string
  gcAcknowledgementExpirationDate: Date
  businessLicenseExpirationDate: Date
}

export type TestExport = {
  id: string
  testSequence: string
  accountName: string
  dateOfTest: Date
  testStatus: string
  invoiceId?: string
  contactName: string
  mailingAddress: string
  telephone: string
  serviceLocation: string
  testResult: string
  submissionStatus: string
  serial: string
  meterNumber: string
  waterPurveyor: string
  submissionMethod: string
  installDate: Date
  type: string
  manufacturer: string
  model: string
  size: string
  timeOfTest: Date
  initialTest: string
  dom: boolean
  fire: boolean
  combo: boolean
  irrigation: boolean
  other: boolean
  linePressure: string
  apparentPressureCV1: string
  cv1Leaked: string
  cv1LeakedValue: boolean
  cv1ClosedAt: string
  cv1ClosedAtValue: boolean
  cv1Passed: boolean
  cv1Failed: boolean
  cv1FinalClosedAt: string
  cv1FinalClosedAtValue: boolean
  cv1FinalTestPassed: boolean
  cv1FinalTestFailed: boolean
  cv2Leaked: string

  cv2LeakedValue: boolean
  cv2ClosedAt: string
  cv2ClosedAtValue: boolean
  cv2Passed: boolean
  cv2Failed: boolean
  cv2FinalClosedAt: string
  cv2FinalClosedAtValue: boolean
  cv2FinalTestPassed: boolean
  cv2FinalTestFailed: boolean
  dprvOpenedAt: string
  dprvOpenedAtValue: boolean
  dprvNotOpen: string
  dprvNotOpenValue: boolean
  dprvPassed: boolean
  dprvFailed: boolean
  dprvFinalOpenedAt: string
  dprvFinalOpenedAtValue: boolean
  dprvFinalTestPassed: boolean
  dprvFinalTestFailed: boolean
  pvbAirInletOpenedAt: string
  pvbAirInletOpenedAtValue: boolean
  pvbNotOpen: string
  pvbNotOpenValue: boolean
  pvbPassed: boolean
  pvbFailed: boolean
  pvbFinalTestPassed: boolean
  pvbFinalTestFailed: boolean
  bfpTestKit: string
  testKitManufacturer: string
  testKitModel: string
  testKitSerial: string
  calibrationExpDate: Date
  company: string
  remarks: string
  testedBy: string
  repairedBy: string
  signature: string
  finalTestBy: string
  trainingCertificationNo: string
  certificationExpirationDate: Date
  turnWaterOn: boolean
  finalTestAmount: string
  paymentStatus: string
  paymentIntent: string
  approvedDevice: boolean
  properInstallation: boolean
  locationType: string
  downStreamProcess: string
  email: string
  testFrequency: string
  cv1Cleaned: boolean
  cv1Disc: boolean
  cv1Spring: boolean
  cv1Guide: boolean
  cv1PinRetainer: boolean
  cv1HingePin: boolean
  cv1Seal: boolean
  cv1Diaphragm: boolean
  cv1Rings: boolean
  cv1TestCocks: boolean
  cv1CompleteRepairkit: boolean
  cv1Others: boolean
  cv1Repaired: boolean
  cv1Replaced: boolean
  cv2Cleaned: boolean
  cv2Disc: boolean
  cv2Spring: boolean
  cv2Guide: boolean
  cv2PinRetainer: boolean
  cv2HingePin: boolean
  cv2Seal: boolean
  cv2Diaphragm: boolean
  cv2Rings: boolean
  cv2TestCocks: boolean
  cv2CompleteRepairkit: boolean
  cv2Others: boolean
  cv2Repaired: boolean
  cv2Replaced: boolean
  dprvCleaned: boolean
  dprvDisc: boolean
  dprvSpring: boolean
  dprvDiaphragm: boolean
  dprvSpacer: boolean
  dprvRings: boolean
  dprvSeat: boolean
  dprvCompleteRepairkit: boolean
  dprvOthers: boolean
  dprvRepaired: boolean
  dprvReplaced: boolean
  pvbLeakedAt: boolean
  pvbClosedAt: boolean
  pvbCleaned: boolean
  pvbCvAssembly: boolean
  pvbDiscAirInlet: boolean
  pvbCvDisc: boolean
  pvbSpring: boolean
  pvbRetainer: boolean
  pvbGuide: boolean
  pvbBonnet: boolean
  pvbOthers: boolean
  pvbRepaired: boolean
  pvbReplaced: boolean
  repairTestDate: Date
  repairTestTime: Date
  repairTestLinePressure: string
}

export type InvoiceExport = {
  id: string
  accountName: string
  invoiceDate: string
  dueDate: string
  total: string
  invoiceStatus: string
  testerName: string
  invoiceSequence: string
  email: string
  terms: string
  subTotal: string
  discount: string
  tax: string
  note: string
  paymentIntent: string
  paymentStatus: string
}

export type PaymentExport = {
  id: string
  paymentMethodType: string
  amount: string
  dateOfPayment: string
  status: string
  paymentSequence: string
  customerId: string
  subscriptionId: string
  productId: string
  priceId: string
  collectionMethod: string
  stripeInvoiceId: string
  accountName: string
  paymentMethod: string
  paymentIntent: string
  currencyType: string
  paymentFor: string
}

export type ZeroConsumptionReportTypesE = {
  id: string
  date: string
  address: string
  mxu: string
  meterId: string
  dateStopped: string
  daysWithZeroConsumption: string
  averageDailyUse: string
  estimatedWaterLost: string
  totalEstimatedWaterLost: string
}

export type SalesTaxReportExport = {
  location: string
  totalInvoice: string
  invoiceAmount: string
  locationTaxRate: string
  locationTaxAmount: string
}

export type NotificationExport = {
  id: string
  notificationDate: string
  notificationType: string
  devices: string
  customers: string
  status: string
  schedule: string
}

type ExportToCsvButtonProps<Data> = {
  getDataAsync: () => Promise<Data[]>
  headersArray: { label: string; key: string }[]
  fileNameInputs: string
  params?: { value: string }
}

/**
 *
 * @param getDataAsync: Promise<{ [key: string]: string }[]>  returns a array of object with the key mapped as the id to the headersArray arrays and label
 * @param headersArray: { label: string; key: string }[]  label represents column name of csv  and key is to map the data to the csv
 * headersArray example [{ id: 'Ahmed', accountName: 'Tomi', email: 'ah@smthing.co.com', serviceLocation: '' }]
 * @returns
 */
const ExportToCsvButton = <Data extends object>({
  getDataAsync,
  headersArray,
  fileNameInputs
}: ExportToCsvButtonProps<Data>) => {
  const [data, setData] = useState<Data[]>([])
  const [headers] = useState<{ label: string; key: string }[]>(headersArray)

  const [csvFileName] = useState<string>(fileNameInputs)

  const [dataFetched, setDataFetched] = useState(false)

  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (dataFetched) {
      if (ref && ref.current && typeof ref.current.click !== undefined) {
        ref.current.click()
      }

      setDataFetched(false)
    }
  }, [data, dataFetched])

  const getAllCustomersData = async () => {
    try {
      const data = await getDataAsync()

      setData(data)
      setDataFetched(true)


    } catch (error) {
      console.error(error)
      toast.error('Unable to export please try after sometime')
    }
  }

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

   // Export to XLSX
   const exportToXLSX = async() => {

  const data =  await getDataAsync()

  if(!data){
    return
  }

    // Extract column headers (labels) from the headers array
    const headerLabels = headers.map((col) => col.label);

    // Create a sheet with rows and column headers
    const sheetData = data.map((row:any) =>
      headers.map((col:any) => row[col.key])  // Use 'key' to get the data from each row
    );

    // Create a sheet with the header and data
    const ws = XLSX.utils.aoa_to_sheet([headerLabels, ...sheetData]);

    // Create a workbook and append the sheet
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Write the file
    XLSX.writeFile(wb, csvFileName+'.xlsx');
    handleMenuClose();
  };

  return (
    <>

     <Button
        color="secondary"
        variant="outlined"
        startIcon={<Icon icon="bx:upload" fontSize={20} />}
        onClick={handleMenuOpen}
      >
        Export
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem  onClick={getAllCustomersData}>
        <Icon icon="ph:file-csv" fontSize={25} /> Download as CSV</MenuItem>
        <MenuItem onClick={exportToXLSX}>
        <Icon icon="bi:filetype-xlsx" fontSize={25} /> Download as XLSX</MenuItem>
      </Menu>


      <CSVLink data={data} headers={headers} filename={csvFileName}>
        <span ref={ref}></span>
      </CSVLink>
    </>
  )
}

export default ExportToCsvButton
