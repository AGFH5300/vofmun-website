/// <reference lib="webworker" />

import ExcelJS from "exceljs"

type WorkerRequest = {
  file: File
  requiredColumns: readonly string[]
}

type WorkerResponse = { ok: true } | { ok: false; error: string }

const normalizeCellValue = (value: unknown) => {
  if (value === null || value === undefined) return ""
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((segment) => segment.text).join("")
    }
    if ("result" in value && value.result !== undefined && value.result !== null) {
      return String(value.result)
    }
    if ("hyperlink" in value && typeof value.hyperlink === "string") {
      if ("text" in value && typeof value.text === "string") return value.text
      return value.hyperlink
    }
  }
  return String(value)
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  try {
    const { file, requiredColumns } = event.data
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      throw new Error("Please upload an .xlsx Excel spreadsheet using the official template.")
    }

    const workbook = new ExcelJS.Workbook()
    const arrayBuffer = await file.arrayBuffer()
    await workbook.xlsx.load(arrayBuffer)

    if (!workbook.worksheets.length) {
      throw new Error("The uploaded spreadsheet is empty. Please use the official template.")
    }

    const worksheet = workbook.worksheets[0]
    let headerRow: unknown[] | null = null

    for (let rowIndex = 1; rowIndex <= worksheet.rowCount; rowIndex += 1) {
      const row = worksheet.getRow(rowIndex)
      const rowValues = row.values.slice(1) as unknown[]
      const hasContent = rowValues.some((cell) => normalizeCellValue(cell).trim().length > 0)

      if (hasContent) {
        headerRow = rowValues
        break
      }
    }

    if (!headerRow) {
      throw new Error("Unable to read the spreadsheet header. Please ensure the template headers are present.")
    }

    const headers = headerRow.map((cell) => normalizeCellValue(cell).trim())
    const missingColumns = requiredColumns.filter((column) => !headers.includes(column))

    if (missingColumns.length > 0) {
      throw new Error(
        `The spreadsheet is missing the following required column${missingColumns.length > 1 ? "s" : ""}: ${missingColumns.join(", ")}.`
      )
    }

    const response: WorkerResponse = { ok: true }
    self.postMessage(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to validate the uploaded spreadsheet."
    const response: WorkerResponse = { ok: false, error: message }
    self.postMessage(response)
  }
}

export {}
