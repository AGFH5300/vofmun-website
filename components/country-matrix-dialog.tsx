// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

"use client"

import { useEffect, useMemo, useState } from "react"

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

type MatrixAssignment = {
  optionCode: string
  assignedName: string
}

export function CountryMatrixDialog({ committeeName, matrix, buttonClassName }: CountryMatrixDialogProps) {
  const [assignments, setAssignments] = useState<MatrixAssignment[]>([])
  const hasRows = matrix.rows.length > 0

  useEffect(() => {
    let isMounted = true

    const loadAssignments = async () => {
      try {
        const response = await fetch(`/api/country-matrix/assignments?committee=${encodeURIComponent(committeeName)}`)

        if (!response.ok) {
          return
        }

        const payload = await response.json()
        if (!isMounted) {
          return
        }

        setAssignments(Array.isArray(payload.assignments) ? payload.assignments : [])
      } catch {
        if (isMounted) {
          setAssignments([])
        }
      }
    }

    loadAssignments()

    return () => {
      isMounted = false
    }
  }, [committeeName])

  const assignmentMap = useMemo(() => {
    const assignmentEntries: Array<[string, string]> = assignments.map(({ optionCode, assignedName }) => [
      optionCode.trim().toLowerCase(),
      assignedName,
    ])
    return new Map<string, string>(assignmentEntries)
  }, [assignments])

  const headers = [...matrix.headers, "Assigned Delegate"]

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
                    {headers.map((header) => (
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
                      <TableCell>{assignmentMap.get(row[0]?.trim().toLowerCase() ?? "") ?? "—"}</TableCell>
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
