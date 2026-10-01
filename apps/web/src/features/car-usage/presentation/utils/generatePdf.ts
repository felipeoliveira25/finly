import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CarUsageReport } from '../../domain/carUsageReport/model'
import { formatCurrency, formatDate, formatKm } from './format'

const COLORS = {
  primary: [34, 197, 94] as [number, number, number],     // green accent
  negative: [239, 68, 68] as [number, number, number],    // red
  text: [15, 23, 42] as [number, number, number],         // slate-900
  muted: [100, 116, 139] as [number, number, number],     // slate-500
  border: [226, 232, 240] as [number, number, number],    // slate-200
  surface: [248, 250, 252] as [number, number, number],   // slate-50
}

function centsToBRL(cents: number): string {
  return formatCurrency(cents)
}

export function generateCarUsagePdf(
  report: CarUsageReport,
  label?: string,
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14
  const contentW = pageW - margin * 2
  let y = margin

  // ── Header ─────────────────────────────────────────────────────────────────
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, pageW, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Finly', margin, 12)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Controle de Uso do Carro', margin, 19)

  // Date generated (top right)
  const now = new Date()
  const generatedAt = now.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Recife',
  })
  doc.setFontSize(8)
  doc.text(`Gerado em ${generatedAt}`, pageW - margin, 19, { align: 'right' })

  y = 36

  // ── Period title ───────────────────────────────────────────────────────────
  doc.setTextColor(...COLORS.text)
  if (label) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(label, margin, y)
    y += 6
  }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.muted)
  doc.text(
    `${formatDate(report.startDate)} → ${formatDate(report.endDate)}`,
    margin,
    y,
  )
  y += 10

  // ── Summary box ────────────────────────────────────────────────────────────
  const boxH = report.totalParkingCents > 0 || report.totalFuelRefillCents > 0 ? 46 : 30
  doc.setFillColor(...COLORS.surface)
  doc.setDrawColor(...COLORS.border)
  doc.roundedRect(margin, y, contentW, boxH, 3, 3, 'FD')

  const col1 = margin + 5
  const col2 = margin + contentW / 2
  let sy = y + 8

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.muted)
  doc.text('RESUMO DO PERÍODO', col1, sy)
  sy += 7

  // Row: km + trips cost
  doc.setTextColor(...COLORS.text)
  doc.setFontSize(10)
  doc.text('Total km percorridos', col1, sy)
  doc.text(formatKm(report.totalKmMeters), col1 + 80, sy, { align: 'right' })

  const tripsCostCents =
    report.totalCostCents - report.totalParkingCents + report.totalFuelRefillCents
  doc.text('Custo dos trajetos', col2, sy)
  doc.text(centsToBRL(tripsCostCents), col2 + 80, sy, { align: 'right' })
  sy += 6

  // Parking / fuel rows (only if present)
  if (report.totalParkingCents > 0) {
    doc.setTextColor(...COLORS.muted)
    doc.setFontSize(9)
    doc.text('Estacionamento', col1, sy)
    doc.setTextColor(...COLORS.negative)
    doc.text(`+ ${centsToBRL(report.totalParkingCents)}`, col1 + 80, sy, { align: 'right' })
    sy += 5
  }

  if (report.totalFuelRefillCents > 0) {
    doc.setTextColor(...COLORS.muted)
    doc.setFontSize(9)
    doc.text('Abastecimento (meu cartão)', col1, sy)
    doc.setTextColor(...COLORS.primary)
    doc.text(`− ${centsToBRL(report.totalFuelRefillCents)}`, col1 + 80, sy, { align: 'right' })
    sy += 5
  }

  // Separator
  doc.setDrawColor(...COLORS.border)
  doc.line(col1, sy, margin + contentW - 5, sy)
  sy += 5

  // Net total — larger, prominent
  doc.setTextColor(...COLORS.text)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Total a reembolsar', col1, sy)
  doc.setTextColor(...COLORS.negative)
  doc.setFontSize(12)
  doc.text(centsToBRL(report.totalCostCents), margin + contentW - 5, sy, { align: 'right' })

  y += boxH + 8

  // ── Day-by-day table ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.muted)
  doc.text('DETALHAMENTO POR DIA', margin, y)
  y += 4

  type Row = (string | { content: string; styles: object })[]
  const tableRows: Row[] = []

  for (const day of report.days) {
    const dateLabel = formatDate(day.date)
    let firstInDay = true

    const addRow = (desc: string, km: string, value: string, valueColor: string) => {
      tableRows.push([
        { content: firstInDay ? dateLabel : '', styles: { fontStyle: 'bold', textColor: COLORS.text } },
        desc,
        km,
        { content: value, styles: { textColor: valueColor === 'red' ? COLORS.negative : valueColor === 'green' ? COLORS.primary : COLORS.text, halign: 'right' } },
      ])
      firstInDay = false
    }

    for (const trip of day.trips) {
      const name = trip.fixedRouteName ?? trip.description ?? 'Trajeto avulso'
      addRow(name, formatKm(trip.distanceMeters), centsToBRL(trip.costCents), 'default')
    }

    for (const fee of day.parkingFees) {
      const desc = fee.description ? `Estacionamento — ${fee.description}` : 'Estacionamento (Sem Parar)'
      addRow(desc, '—', `+ ${centsToBRL(fee.amountCents)}`, 'red')
    }

    for (const refill of day.fuelRefills) {
      const desc = refill.description ? `Abastecimento — ${refill.description}` : 'Abastecimento (meu cartão)'
      addRow(desc, '—', `− ${centsToBRL(refill.amountCents)}`, 'green')
    }

    // Day subtotal row
    tableRows.push([
      '',
      '',
      '',
      {
        content: centsToBRL(day.totalCostCents),
        styles: {
          fontStyle: 'bold',
          textColor: COLORS.negative,
          halign: 'right',
          fillColor: COLORS.surface,
        },
      },
    ])
  }

  autoTable(doc, {
    startY: y,
    head: [['Data', 'Descrição', 'Km', 'Valor']],
    body: tableRows,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: COLORS.text,
      lineColor: COLORS.border,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 22, halign: 'right' },
      3: { cellWidth: 42, halign: 'right' },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    didParseCell: (data) => {
      // subtotal rows: light background
      const cell = data.cell
      const raw = cell.raw
      if (
        data.section === 'body' &&
        data.column.index === 3 &&
        typeof raw === 'object' &&
        raw !== null &&
        'styles' in raw &&
        (raw as { styles: { fillColor?: unknown } }).styles.fillColor
      ) {
        cell.styles.fillColor = COLORS.surface
      }
    },
  })

  // ── Footer ─────────────────────────────────────────────────────────────────
  const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const pageH = doc.internal.pageSize.getHeight()
    doc.setFontSize(8)
    doc.setTextColor(...COLORS.muted)
    doc.text(
      `Finly — Página ${i} de ${pageCount}`,
      pageW / 2,
      pageH - 8,
      { align: 'center' },
    )
  }

  // ── Download ───────────────────────────────────────────────────────────────
  const safeLabel = (label ?? `${report.startDate}_${report.endDate}`).replace(/[^a-z0-9]/gi, '_')
  doc.save(`finly_carro_${safeLabel}.pdf`)
}
