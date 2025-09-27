import React, { useState, useRef } from 'react'
import { FileDown } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Checkbox from '../ui/Checkbox'
import { useContacts } from '../../stores/contactStore'
import { useToast } from '../../hooks/useToast'
import {
  exportContactsToCSV,
  importContactsFromCSV,
  generateSampleCSV,
  DEFAULT_CSV_MAPPINGS,
  type CSVFieldMapping,
  type CSVImportResult,
} from '../../utils/csvUtils'
import type { Contact } from '../../types'

interface ImportExportModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'import' | 'export'
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  mode,
}) => {
  const { contacts, addContact } = useContacts()
  const {
    success: showSuccessToast,
    error: showErrorToast,
    warning: showWarningToast,
  } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Export state
  const [exportFields, setExportFields] = useState({
    name: true,
    email: true,
    phone: true,
    address: true,
    notes: true,
    tags: true,
    createdAt: false,
    updatedAt: false,
  })
  const [exportFilename, setExportFilename] = useState('')

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [fieldMappings] = useState<CSVFieldMapping[]>(DEFAULT_CSV_MAPPINGS)

  const handleExport = () => {
    const selectedFields = Object.entries(exportFields)
      .filter(([_, selected]) => selected)
      .map(([field]) => field as keyof Contact)

    if (selectedFields.length === 0) {
      showErrorToast(
        'Export Error',
        'Please select at least one field to export'
      )
      return
    }

    const filename =
      exportFilename || `contacts-${new Date().toISOString().split('T')[0]}.csv`

    exportContactsToCSV(contacts, {
      includeFields: selectedFields,
      filename,
      includeHeaders: true,
    })

    showSuccessToast(
      'Export Successful',
      `Exported ${contacts.length} contacts to ${filename}`
    )

    onClose()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      showErrorToast('Import Error', 'Please select a CSV file to import')
      return
    }

    setIsImporting(true)

    try {
      const csvContent = await importFile.text()
      const result = importContactsFromCSV(csvContent, fieldMappings)
      setImportResult(result)

      if (result.success && result.contacts.length > 0) {
        // Add contacts to store
        for (const contactData of result.contacts) {
          await addContact(contactData)
        }

        showSuccessToast(
          'Import Successful',
          `Successfully imported ${result.successfulRows} contacts`
        )

        if (result.errors.length > 0) {
          showWarningToast(
            'Import Warnings',
            `${result.errors.length} rows had errors. Check the import summary.`
          )
        }
      } else {
        showErrorToast(
          'Import Failed',
          result.errors[0] || 'No valid contacts found in the CSV file'
        )
      }
    } catch (error) {
      showErrorToast(
        'Import Error',
        error instanceof Error ? error.message : 'Failed to read CSV file'
      )
    } finally {
      setIsImporting(false)
    }
  }

  const handleDownloadSample = () => {
    const sampleCSV = generateSampleCSV()
    const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'sample-contacts.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showSuccessToast(
      'Sample Downloaded',
      'Sample CSV file downloaded successfully'
    )
  }

  const resetImport = () => {
    setImportFile(null)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetImport()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'export' ? 'Export Contacts' : 'Import Contacts'}
      size="lg"
    >
      {mode === 'export' ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Select Fields to Export
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(exportFields).map(([field, checked]) => (
                <Checkbox
                  key={field}
                  checked={checked}
                  onChange={checked =>
                    setExportFields(prev => ({ ...prev, [field]: checked }))
                  }
                  label={
                    field.charAt(0).toUpperCase() +
                    field.slice(1).replace(/([A-Z])/g, ' $1')
                  }
                />
              ))}
            </div>
          </div>

          <Input
            label="Filename (optional)"
            value={exportFilename}
            onChange={e => setExportFilename(e.target.value)}
            placeholder={`contacts-${new Date().toISOString().split('T')[0]}.csv`}
            helperText="Leave empty to use default filename"
          />

          <div className="flex justify-between">
            <div className="text-sm text-gray-600">
              {contacts.length} contacts will be exported
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleExport}>
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Import Contacts from CSV
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {importFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {importFile.name} (
                    {(importFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSample}
                  icon={FileDown}
                >
                  Download Sample CSV
                </Button>
                {importFile && (
                  <Button variant="ghost" size="sm" onClick={resetImport}>
                    Clear File
                  </Button>
                )}
              </div>
            </div>
          </div>

          {importResult && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Import Summary</h4>
              <div className="space-y-1 text-sm">
                <p>Total rows: {importResult.totalRows}</p>
                <p className="text-green-600">
                  Successful: {importResult.successfulRows}
                </p>
                {importResult.errors.length > 0 && (
                  <div>
                    <p className="text-red-600">
                      Errors: {importResult.errors.length}
                    </p>
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <p key={index} className="text-xs text-red-600">
                          • {error}
                        </p>
                      ))}
                      {importResult.errors.length > 5 && (
                        <p className="text-xs text-gray-500">
                          ... and {importResult.errors.length - 5} more errors
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <div className="text-sm text-gray-600">
              Expected format: Name, Email, Phone, Address, Notes, Tags
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                loading={isImporting}
                disabled={!importFile}
              >
                Import Contacts
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default ImportExportModal
