import type { Contact, ContactFormData } from '../types'

export interface CSVExportOptions {
  includeFields: (keyof Contact)[]
  filename?: string
  includeHeaders?: boolean
}

export interface CSVImportResult {
  success: boolean
  contacts: ContactFormData[]
  errors: string[]
  totalRows: number
  successfulRows: number
}

export interface CSVFieldMapping {
  csvColumn: string
  contactField: keyof ContactFormData
}

// Default field mappings for CSV import
export const DEFAULT_CSV_MAPPINGS: CSVFieldMapping[] = [
  { csvColumn: 'Name', contactField: 'name' },
  { csvColumn: 'Email', contactField: 'email' },
  { csvColumn: 'Phone', contactField: 'phone' },
  { csvColumn: 'Address', contactField: 'address' },
  { csvColumn: 'Notes', contactField: 'notes' },
  { csvColumn: 'Tags', contactField: 'tags' },
]

// Export contacts to CSV
export const exportContactsToCSV = (
  contacts: Contact[],
  options: CSVExportOptions = {
    includeFields: ['name', 'email', 'phone', 'address', 'notes', 'tags'],
    includeHeaders: true,
    filename: `contacts-${new Date().toISOString().split('T')[0]}.csv`,
  }
): void => {
  const { includeFields, includeHeaders, filename } = options

  // Create CSV content
  let csvContent = ''

  // Add headers if requested
  if (includeHeaders) {
    const headers = includeFields.map(field => {
      switch (field) {
        case 'name':
          return 'Name'
        case 'email':
          return 'Email'
        case 'phone':
          return 'Phone'
        case 'address':
          return 'Address'
        case 'notes':
          return 'Notes'
        case 'tags':
          return 'Tags'
        case 'dateCreated':
          return 'Created At'
        case 'dateModified':
          return 'Updated At'
        default:
          return field
      }
    })
    csvContent += headers.join(',') + '\n'
  }

  // Add contact data
  contacts.forEach(contact => {
    const row = includeFields.map(field => {
      let value = contact[field]

      // Handle special field types
      if (field === 'tags' && Array.isArray(value)) {
        value = value.join(';')
      } else if (field === 'dateCreated' || field === 'dateModified') {
        value = value instanceof Date ? value.toISOString() : value
      }

      // Escape commas and quotes in CSV
      const stringValue = String(value || '')
      if (
        stringValue.includes(',') ||
        stringValue.includes('"') ||
        stringValue.includes('\n')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
    csvContent += row.join(',') + '\n'
  })

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename || 'contacts.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Parse CSV content
export const parseCSV = (csvContent: string): string[][] => {
  const lines = csvContent.split('\n').filter(line => line.trim())
  const result: string[][] = []

  for (const line of lines) {
    const row: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"'
          i++ // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    // Add last field
    row.push(current.trim())
    result.push(row)
  }

  return result
}

// Import contacts from CSV
export const importContactsFromCSV = (
  csvContent: string,
  fieldMappings: CSVFieldMapping[]
): CSVImportResult => {
  const result: CSVImportResult = {
    success: false,
    contacts: [],
    errors: [],
    totalRows: 0,
    successfulRows: 0,
  }

  try {
    const rows = parseCSV(csvContent)

    if (rows.length === 0) {
      result.errors.push('CSV file is empty')
      return result
    }

    // Assume first row contains headers
    const headers = rows[0]
    const dataRows = rows.slice(1)
    result.totalRows = dataRows.length

    // Create mapping from CSV column index to contact field
    const columnMappings: { [index: number]: keyof ContactFormData } = {}

    fieldMappings.forEach(mapping => {
      const columnIndex = headers.findIndex(
        header =>
          header.toLowerCase().trim() === mapping.csvColumn.toLowerCase().trim()
      )
      if (columnIndex !== -1) {
        columnMappings[columnIndex] = mapping.contactField
      }
    })

    // Process each data row
    dataRows.forEach((row, rowIndex) => {
      try {
        const contact: ContactFormData = {
          name: '',
          email: '',
          phone: '',
          address: '',
          notes: '',
          tags: [],
        }

        // Map CSV columns to contact fields
        row.forEach((value, columnIndex) => {
          const field = columnMappings[columnIndex]
          if (field && value.trim()) {
            if (field === 'tags') {
              // Split tags by semicolon
              contact.tags = value
                .split(';')
                .map(tag => tag.trim())
                .filter(tag => tag)
            } else {
              contact[field] = value.trim()
            }
          }
        })

        // Validate required fields
        if (!contact.name) {
          result.errors.push(`Row ${rowIndex + 2}: Name is required`)
          return
        }

        if (!contact.email) {
          result.errors.push(`Row ${rowIndex + 2}: Email is required`)
          return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(contact.email)) {
          result.errors.push(`Row ${rowIndex + 2}: Invalid email format`)
          return
        }

        result.contacts.push(contact)
        result.successfulRows++
      } catch (error) {
        result.errors.push(
          `Row ${rowIndex + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    })

    result.success = result.successfulRows > 0
  } catch (error) {
    result.errors.push(
      `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }

  return result
}

// Generate sample CSV content for download
export const generateSampleCSV = (): string => {
  const headers = ['Name', 'Email', 'Phone', 'Address', 'Notes', 'Tags']
  const sampleData = [
    [
      'John Doe',
      'john.doe@example.com',
      '+1 (555) 123-4567',
      '123 Main St, New York, NY',
      'Software engineer',
      'work;developer',
    ],
    [
      'Jane Smith',
      'jane.smith@company.com',
      '+1 (555) 987-6543',
      '456 Oak Ave, San Francisco, CA',
      'Product manager',
      'work;manager',
    ],
    [
      'Mike Johnson',
      'mike.j@email.com',
      '+1 (555) 456-7890',
      '789 Pine St, Seattle, WA',
      'Freelance designer',
      'freelance;creative',
    ],
  ]

  let csvContent = headers.join(',') + '\n'
  sampleData.forEach(row => {
    csvContent += row.join(',') + '\n'
  })

  return csvContent
}
