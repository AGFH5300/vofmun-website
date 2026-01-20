"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

export type CountryMatrix = {
  headers: string[]
  rows: string[][]
  updated?: string
}

interface CountryMatrixDialogProps {
  committeeName: string
  matrix: CountryMatrix
  buttonClassName?: string
}

export function CountryMatrixDialog({ committeeName, matrix, buttonClassName }: CountryMatrixDialogProps) {
  const hasRows = matrix.rows.length > 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={buttonClassName}>
          <Users className="h-4 w-4 mr-2" />
          Country Matrix
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-[#B22222]">{committeeName} Country Matrix</DialogTitle>
          {matrix.updated ? (
            <p className="text-sm text-muted-foreground">Updated {matrix.updated}</p>
          ) : null}
        </DialogHeader>
        <div className="rounded-lg border border-gray-200 bg-white">
          {hasRows ? (
            <div className="max-h-[60vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {matrix.headers.map((header) => (
                      <TableHead key={header} className="whitespace-nowrap">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrix.rows.map((row, rowIndex) => (
                    <TableRow key={`${rowIndex}-${row.join("-")}`}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={`${rowIndex}-${cellIndex}`}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">
              The country matrix will be published here soon.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
