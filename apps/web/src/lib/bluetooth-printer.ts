/**
 * ESC/POS Bluetooth Thermal Printer Service
 * Optimized for 58mm thermal printers (e.g., VSC H-58BT 58mm)
 */

interface BluetoothRemoteGATTCharacteristic {
  uuid: string;
  properties: {
    write: boolean;
    writeWithoutResponse: boolean;
  };
  writeValueWithResponse(value: BufferSource): Promise<void>;
  writeValueWithoutResponse(value: BufferSource): Promise<void>;
}

interface BluetoothRemoteGATTService {
  uuid: string;
  getCharacteristics(): Promise<BluetoothRemoteGATTCharacteristic[]>;
}

interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryServices(): Promise<BluetoothRemoteGATTService[]>;
}

interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
}

declare global {
  interface Navigator {
    bluetooth: {
      requestDevice(options: {
        acceptAllDevices?: boolean;
        optionalServices?: string[];
      }): Promise<BluetoothDevice>;
    };
  }
}

export interface ReceiptPrintData {
  title?: string;
  storeAddress?: string;
  orderNumber: string;
  date: string;
  time: string;
  cashierName: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number; // in sen or rupiah
    totalPrice: number; // in sen or rupiah
  }>;
  subtotal: number;
  discountAmount?: number;
  discountPercent?: number;
  total: number;
  paymentMethod: 'cash' | 'qris';
  amountPaid?: number;
  change?: number;
  footerNote?: string;
}

// 58mm thermal printers standard width: 32 columns
const COLUMN_WIDTH = 32;

/**
 * Format currency helper for receipt text
 */
function formatReceiptMoney(amountInSen: number): string {
  const rupiah = Math.round(amountInSen / 100);
  return `Rp ${rupiah.toLocaleString('id-ID')}`;
}

/**
 * Center align string within column width
 */
function centerText(text: string, width: number = COLUMN_WIDTH): string {
  const trimmed = text.trim();
  if (trimmed.length >= width) return trimmed.substring(0, width);
  const leftPadding = Math.floor((width - trimmed.length) / 2);
  return ' '.repeat(leftPadding) + trimmed;
}

/**
 * Align left and right columns (e.g. item name/qty on left, total on right)
 */
function formatTwoColumns(left: string, right: string, width: number = COLUMN_WIDTH): string {
  const rightStr = right.trim();
  const maxLeftLen = width - rightStr.length - 1;
  let leftStr = left.trim();

  if (leftStr.length > maxLeftLen) {
    leftStr = leftStr.substring(0, maxLeftLen);
  }

  const spacesCount = Math.max(1, width - leftStr.length - rightStr.length);
  return leftStr + ' '.repeat(spacesCount) + rightStr;
}

/**
 * Wrap text into lines of maximum width
 */
function wrapText(text: string, width: number = COLUMN_WIDTH): string[] {
  const lines: string[] = [];
  let remaining = text.trim();

  while (remaining.length > 0) {
    if (remaining.length <= width) {
      lines.push(remaining);
      break;
    }
    // Find last space within limit
    let splitIdx = remaining.lastIndexOf(' ', width);
    if (splitIdx <= 0) {
      splitIdx = width;
    }
    lines.push(remaining.substring(0, splitIdx).trim());
    remaining = remaining.substring(splitIdx).trim();
  }

  return lines;
}

/**
 * Build ESC/POS command buffer for receipt data
 */
export function buildEscPosReceipt(data: ReceiptPrintData): Uint8Array {
  const encoder = new TextEncoder();
  const buffer: number[] = [];

  // ESC/POS Commands
  const ESC_INIT = [0x1b, 0x40]; // Initialize
  const TXT_ALIGN_CENTER = [0x1b, 0x61, 0x01]; // Center
  const TXT_ALIGN_LEFT = [0x1b, 0x61, 0x00]; // Left
  const TXT_BOLD_ON = [0x1b, 0x45, 0x01]; // Bold ON
  const TXT_BOLD_OFF = [0x1b, 0x45, 0x00]; // Bold OFF
  const TXT_DOUBLE_HEIGHT = [0x1b, 0x21, 0x10]; // Double height font
  const TXT_NORMAL = [0x1b, 0x21, 0x00]; // Normal font

  const appendBytes = (bytes: number[]) => {
    buffer.push(...bytes);
  };

  const appendText = (text: string) => {
    const encoded = encoder.encode(text + '\n');
    buffer.push(...Array.from(encoded));
  };

  const lineSeparator = '-'.repeat(COLUMN_WIDTH);
  const doubleSeparator = '='.repeat(COLUMN_WIDTH);

  // 1. Initialize Printer & Set Line Spacing
  appendBytes(ESC_INIT);
  appendBytes([0x1b, 0x33, 38]); // Set line spacing to 38 dots (larger line height)

  // 2. Header (Title & Address) - Center Aligned & Enlarged
  appendBytes(TXT_ALIGN_CENTER);
  appendBytes(TXT_BOLD_ON);
  appendBytes(TXT_DOUBLE_HEIGHT);
  
  const title = data.title || 'Warung Bebek & Ayam Goreng Wanamukti';
  const titleLines = wrapText(title, COLUMN_WIDTH);
  for (const line of titleLines) {
    appendText(line);
  }

  appendBytes(TXT_NORMAL);
  appendBytes(TXT_BOLD_OFF);

  const addressText = data.storeAddress || 'Jl. Wanamukti No. 88, Semarang';
  const addrLines = wrapText(addressText, COLUMN_WIDTH);
  for (const line of addrLines) {
    appendText(line);
  }

  appendText(doubleSeparator);

  // 3. Metadata (Date, Time, Cashier, Order No)
  appendBytes(TXT_ALIGN_LEFT);
  appendText(formatTwoColumns('Tanggal :', `${data.date} ${data.time}`));
  appendText(formatTwoColumns('Kasir   :', data.cashierName));
  appendText(formatTwoColumns('No.Order:', data.orderNumber));
  appendText(lineSeparator);

  // 4. Order Items
  for (const item of data.items) {
    const itemLines = wrapText(item.name, COLUMN_WIDTH);
    for (const line of itemLines) {
      appendText(line);
    }
    const qtyPrice = `  ${item.quantity} x ${formatReceiptMoney(item.unitPrice)}`;
    const itemTotal = formatReceiptMoney(item.totalPrice);
    appendText(formatTwoColumns(qtyPrice, itemTotal));
  }

  appendText(lineSeparator);

  // 5. Totals & Payment Details
  if (data.discountAmount && data.discountAmount > 0) {
    appendText(formatTwoColumns('Subtotal', formatReceiptMoney(data.subtotal)));
    const discountLabel = `Diskon${data.discountPercent ? ` (${data.discountPercent}%)` : ''}`;
    appendText(formatTwoColumns(discountLabel, `-${formatReceiptMoney(data.discountAmount)}`));
  }

  appendBytes(TXT_BOLD_ON);
  appendText(formatTwoColumns('TOTAL', formatReceiptMoney(data.total)));
  appendBytes(TXT_BOLD_OFF);

  if (data.paymentMethod === 'cash') {
    appendText(formatTwoColumns('Bayar Tunai', formatReceiptMoney(data.amountPaid ?? data.total)));
    appendText(formatTwoColumns('Kembali', formatReceiptMoney(data.change ?? 0)));
  } else {
    appendText(formatTwoColumns('Metode Bayar', 'QRIS'));
  }

  appendText(doubleSeparator);

  // 6. Footer - Center Aligned
  appendBytes(TXT_ALIGN_CENTER);
  appendBytes(TXT_BOLD_ON);
  const footer = data.footerNote || 'Terima Kasih atas Kunjungan Anda!';
  const footerLines = wrapText(footer, COLUMN_WIDTH);
  for (const line of footerLines) {
    appendText(line);
  }
  appendBytes(TXT_BOLD_OFF);

  // 7. Feed minimal 2 lines (prevents paper waste) & Cut paper
  appendText('\n\n');
  appendBytes([0x1d, 0x56, 0x41, 0x00]); // GS V A 0 cut paper command

  return new Uint8Array(buffer);
}

/**
 * Check if Web Bluetooth API is supported
 */
export function isBluetoothSupported(): boolean {
  return typeof window !== 'undefined' && 'navigator' in window && 'bluetooth' in navigator;
}

// Known Bluetooth GATT Primary Service UUIDs for thermal printers
const THERMAL_PRINTER_SERVICE_UUIDS = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer Service
  '49535343-fe7d-435e-8d1d-43854421c1b8', // ISSC Transparent Service (HC-05, VSC, POS58)
  '0000e025-0000-1000-8000-00805f9b34fb',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000ff02-0000-1000-8000-00805f9b34fb',
  'e7e90001-4761-4441-b69a-cf4b5e789e3a',
];

/**
 * Connect to Bluetooth Thermal Printer (VSC H-58BT or generic 58mm printer) and send receipt data
 */
export async function printThermalReceiptBluetooth(data: ReceiptPrintData): Promise<{ success: boolean; error?: string }> {
  if (!isBluetoothSupported()) {
    return {
      success: false,
      error: 'Browser ini tidak mendukung Bluetooth Web API. Pastikan menggunakan Chrome/Edge di Android/Tablet.',
    };
  }

  try {
    const rawBytes = buildEscPosReceipt(data);

    // Request Bluetooth Device
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: THERMAL_PRINTER_SERVICE_UUIDS,
    });

    if (!device || !device.gatt) {
      return { success: false, error: 'Perangkat printer Bluetooth tidak ditemukan.' };
    }

    // Connect to GATT Server
    const server = await device.gatt.connect();

    // Discover services and find writeable characteristic
    let targetCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

    const services = await server.getPrimaryServices();
    for (const service of services) {
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          targetCharacteristic = char;
          break;
        }
      }
      if (targetCharacteristic) break;
    }

    if (!targetCharacteristic) {
      server.disconnect();
      return { success: false, error: 'Tidak dapat menemukan layanan cetak pada printer Bluetooth ini.' };
    }

    // Send payload in chunks (100 bytes chunk size for Bluetooth buffer stability)
    const CHUNK_SIZE = 100;
    for (let i = 0; i < rawBytes.length; i += CHUNK_SIZE) {
      const chunk = rawBytes.slice(i, i + CHUNK_SIZE);
      if (targetCharacteristic.properties.writeWithoutResponse) {
        await targetCharacteristic.writeValueWithoutResponse(chunk);
      } else {
        await targetCharacteristic.writeValueWithResponse(chunk);
      }
      // Small pause to prevent tablet buffer overflow
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Disconnect cleanly
    setTimeout(() => {
      if (server.connected) {
        server.disconnect();
      }
    }, 1000);

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Gagal mencetak melalui Bluetooth';
    if (errorMessage.includes('User cancelled') || errorMessage.includes('cancelled')) {
      return { success: false, error: 'Pemilihan perangkat printer dibatalkan.' };
    }
    return { success: false, error: errorMessage };
  }
}

/**
 * Perform a quick connection check & test print for Bluetooth Thermal Printer
 */
export async function testBluetoothPrinterConnection(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
  if (!isBluetoothSupported()) {
    return {
      success: false,
      error: 'Browser ini tidak mendukung Bluetooth Web API. Pastikan menggunakan Chrome/Edge di Android/Tablet.',
    };
  }

  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: THERMAL_PRINTER_SERVICE_UUIDS,
    });

    if (!device || !device.gatt) {
      return { success: false, error: 'Perangkat printer tidak ditemukan.' };
    }

    const server = await device.gatt.connect();

    // Small test print bytes (ESC @ + Text + feed)
    const encoder = new TextEncoder();
    const testBytes = new Uint8Array([
      0x1b, 0x40, // ESC @ Init
      0x1b, 0x61, 0x01, // Center
      ...encoder.encode("=== TES PRINTER GIPOS ===\n"),
      ...encoder.encode("Status: TERHUBUNG OK\n\n\n\n"),
      0x1d, 0x56, 0x41, 0x00 // Cut
    ]);

    let targetChar: BluetoothRemoteGATTCharacteristic | null = null;
    const services = await server.getPrimaryServices();
    for (const service of services) {
      const chars = await service.getCharacteristics();
      for (const c of chars) {
        if (c.properties.write || c.properties.writeWithoutResponse) {
          targetChar = c;
          break;
        }
      }
      if (targetChar) break;
    }

    if (!targetChar) {
      server.disconnect();
      return { success: false, error: 'Layanan cetak printer tidak responsif.' };
    }

    if (targetChar.properties.writeWithoutResponse) {
      await targetChar.writeValueWithoutResponse(testBytes);
    } else {
      await targetChar.writeValueWithResponse(testBytes);
    }

    setTimeout(() => {
      if (server.connected) server.disconnect();
    }, 1000);

    return { success: true, deviceName: device.name || 'Printer Bluetooth' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal cek printer';
    return { success: false, error: msg };
  }
}

